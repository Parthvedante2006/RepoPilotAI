const API_BASE = "http://localhost:5000";

export async function indexRepo(repoUrl) {
  const res = await fetch(`${API_BASE}/index_repo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl }),
  });

  return await res.json();
}

export async function askQuestion(question) {
  const res = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  return await res.json();
}


