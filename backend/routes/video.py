from flask import Blueprint, jsonify

video_bp = Blueprint("video_bp", __name__, url_prefix="/detect")


@video_bp.post("/video")
def detect_video_route():
    return jsonify({
        "error": "Not implemented yet",
        "hint": "Video detection will be implemented."
    }), 501
