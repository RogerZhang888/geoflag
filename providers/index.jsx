import React from "react";
import ProgressWrapper from "./ProgressWrapper";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";

export const Providers = ({ children }) => {
  return (
    <ProgressWrapper>
      <Header />
      <Toaster richColors />
      {children}
    </ProgressWrapper>
  );
};
