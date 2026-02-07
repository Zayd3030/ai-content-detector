from flask import Flask, jsonify
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)

    CORS(app, origins=["http://localhost:5173"])

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
