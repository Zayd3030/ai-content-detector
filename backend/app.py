import os
from flask import Flask, jsonify
from flask_cors import CORS

from routes.text import text_bp
from routes.image import image_bp
from routes.video import video_bp


def create_app() -> Flask:
    app = Flask(__name__)

    # Allow frontend dev server
    CORS(app, origins=["http://localhost:5173"])

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    # Register detection blueprints
    app.register_blueprint(text_bp)
    app.register_blueprint(image_bp)
    app.register_blueprint(video_bp)

    return app


app = create_app()

if __name__ == "__main__":
    # Default flask port is 5000
    app.run(host="127.0.0.1", port=5000, debug=True)
