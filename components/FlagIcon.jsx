import Image from "next/image";
import React from "react";

export default function FlagIcon({ place }) {
  return (
    <Image
      src={`/flags/${place}_flag.png`}
      alt={`${place} flag`}
      width={40}
      height={20}
      className="rounded-xs"
    />
  );
}
