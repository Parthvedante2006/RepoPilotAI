import os
import re

WORD_CHUNK_SIZE = 300 


def chunk_by_words(text, max_words=WORD_CHUNK_SIZE):
    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = start + max_words
        chunks.append(" ".join(words[start:end]))
        start = end

    return chunks


def _split_by_structure(text, pattern):
    parts = re.split(pattern, text, flags=re.MULTILINE)

    chunks = []
    current = ""

    for part in parts:
        if re.match(pattern, part, flags=re.MULTILINE):
            if current.strip():
                chunks.append(current)
            current = part
        else:
            current += part

    if current.strip():
        chunks.append(current)

    return chunks


def chunk_python_by_structure(text):
    pattern = r"(^\s*(?:class|def)\s+\w+)"
    return _split_by_structure(text, pattern)


def chunk_by_structure_generic(text):
    pattern = r"(^\s*(?:(?:export|async)\s+)?(?:public|private|protected|static|final|abstract|const)?\s*(?:class|function|struct|interface|enum)\s+\w+)"
    if not re.search(pattern, text, flags=re.MULTILINE):
        return []
    return _split_by_structure(text, pattern)


def _latest_repo_temp_dir(base_dir: str) -> str:
    if not base_dir:
        raise ValueError("base_dir is required")

    if not os.path.isdir(base_dir):
        raise FileNotFoundError(f"repo_temp folder not found: {base_dir}")

    candidates = []
    for name in os.listdir(base_dir):
        full_path = os.path.join(base_dir, name)
        if os.path.isdir(full_path) and name.startswith("repopilot_"):
            candidates.append(full_path)

    if not candidates:
        raise FileNotFoundError(f"No repopilot_* folders found in: {base_dir}")

    return max(candidates, key=lambda p: os.path.getmtime(p))


def chunk_repo(temp_folder_path=None):
    if not temp_folder_path:
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        base_dir = os.path.join(backend_dir, "data", "repo_temp")
        temp_folder_path = _latest_repo_temp_dir(base_dir)

    all_chunks = []

    for root, _, files in os.walk(temp_folder_path):
        for file in files:
            file_path = os.path.join(root, file)

            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                if not content.strip():
                    continue

                if file.endswith(".py"):
                    chunks = chunk_python_by_structure(content)
                else:
                    chunks = chunk_by_structure_generic(content) or chunk_by_words(content)

                rel_path = os.path.relpath(file_path, start=temp_folder_path)
                for idx, chunk in enumerate(chunks):
                    if chunk.strip():
                        all_chunks.append({
                            "text": chunk,
                            "file": rel_path,
                            "chunk_id": idx
                        })

            except Exception as e:
                print(f"Skipping {file_path}: {e}")

    return all_chunks


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Chunk files from a repo temp folder.")
    parser.add_argument(
        "temp_folder_path",
        nargs="?",
        help="Path to temp folder (defaults to latest repopilot_* in Backend/data/repo_temp)",
    )
    args = parser.parse_args()

    chunks = chunk_repo(args.temp_folder_path)
    print({"chunks_count": len(chunks)})
