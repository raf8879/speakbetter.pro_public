"use client";
import React from "react";
import { ReactMediaRecorder } from "react-media-recorder";

interface RecorderProps {
  exerciseId: number;
  onStopRecording?: (blobUrl: string, blob: Blob) => void;
}

export default function Recorder({ exerciseId, onStopRecording }: RecorderProps) {
  return (
    <ReactMediaRecorder
      audio
      onStop={onStopRecording}
      render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
        <div>
          <p>Recorder status: {status}</p>
          <button onClick={startRecording}>Start</button>
          <button onClick={stopRecording} style={{ marginLeft: 8 }}>
            Stop
          </button>
          {mediaBlobUrl && <audio src={mediaBlobUrl} controls />}
        </div>
      )}
    />
  );
}
