from flask import Blueprint, request, jsonify
from services.image_detector import detect_image

image_bp = Blueprint("image", __name__, url_prefix="/detect")

@image_bp.route("/image", methods=["POST"])
def detect_image_route():
    if "image" not in request.files:
        return jsonify({"error": "Missing file field 'image'"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    result = detect_image(file)
    return jsonify(result), 200