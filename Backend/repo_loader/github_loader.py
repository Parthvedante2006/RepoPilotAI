import base64
import os
import re
import shutil
import tempfile
from pathlib import Path
from typing import Dict

import requests

try:
	from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional dependency
	def load_dotenv(dotenv_path=None):
		"""Fallback if python-dotenv not installed"""
		import warnings
		warnings.warn("python-dotenv not installed")
		return False

try:
	from .file_filter import is_allowed_path
except ImportError:
	from file_filter import is_allowed_path


GITHUB_API_BASE = "https://api.github.com"


def _parse_repo_url(repo_url: str) -> Dict[str, str]:
	match = re.match(r"^https?://github\.com/([^/]+)/([^/#]+)", repo_url.strip())
	if not match:
		raise ValueError("repo_url must look like https://github.com/owner/repo")

	owner, repo = match.group(1), match.group(2)
	if repo.endswith(".git"):
		repo = repo[:-4]

	return {"owner": owner, "repo": repo}


def _github_headers() -> Dict[str, str]:
	backend_dir = Path(__file__).resolve().parents[1]
	env_file = backend_dir / ".env"
	print(f"[DEBUG] Looking for .env at: {env_file}")
	print(f"[DEBUG] File exists: {env_file.exists()}")
	
	if env_file.exists():
		result = load_dotenv(env_file)
		print(f"[DEBUG] load_dotenv returned: {result}")
	
	token = os.getenv("GITHUB_TOKEN")
	print(f"[DEBUG] Token from env: {token[:20] if token else 'NOT FOUND'}...")
	
	headers = {
		"Accept": "application/vnd.github+json",
		"User-Agent": "RepoPilotAI",
	}
	if token:
		headers["Authorization"] = f"token {token}"
		print(f"[DEBUG] Auth header set (token length: {len(token)})")
	else:
		print("[DEBUG] WARNING: No GITHUB_TOKEN found!")

	return headers


def _get_default_branch(owner: str, repo: str, headers: Dict[str, str]) -> str:
	response = requests.get(
		f"{GITHUB_API_BASE}/repos/{owner}/{repo}",
		headers=headers,
		timeout=30,
	)
	if response.status_code != 200:
		raise RuntimeError(_format_github_error("GitHub repo lookup failed", response))

	data = response.json()
	branch = data.get("default_branch")
	if not branch:
		raise RuntimeError("GitHub repo lookup did not return a default branch")

	return branch


def _get_repo_tree(owner: str, repo: str, branch: str, headers: Dict[str, str]) -> list:
	response = requests.get(
		f"{GITHUB_API_BASE}/repos/{owner}/{repo}/git/trees/{branch}",
		params={"recursive": "1"},
		headers=headers,
		timeout=30,
	)
	if response.status_code != 200:
		raise RuntimeError(_format_github_error("GitHub tree lookup failed", response))

	data = response.json()
	return data.get("tree", [])


def _download_file_content(
	owner: str,
	repo: str,
	branch: str,
	path: str,
	headers: Dict[str, str],
) -> str:
	response = requests.get(
		f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}",
		params={"ref": branch},
		headers=headers,
		timeout=30,
	)
	if response.status_code != 200:
		raise RuntimeError(_format_github_error("GitHub content lookup failed", response))

	data = response.json()
	if data.get("encoding") != "base64":
		raise RuntimeError("GitHub content response missing base64 encoding")

	encoded = data.get("content", "")
	decoded = base64.b64decode(encoded)
	return decoded.decode("utf-8", errors="ignore")


def _format_github_error(prefix: str, response: requests.Response) -> str:
	remaining = response.headers.get("X-RateLimit-Remaining")
	reset = response.headers.get("X-RateLimit-Reset")
	message = response.json().get("message", "") if response.headers.get("Content-Type", "").startswith("application/json") else ""

	parts = [f"{prefix}: {response.status_code}"]
	if message:
		parts.append(f"message={message}")
	if remaining is not None:
		parts.append(f"rate_remaining={remaining}")
	if reset is not None:
		parts.append(f"rate_reset={reset}")
	if response.status_code == 403:
		parts.append("hint=Set GITHUB_TOKEN to avoid rate limits or access private repos")

	return " | ".join(parts)


def load_github_repo(repo_url: str) -> Dict[str, str]:
	if not repo_url or not isinstance(repo_url, str):
		raise ValueError("repo_url must be a non-empty string")

	repo_info = _parse_repo_url(repo_url)
	headers = _github_headers()
	branch = _get_default_branch(repo_info["owner"], repo_info["repo"], headers)

	backend_dir = Path(__file__).resolve().parents[1]
	repo_temp_dir = backend_dir / "data" / "repo_temp"
	repo_temp_dir.mkdir(parents=True, exist_ok=True)
	
	temp_path = Path(tempfile.mkdtemp(prefix="repopilot_", dir=repo_temp_dir))
	files_count = 0

	print(f"[DEBUG] Owner: {repo_info['owner']}, Repo: {repo_info['repo']}, Branch: {branch}")
	print(f"[DEBUG] Temp path: {temp_path}")

	try:
		repo_tree = _get_repo_tree(
			repo_info["owner"],
			repo_info["repo"],
			branch,
			headers,
		)
		print(f"[DEBUG] Found {len(repo_tree)} total files in repo")
		filtered_count = 0
		for item in repo_tree:
			if item.get("type") != "blob":
				continue
			path = item.get("path", "")
			if not path:
				continue
			
			if not is_allowed_path(path):
				filtered_count += 1
				continue

			print(f"[DEBUG] Downloading: {path}")
			content = _download_file_content(
				repo_info["owner"],
				repo_info["repo"],
				branch,
				path,
				headers,
			)
			file_path = temp_path / path
			file_path.parent.mkdir(parents=True, exist_ok=True)
			file_path.write_text(content, encoding="utf-8", errors="ignore")
			files_count += 1
		print(f"[DEBUG] Filtered out {filtered_count} files (not in allowed list)")
		print(f"[DEBUG] Successfully downloaded {files_count} files")
	except Exception:
		shutil.rmtree(temp_path, ignore_errors=True)
		raise

	return {"temp_path": str(temp_path), "files_count": files_count}


if __name__ == "__main__":
	import argparse

	parser = argparse.ArgumentParser(description="Download a GitHub repo into a temp folder.")
	parser.add_argument("repo_url", help="GitHub repository URL")
	args = parser.parse_args()

	result = load_github_repo(args.repo_url)
	print(result)
