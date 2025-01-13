/* // frontend/app/pronunciation/page.tsx
"use client";

import React, { useState } from "react";
import { sendPronunciationAudio } from "@/services/pronunciation"; // путь зависит от вашего настроя
import type { PronunciationResponse } from "@/services/pronunciation";

export default function PronunciationPage() {
  const [exerciseId, setExerciseId] = useState<number>(2); 
  // либо вы получаете ID из query или ещё как-то

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [score, setScore] = useState<number | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [words, setWords] = useState<
    Array<{ word: string; start?: number; end?: number }>
  >([]);

  const [errorMsg, setErrorMsg] = useState<string>("");

  // Вызывается при выборе файла
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setScore(null);
    setRecognizedText("");
    setWords([]);

    if (!audioFile) {
      setErrorMsg("Please select an audio file first.");
      return;
    }

    try {
      setLoading(true);
      const resp: PronunciationResponse = await sendPronunciationAudio(
        exerciseId,
        audioFile
      );
      // Запишем результат
      setScore(resp.score);
      setRecognizedText(resp.recognized_text);
      setWords(resp.words || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pronunciation Check</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Exercise ID:</label>
          <input
            type="number"
            value={exerciseId}
            onChange={(e) => setExerciseId(Number(e.target.value))}
            className="border p-2"
          />
        </div>

        <div className="mb-4">
          <label>Select Audio File:</label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="border p-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2"
        >
          {loading ? "Uploading..." : "Check Pronunciation"}
        </button>
      </form>

      {errorMsg && (
        <div className="text-red-500 mt-4">Error: {errorMsg}</div>
      )}

      {score !== null && (
        <div className="mt-4 border p-2">
          <h2 className="text-xl font-semibold">Result</h2>
          <p>Score: {score}</p>
          <p>Recognized Text: {recognizedText}</p>
          {words.length > 0 && (
            <div>
              <h3 className="font-medium mt-2">Word Timestamps:</h3>
              <ul className="list-disc ml-5">
                {words.map((w, idx) => (
                  <li key={idx}>
                    {w.word} (start: {w.start?.toFixed(2)}s, end:{" "}
                    {w.end?.toFixed(2)}s)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 */


// app/pronunciation/page.tsx
/* "use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

interface Exercise {
  id: number;
  title: string;
  level: string;
  text: string;
  created_at: string;
}

export default function PronunciationHomePage() {
  const router = useRouter();
  const [list, setList] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Проверяем токен
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    api.get("/api/pronunciation/exercises/")
      .then(res=>{
        setList(res.data);
        setLoading(false);
      })
      .catch(err=>{
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      });
  }, [router]);

  if (loading) return <p>Loading exercises...</p>;
  if (error) return <p style={{ color:"red"}}>{error}</p>;

  return (
    <div style={{ padding:20 }}>
      <h2>Pronunciation Exercises</h2>
      <ul>
        {list.map(ex => (
          <li key={ex.id} style={{ marginBottom:8 }}>
            <strong>{ex.title}</strong> (level={ex.level})
            <br/>
            <button onClick={()=>router.push(`/pronunciation/${ex.id}`)}>
              Open
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
 */