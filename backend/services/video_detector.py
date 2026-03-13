import os
import tempfile
import cv2
import numpy as np

from services.image_detector import detect_image


def detect_video(video_bytes: bytes):
    """
    Video detection:
    - save uploaded bytes to temp file
    - sample frames every N frames
    - run image detector on each sampled frame
    - aggregate predictions
    """

    # Save uploaded video to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(video_bytes)
        temp_path = tmp.name

    cap = cv2.VideoCapture(temp_path)

    if not cap.isOpened():
        os.remove(temp_path)
        return {
            "label": "Unknown",
            "confidence": 0.0,
            "predicted_source": "Unknown",
            "source_probs": {},
            "signals": {},
            "explanation": ["Could not open video file."],
            "model": "video-frame-aggregation"
        }

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    # Sample every N frames
    frame_step = 15
    frame_results = []

    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % frame_step == 0:
            # Encode frame to JPEG bytes so we can reuse detect_image()
            success, buffer = cv2.imencode(".jpg", frame)
            if success:
                frame_bytes = buffer.tobytes()
                result = detect_image(frame_bytes)
                frame_results.append({
                    "frame_index": frame_idx,
                    "label": result.get("label", "Unknown"),
                    "confidence": result.get("confidence", 0.0),
                    "predicted_source": result.get("predicted_source", "Unknown")
                })

        frame_idx += 1

    cap.release()
    os.remove(temp_path)

    if not frame_results:
        return {
            "label": "Unknown",
            "confidence": 0.0,
            "predicted_source": "Unknown",
            "source_probs": {},
            "signals": {},
            "explanation": ["No frames could be processed from the uploaded video."],
            "model": "video-frame-aggregation"
        }

    # Convert frame-level outputs into AI probability estimate
    ai_scores = []
    source_counter = {}

    for fr in frame_results:
        label = (fr["label"] or "").lower()
        conf = float(fr.get("confidence", 0.0))

        if "ai" in label:
            ai_prob = conf
        elif "human" in label:
            ai_prob = 1.0 - conf
        else:
            ai_prob = 0.5

        ai_scores.append(ai_prob)

        src = fr.get("predicted_source", "Unknown")
        if src and src != "Unknown":
            source_counter[src] = source_counter.get(src, 0) + 1

    avg_ai_prob = float(np.mean(ai_scores))
    ai_frame_ratio = float(np.mean([1 if s >= 0.5 else 0 for s in ai_scores]))

    # Final decision
    threshold = 0.60
    final_label = "AI-generated" if avg_ai_prob >= threshold else "Human-made"

    predicted_source = "Unknown"
    if source_counter:
        predicted_source = max(source_counter, key=source_counter.get)

    return {
        "label": final_label,
        "confidence": avg_ai_prob if final_label == "AI-generated" else 1.0 - avg_ai_prob,
        "predicted_source": predicted_source,
        "source_probs": source_counter,
        "signals": {
            "total_frames": float(total_frames),
            "fps": float(fps) if fps else 0.0,
            "sampled_frames": float(len(frame_results)),
            "average_ai_probability": avg_ai_prob,
            "ai_frame_ratio": ai_frame_ratio
        },
        "frame_results": frame_results[:20],  # return first 20 for UI/debug
        "explanation": [
            "Video was analysed by sampling frames at regular intervals.",
            "Each sampled frame was passed through the image detection module.",
            "Frame-level AI probabilities were aggregated to produce the final video-level prediction."
        ],
        "model": "video-frame-aggregation"
    }