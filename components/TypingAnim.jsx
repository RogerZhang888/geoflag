import React, { useState, useEffect } from "react";

export default function TypingAnim({ text }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!text) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;

      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 3); // adjust typing speed
    return () => clearInterval(interval);
  }, [text]);

  return <div className="text-md text-slate-500">{displayed}</div>;
}
