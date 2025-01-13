/* "use client";


import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getExerciseDetail, Exercise } from "@/services/exercises";
import { sendPronunciationAudio } from "@/services/attempt";
import { AudioRecorder } from "react-audio-voice-recorder";

export default function ReadingExercisePage() {
  const params = useParams(); // { level: 'B1', exerciseId: '3' }
  const level = params.level as string;
  const exerciseId = parseInt(params.exerciseId, 10);

  const [exercise, setExercise] = useState<Exercise| null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  useEffect(()=>{
    getExerciseDetail(exerciseId)
      .then(setExercise)
      .catch(err=>setErrorMsg(err.message));
  },[exerciseId]);

  const onRecordingComplete = async (blob: Blob) => {
    console.log("Recorded blob:", blob);
    try {
      const file = new File([blob], "speech.wav", {type: blob.type});
      setInfoMsg("Sending audio...");
      const resp = await sendPronunciationAudio(exerciseId, file);
      setInfoMsg(`Score: ${resp.score}\nRecognized: ${resp.recognized_text}`);
    } catch(err:any) {
      setErrorMsg(err.message);
      setInfoMsg("");
    }
  };

  return (
    <div style={{padding:"10px"}}>
      <h2>Reading: Level {level}, Exercise {exerciseId}</h2>
      {errorMsg && <p style={{color:"red"}}>{errorMsg}</p>}
      {exercise ? (
        <div style={{border:"1px solid #ccc", padding:"10px", marginTop:"10px"}}>
          <h3>{exercise.title} ({exercise.level})</h3>
          <p style={{whiteSpace:"pre-wrap"}}>{exercise.text}</p>
        </div>
      ) : (
        <p>Loading exercise...</p>
      )}

      <div style={{marginTop:"10px"}}>
        <AudioRecorder
          onRecordingComplete={onRecordingComplete}
        />
      </div>

      {infoMsg && (
        <p style={{marginTop:"10px", whiteSpace:"pre-wrap", color:"green"}}>
          {infoMsg}
        </p>
      )}
    </div>
  );
}
 */

/* "use client"; // сообщаем Next, что это Client Component, без SSR

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ReactMediaRecorder } from "react-media-recorder";

import { getExerciseDetail } from "@/services/exercises";   // ваш сервис
import { sendPronunciationAudio } from "@/services/attempt"; // ваш сервис

export default function ReadingExercisePage() {
  const params = useParams(); 
  const level = params.level as string;         // A1, B1, B2, etc.
  const exerciseId = parseInt(params.exerciseId, 10);

  const [exercise, setExercise] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  useEffect(()=>{
    // Получаем текст упражнения
    getExerciseDetail(exerciseId)
      .then((ex) => setExercise(ex))
      .catch((err) => setErrorMsg(err.message));
  },[exerciseId]);

  // Функция, которую передаём onStop => когда пользователь остановил запись
  const handleStopRecording = async (blobUrl: string, blob: Blob) => {
    console.log("Stopped recording. blobUrl=", blobUrl);
    try {
      // Создаём File из Blob
      const audioFile = new File([blob], "speech.wav", { type: blob.type });
      setInfoMsg("Sending audio to server...");

      // Отправляем на бэкенд
      const resp = await sendPronunciationAudio(exerciseId, audioFile);

      setInfoMsg(`Score: ${resp.score}\nRecognized: ${resp.recognized_text}`);
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err.message);
      setInfoMsg("");
    }
  };

  if (errorMsg) {
    return <p style={{ color:"red" }}>{errorMsg}</p>;
  }

  return (
    <div style={{ padding:"10px" }}>
      <h2>Reading: Level {level}, Exercise {exerciseId}</h2>

      {exercise ? (
        <div style={{border:"1px solid #ccc", padding:"10px"}}>
          <h3>{exercise.title} ({exercise.level})</h3>
          <p style={{whiteSpace:"pre-wrap"}}>{exercise.text}</p>
        </div>
      ) : (
        <p>Loading exercise...</p>
      )}

      <div style={{ marginTop:"10px" }}>
        <ReactMediaRecorder
          audio
          blobPropertyBag={{ type: "audio/wav" }}
          onStop={handleStopRecording}
          render={({
            status,
            startRecording,
            stopRecording,
            mediaBlobUrl,
          }) => (
            <div>
              <p>Status: {status}</p>
              <button onClick={startRecording}>Start Recording</button>
              <button onClick={stopRecording} style={{ marginLeft:"10px" }}>
                Stop Recording
              </button>
              {mediaBlobUrl && (
                <div style={{ marginTop:"10px" }}>
                  <audio src={mediaBlobUrl} controls />
                </div>
              )}
            </div>
          )}
        />
      </div>

      {infoMsg && (
        <p style={{marginTop:"10px", whiteSpace:"pre-wrap", color:"green"}}>
          {infoMsg}
        </p>
      )}
    </div>
  );
}
 */


/* "use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ReactMediaRecorder } from "react-media-recorder";

import { getExerciseDetail } from "@/services/exercises";
import { sendPronunciationAudio } from "@/services/attempt";

export default function ReadingExercisePage() {
  const params = useParams();
  const level = params.level as string;
  const exerciseId = parseInt(params.exerciseId as string, 10);

  const [exercise, setExercise] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // Загружаем упражнение
  useEffect(()=>{
    getExerciseDetail(exerciseId)
      .then((ex) => setExercise(ex))
      .catch((err) => setErrorMsg(err.message));
  },[exerciseId]);

  // При остановке записи
  const handleStopRecording = async (blobUrl: string, blob: Blob) => {
    try {
      setInfoMsg("Sending audio to server...");

      // Создаём File
      const audioFile = new File([blob], "speech.wav", { type: blob.type });

      // Отправляем
      const resp = await sendPronunciationAudio(exerciseId, audioFile);

      setInfoMsg(`Score: ${resp.score}\nRecognized: ${resp.recognized_text}`);
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err.message);
      setInfoMsg("");
    }
  };

  if (errorMsg) {
    return <p style={{ color:"red"}}>{errorMsg}</p>;
  }

  return (
    <div style={{ padding:"10px" }}>
      <h2>Reading: Level {level}, Ex ID={exerciseId}</h2>

      {exercise ? (
        <>
          <h3>{exercise.title} ({exercise.level})</h3>
          <p style={{whiteSpace:"pre-wrap"}}>{exercise.text}</p>
        </>
      ) : (
        <p>Loading exercise...</p>
      )}

      <ReactMediaRecorder
        audio
        blobPropertyBag={{ type: "audio/wav" }}
        onStop={handleStopRecording}
        render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
          <div style={{ marginTop:"10px" }}>
            <p>Status: {status}</p>
            <button onClick={startRecording}>Start</button>
            <button onClick={stopRecording} style={{ marginLeft:"10px" }}>
              Stop
            </button>
            {mediaBlobUrl && (
              <div style={{ marginTop:"10px" }}>
                <audio src={mediaBlobUrl} controls />
              </div>
            )}
          </div>
        )}
      />

      {infoMsg && (
        <p style={{ marginTop:10, whiteSpace:"pre-wrap", color:"green" }}>
          {infoMsg}
        </p>
      )}
    </div>
  );
}
 */