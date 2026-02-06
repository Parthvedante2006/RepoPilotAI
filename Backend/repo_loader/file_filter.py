from pathlib import PurePosixPath


ALLOWED_EXTENSIONS = {
	".py",
	".js",
	".jsx",
	".java",
	".c",
	".cpp",
	".h",
	".md",
	".txt",
	".json",
	".yml",
	".yaml",
	".xml",
    ".html",
	
}

IGNORED_DIRS = {
	".git",
	"node_modules",
	"venv",
	"__pycache__",
	"dist",
	"build",
	".idea",
	".vscode",
}


def is_allowed_path(repo_path: str) -> bool:
	posix_path = PurePosixPath(repo_path)
	if any(part in IGNORED_DIRS for part in posix_path.parts):
		return False

	return posix_path.suffix.lower() in ALLOWED_EXTENSIONS
