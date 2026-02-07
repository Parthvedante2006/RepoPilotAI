import os
import re


FRAMEWORK_HINTS = {
    "flask": [r"\bflask\b", r"from\s+flask\s+import"],
    "django": [r"\bdjango\b", r"from\s+django\s+import"],
    "fastapi": [r"\bfastapi\b", r"from\s+fastapi\s+import"],
    "spring": [r"\bspring\b", r"@SpringBootApplication"],
    "react": [r"\breact\b", r"from\s+react\s+import"],
    "angular": [r"@angular", r"\bangular\b"],
    "vue": [r"\bvue\b", r"createApp\("],
    "express": [r"\bexpress\b", r"require\(['\"]express['\"]\)"],
    "nest": [r"@nestjs", r"\bNestFactory\b"],
    "dotnet": [r"\bSystem\.Windows\.Forms\b", r"\bWPF\b", r"\bWinForms\b"],
}

EXTENSION_LANG = {
    ".py": "Python",
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".java": "Java",
    ".cs": "C#",
    ".cpp": "C++",
    ".c": "C",
    ".h": "C/C++",
    ".go": "Go",
    ".rb": "Ruby",
    ".php": "PHP",
    ".rs": "Rust",
}

ENTRY_POINTS = {
    "app.py",
    "main.py",
    "index.js",
    "server.js",
    "app.js",
    "main.js",
    "program.cs",
    "startup.cs",
}

STOPWORDS = {
    "the", "and", "for", "with", "from", "that", "this", "these", "those",
    "into", "over", "under", "about", "using", "use", "used", "make", "made",
    "file", "files", "class", "classes", "function", "functions", "method", "methods",
    "data", "info", "project", "repo", "module", "modules", "service", "services",
}


def _tokenize(text):
    tokens = re.split(r"[^A-Za-z0-9]+", text)
    return [t.lower() for t in tokens if t and len(t) >= 3]


def _extract_keywords(file_paths):
    keywords = []
    for path in file_paths:
        base = os.path.splitext(os.path.basename(path))[0]
        keywords.extend(_tokenize(base))
    return keywords


def _extract_entities(chunks):
    entities = []
    pattern = re.compile(r"\b(class|struct|interface|enum)\s+(\w+)")
    for chunk in chunks:
        text = chunk.get("text", "")
        for _, name in pattern.findall(text):
            entities.append(name)
    return entities


def _detect_frameworks(chunks):
    found = set()
    texts = "\n".join(chunk.get("text", "") for chunk in chunks)
    for framework, patterns in FRAMEWORK_HINTS.items():
        for pattern in patterns:
            if re.search(pattern, texts, flags=re.IGNORECASE):
                found.add(framework)
                break
    return sorted(found)


def _detect_languages(file_paths):
    langs = set()
    for path in file_paths:
        ext = os.path.splitext(path)[1].lower()
        lang = EXTENSION_LANG.get(ext)
        if lang:
            langs.add(lang)
    return sorted(langs)


def _top_level_dirs(file_paths):
    dirs = set()
    for path in file_paths:
        parts = path.replace("\\", "/").split("/")
        if len(parts) > 1:
            dirs.add(parts[0])
    return sorted(dirs)


def _entry_points(file_paths):
    entries = []
    for path in file_paths:
        name = os.path.basename(path).lower()
        if name in ENTRY_POINTS:
            entries.append(path)
    return sorted(set(entries))


def extract_overview_signals(chunks):
    file_paths = [chunk.get("file", "") for chunk in chunks if chunk.get("file")]
    languages = _detect_languages(file_paths)
    frameworks = _detect_frameworks(chunks)
    top_dirs = _top_level_dirs(file_paths)
    entries = _entry_points(file_paths)

    keywords = _extract_keywords(file_paths)
    entities = _extract_entities(chunks)

    merged_keywords = keywords + [e.lower() for e in entities]
    merged_keywords = [k for k in merged_keywords if k not in STOPWORDS]

    keyword_freq = {}
    for word in merged_keywords:
        keyword_freq[word] = keyword_freq.get(word, 0) + 1

    top_keywords = sorted(keyword_freq, key=keyword_freq.get, reverse=True)[:12]

    return {
        "languages": languages,
        "frameworks": frameworks,
        "entry_points": entries,
        "top_level_dirs": top_dirs,
        "keywords": top_keywords,
    }
