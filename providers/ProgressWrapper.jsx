"use client";

import { ProgressProvider } from "@bprogress/next/app";

export default function ProgressWrapper({ children }) {
  return (
    <ProgressProvider
      height="2px"
      color="#0085c7"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
