import { useState } from "react";

export default function CreatePracticeQuiz() {
  const [pdf, setPdf] = useState(null);

  const generate = async () => {
    const fd = new FormData();
    fd.append("file", pdf);

    await fetch("http://localhost:5001/upload-pdf-generate-games", {
      method: "POST",
      body: fd,
    });

    alert("Practice quiz generated");
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-md">
      <input type="file" accept="application/pdf" onChange={e => setPdf(e.target.files[0])} />
      <button onClick={generate} className="mt-3 bg-green-600 text-white px-4 py-2 rounded">
        Create & Play
      </button>
    </div>
  );
}


