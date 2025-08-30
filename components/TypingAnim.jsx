import React, { useState, useEffect } from "react";

export default function TypingAnim({ text }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i === text.length - 1) {
        clearInterval(interval);
        return;
      }
      setDisplayed((prev) => prev + text[i]);
      i++;
    }, 5); // adjust typing speed
    return () => clearInterval(interval);
  }, [text]);

  return <div className="text-md text-slate-500">{displayed}</div>;
}
