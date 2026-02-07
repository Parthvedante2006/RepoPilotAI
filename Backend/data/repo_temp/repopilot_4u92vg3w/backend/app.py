from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

from services.quiz_generator import generate_quiz
from services.pdf_reader import extract_text_from_pdf
from services.game_master import generate_all_games
from services.chatbot import chatbot_reply



app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "Backend running"})

@app.route("/upload-pdf-generate-games", methods=["POST"])
def upload_pdf_generate_games():
    try:
        pdf_file = request.files.get("file")
        extra_text = request.form.get("extraText", "")
        difficulty = request.form.get("difficulty", "medium")

        if not pdf_file and not extra_text.strip():
            return jsonify({"error": "PDF or text required"}), 400

        text = ""
        total_pages = 0

        if pdf_file:
            filename = secure_filename(pdf_file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            pdf_file.save(file_path)

            text, total_pages = extract_text_from_pdf(
                file_path, extra_text
            )
        else:
            text = extra_text

        quiz = generate_quiz(text, difficulty)

        if not quiz:
            return jsonify({"error": "Quiz generation failed"}), 500

        games = generate_all_games(quiz)

        return jsonify({
            "message": "Quiz generated successfully",
            "total_pages_used": total_pages,
            "total_questions": len(quiz),
            "games": games
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        print("SERVER ERROR:", e)
        return jsonify({"error": "Internal server error"}), 500
    


@app.route("/chatbot", methods=["POST"])
def chatbot_api():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({
            "reply": "Please ask a question about the project or any topic."
        }), 400

    try:
        reply = chatbot_reply(message)
        return jsonify({"reply": reply})
    except Exception as e:
        print("Chatbot error:", e)
        return jsonify({
            "reply": "Sorry, I couldn't respond right now."
        }), 500
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)




