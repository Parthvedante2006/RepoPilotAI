const API_URL = "http://localhost:5001/upload-pdf-generate-games";

export async function generateQuizAPI({ pdf, difficulty }) {
  const formData = new FormData();
  formData.append("file", pdf);
  formData.append("difficulty", difficulty);

  const res = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Quiz generation failed");
  }

  return res.json();
}
