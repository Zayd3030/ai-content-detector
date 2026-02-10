from flask import Blueprint, request, jsonify

from services.text_detector import detect_text

text_bp = Blueprint("text_bp", __name__, url_prefix="/detect")


@text_bp.post("/text")
def detect_text_route():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"error": "Missing 'text' in JSON body"}), 400

    result = detect_text(text)
    return jsonify(result), 200
