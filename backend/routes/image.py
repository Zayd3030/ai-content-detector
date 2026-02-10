from flask import Blueprint, jsonify

image_bp = Blueprint("image_bp", __name__, url_prefix="/detect")


@image_bp.post("/image")
def detect_image_route():
    return jsonify({
        "error": "Not implemented yet",
        "hint": "Image detection will be implemented"
    }), 501
