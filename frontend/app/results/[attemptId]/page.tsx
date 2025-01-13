/* "use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ResultPage() {
  const params = useParams();
  const attemptId = parseInt(params.attemptId, 10);
  const [score, setScore] = useState(0);
  const [words, setWords] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(()=>{
    // Пример: GET /api/pronunciation/attempts/<attemptId>?
    fetch(`http://127.0.0.1:8000/api/pronunciation/attempts/${attemptId}`)
      .then(r=>r.json())
      .then((data)=>{
        setScore(data.score);
        setWords(data.words || []);
      })
      .catch(e=>setErrorMsg(e.message));
  },[attemptId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl">Result for Attempt #{attemptId}</h1>
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      <p>Score: {score}</p>
      <div className="mt-2">
        {words.map((w, idx)=>(
          <span
            key={idx}
            className={
              w.status === "ok" ? "bg-green-300" :
              w.status === "mispronounced" ? "bg-red-300" : ""
            }
          >
            {w.word}{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
 */
/* "use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/services/api";  // <-- ВАЖНО: ваш общий axios-инстанс

export default function ResultPage() {
  const params = useParams();
  const attemptId = parseInt(params.attemptId, 10);

  const [score, setScore] = useState(0);
  const [words, setWords] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Вместо fetch -> api.get
    api.get(`/api/pronunciation/attempts/${attemptId}`)
      .then((res) => {
        // Предположим, бэкенд возвращает { score, words }
        setScore(res.data.score);
        setWords(res.data.words || []);
      })
      .catch((err) => {
        // Если у вас на бэке есть поле .error или что-то ещё — подставляйте
        setErrorMsg(err.response?.data?.error || err.message);
      });
  }, [attemptId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl">Result for Attempt #{attemptId}</h1>
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      <p>Score: {score}</p>
      <div className="mt-2">
        {words.map((w, idx) => (
          <span
            key={idx}
            className={
              w.status === "ok"
                ? "bg-green-300"
                : w.status === "mispronounced"
                ? "bg-red-300"
                : ""
            }
          >
            {w.word}{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
 */