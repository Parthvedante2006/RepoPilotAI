import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"
_model = None


def _get_model():
    global _model
    if _model is None:
        print(f"Loading embedding model: {MODEL_NAME}...")
        _model = SentenceTransformer(MODEL_NAME)
        print("Model loaded successfully.")
    return _model


def embed_texts(texts):
    model = _get_model()
    vectors = model.encode(texts, show_progress_bar=True)
    return vectors.tolist()


def create_embeddings(chunks):
    if not chunks:
        return []

    texts = [chunk["text"] for chunk in chunks]
    vectors = embed_texts(texts)

    embedded_chunks = []
    for i, chunk in enumerate(chunks):
        embedded_chunks.append({
            "text": chunk["text"],
            "file": chunk["file"],
            "chunk_id": chunk["chunk_id"],
            "vector": vectors[i]
        })

    return embedded_chunks


if __name__ == "__main__":
    import argparse
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "chunking"))
    from chunker import chunk_repo

    parser = argparse.ArgumentParser(description="Generate embeddings for repo chunks.")
    parser.add_argument(
        "temp_folder_path",
        nargs="?",
        help="Path to temp folder (defaults to latest repopilot_* in Backend/data/repo_temp)",
    )
    args = parser.parse_args()

    print("Step 1: Loading chunks...")
    chunks = chunk_repo(args.temp_folder_path)
    print(f"Loaded {len(chunks)} chunks\n")

    print("Step 2: Generating embeddings...")
    embedded_chunks = create_embeddings(chunks)
    print(f"Generated embeddings for {len(embedded_chunks)} chunks\n")

    print("Sample output:")
    if embedded_chunks:
        sample = embedded_chunks[0]
        print(f"  File: {sample['file']}")
        print(f"  Chunk ID: {sample['chunk_id']}")
        print(f"  Text preview: {sample['text'][:80]}...")
        print(f"  Vector dimension: {len(sample['vector'])}")
