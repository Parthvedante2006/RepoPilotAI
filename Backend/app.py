import os
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE_DIR, "repo_loader"))
sys.path.insert(0, os.path.join(BASE_DIR, "chunking"))
sys.path.insert(0, os.path.join(BASE_DIR, "embeddings"))
sys.path.insert(0, os.path.join(BASE_DIR, "vector_db"))
sys.path.insert(0, os.path.join(BASE_DIR, "rag"))
sys.path.insert(0, os.path.join(BASE_DIR, "reasoning"))
sys.path.insert(0, os.path.join(BASE_DIR, "generator"))

from github_loader import load_github_repo
from chunker import chunk_repo
from embedder import create_embeddings
from faiss_index import FaissIndex
from retriever import Retriever
from query_decomposer import QueryDecomposer
from safety_check import SafetyCheck
from prompt_builder import build_prompt
from answer_generator import AnswerGenerator


FAISS_INDEX_PATH = os.path.join(BASE_DIR, "data", "vector_store", "index.faiss")
API_PORT = int(os.getenv("PORT", "5001"))
DEBUG_MODE = os.getenv("FLASK_DEBUG", "false").lower() == "true"

app = Flask(__name__)
CORS(app)

retriever_instance = None
answer_generator_instance = None
query_decomposer = QueryDecomposer()
safety_checker = SafetyCheck()


def _get_retriever():
    global retriever_instance
    if retriever_instance is None:
        retriever_instance = Retriever(faiss_index_path=FAISS_INDEX_PATH)
    return retriever_instance


def _get_answer_generator():
    global answer_generator_instance
    if answer_generator_instance is None:
        answer_generator_instance = AnswerGenerator()
    return answer_generator_instance


@app.route("/index_repo", methods=["POST"])
def index_repo():
    payload = request.get_json(silent=True) or {}
    repo_url = payload.get("repo_url")

    try:
        temp_folder_path = None
        files_count = None

        if repo_url:
            result = load_github_repo(repo_url)
            temp_folder_path = result["temp_path"]
            files_count = result["files_count"]

        chunks = chunk_repo(temp_folder_path)
        if not chunks:
            return jsonify({
                "success": False,
                "message": "No chunks created. Check if files match allowed extensions."
            }), 400

        embedded_chunks = create_embeddings(chunks)
        faiss_index = FaissIndex(index_path=FAISS_INDEX_PATH)
        faiss_index.add(embedded_chunks)
        faiss_index.save()

        global retriever_instance
        retriever_instance = Retriever(faiss_index_path=FAISS_INDEX_PATH)

        return jsonify({
            "success": True,
            "message": "Indexing complete",
            "files_count": files_count,
            "chunks_count": len(chunks),
            "index_path": faiss_index.index_path
        })
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500


@app.route("/ask", methods=["POST"])
def ask_question():
    payload = request.get_json(silent=True) or {}
    question = payload.get("question", "").strip()

    if not question:
        return jsonify({"success": False, "message": "question is required"}), 400

    try:
        retriever = _get_retriever()
        chunks = retriever.retrieve(question, top_k=int(payload.get("top_k", 5)))

        question_type = query_decomposer.decompose(question)
        safety_result = safety_checker.check(question_type, chunks)

        if not safety_result.get("allowed"):
            return jsonify({
                "success": False,
                "message": safety_result.get("reason", "Unsafe to answer"),
                "question_type": question_type,
                "safety": safety_result,
            }), 200

        prompt = build_prompt(question, chunks)
        generator = _get_answer_generator()
        answer = generator.generate(prompt)

        return jsonify({
            "success": True,
            "answer": answer,
            "question_type": question_type,
            "safety": safety_result,
            "chunks_used": len(chunks),
        })
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=API_PORT, debug=DEBUG_MODE)