import os
import re

WORD_CHUNK_SIZE = 300 

PYTHON_FUNC_PATTERN = re.compile(r"^\s*def\s+(\w+)\s*\(")
PYTHON_CLASS_PATTERN = re.compile(r"^\s*class\s+\w+")
BRACE_FUNC_PATTERN = re.compile(r"([A-Za-z_][A-Za-z0-9_]*)\s*\(")
CONTROL_KEYWORDS = {
    "if",
    "for",
    "while",
    "switch",
    "catch",
    "else",
    "do",
}

FUNC_EXTENSIONS = {".py", ".c", ".cpp", ".h", ".java", ".cs", ".js", ".ts"}


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


def _extract_python_functions(lines):
    functions = []
    for idx, line in enumerate(lines):
        match = PYTHON_FUNC_PATTERN.match(line)
        if not match:
            continue

        name = match.group(1)
        indent = len(line) - len(line.lstrip(" "))
        start = idx
        end = len(lines) - 1

        for j in range(idx + 1, len(lines)):
            next_line = lines[j]
            if PYTHON_FUNC_PATTERN.match(next_line) or PYTHON_CLASS_PATTERN.match(next_line):
                next_indent = len(next_line) - len(next_line.lstrip(" "))
                if next_indent <= indent:
                    end = j - 1
                    break

        code = "".join(lines[start:end + 1]).rstrip()
        functions.append({
            "chunk_type": "function",
            "symbol_name": name,
            "start_line": start + 1,
            "end_line": end + 1,
            "code": code,
        })

    return functions


def _extract_brace_functions(lines):
    functions = []
    idx = 0
    while idx < len(lines):
        line = lines[idx]
        stripped = line.strip()
        lower = stripped.lower()

        if not stripped or any(lower.startswith(k + " ") or lower == k for k in CONTROL_KEYWORDS):
            idx += 1
            continue

        if "(" not in line or ")" not in line or "{" not in line:
            idx += 1
            continue

        name_match = BRACE_FUNC_PATTERN.search(line)
        if not name_match:
            idx += 1
            continue

        name = name_match.group(1)
        start = idx
        brace_count = line.count("{") - line.count("}")
        end = idx

        j = idx + 1
        while j < len(lines) and brace_count > 0:
            brace_count += lines[j].count("{") - lines[j].count("}")
            end = j
            j += 1

        if brace_count <= 0:
            code = "".join(lines[start:end + 1]).rstrip()
            functions.append({
                "chunk_type": "function",
                "symbol_name": name,
                "start_line": start + 1,
                "end_line": end + 1,
                "code": code,
            })
            idx = end + 1
            continue

        idx += 1

    return functions


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

                rel_path = os.path.relpath(file_path, start=temp_folder_path)
                ext = os.path.splitext(file)[1].lower()

                chunk_id = 0

                if ext in FUNC_EXTENSIONS:
                    lines = content.splitlines(keepends=True)
                    if ext == ".py":
                        function_chunks = _extract_python_functions(lines)
                    else:
                        function_chunks = _extract_brace_functions(lines)

                    for chunk in function_chunks:
                        all_chunks.append({
                            "text": chunk["code"],
                            "code": chunk["code"],
                            "chunk_type": chunk["chunk_type"],
                            "symbol_name": chunk["symbol_name"],
                            "file": rel_path,
                            "chunk_id": chunk_id,
                            "start_line": chunk["start_line"],
                            "end_line": chunk["end_line"],
                        })
                        chunk_id += 1

                    if not function_chunks:
                        chunks = chunk_by_words(content)
                        for chunk in chunks:
                            if chunk.strip():
                                all_chunks.append({
                                    "text": chunk,
                                    "chunk_type": "text",
                                    "file": rel_path,
                                    "chunk_id": chunk_id,
                                })
                                chunk_id += 1
                else:
                    chunks = chunk_by_words(content)
                    for chunk in chunks:
                        if chunk.strip():
                            all_chunks.append({
                                "text": chunk,
                                "chunk_type": "text",
                                "file": rel_path,
                                "chunk_id": chunk_id,
                            })
                            chunk_id += 1

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
