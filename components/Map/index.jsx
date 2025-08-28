"use client";
import { useState, useEffect } from "react";

export default function MapWrapper(props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <p>Loading map…</p>;

  const Map = require("./Map").default;
  return <Map {...props} />;
}
