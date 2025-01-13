// app/exercises/[level]/page.tsx
/* "use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchExercises, Exercise } from "@/services/exercises";

export default function ExercisesByLevelPage() {
  const router = useRouter();
  const params = useParams();
  const level = params.level as string;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchExercises(level)
      .then(data => {
        setExercises(data);
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, [level]);

  if (loading) return <p style={{ padding: 20 }}>Loading exercises...</p>;
  if (errorMsg) return <p style={{ color: "red", padding: 20 }}>{errorMsg}</p>;

  function handleExerciseClick(exId: number) {
    router.push(`/exercises/${level}/${exId}`);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Exercises for level: {level}</h2>
      {exercises.length === 0 ? (
        <p>No exercises found for this level.</p>
      ) : (
        <ul style={{ marginTop: 10 }}>
          {exercises.map(ex => (
            <li
              key={ex.id}
              onClick={() => handleExerciseClick(ex.id)}
              style={{ cursor: "pointer", textDecoration: "underline", marginBottom: 8 }}
            >
              <b>{ex.title}</b> ({ex.exercise_type})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
 */