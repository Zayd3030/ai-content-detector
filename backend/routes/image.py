from flask import Blueprint, request, jsonify
from services.image_detector import detect_image

image_bp = Blueprint("image", __name__)

@image_bp.route("/detect/image", methods=["POST"])
def detect_image_route():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Use form-data key 'image'."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    # Read bytes directly 
    img_bytes = file.read()

    result = detect_image(img_bytes)

    return jsonify(result), 200