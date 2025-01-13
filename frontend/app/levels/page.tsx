/* "use client";

import React, { useEffect, useState } from "react";
import { getAllLevels } from "@/services/levels";

export default function LevelsPage() {
  const [levels, setLevels] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(()=>{
    getAllLevels()
      .then(setLevels)
      .catch(err=>setErrorMsg(err.message));
  },[]);

  return (
    <div style={{padding:"10px"}}>
      <h2>Select Level</h2>
      {errorMsg && <p style={{color:"red"}}>{errorMsg}</p>}
      <ul>
        {levels.map(lvl => (
          <li key={lvl}>
            <a href={`/levels/${lvl}`}>{lvl}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
 */