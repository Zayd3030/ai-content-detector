from flask import Blueprint, request, jsonify
from services.video_detector import detect_video

video_bp = Blueprint("video", __name__)

@video_bp.route("/detect/video", methods=["POST"])
def detect_video_route():
    if "video" not in request.files:
        return jsonify({"error": "No video file provided. Use form-data key 'video'."}), 400

    f = request.files["video"]

    if f.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    video_bytes = f.read()
    result = detect_video(video_bytes)

    return jsonify(result), 200