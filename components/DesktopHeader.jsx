"use client";
import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const DesktopHeader = () => {
  return (
    <nav className="w-full h-full items-center justify-between hidden md:flex">
      <div className="w-full justify-end gap-4 flex">
        <Link
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          href="/login"
        >
          Login
        </Link>
      </div>
    </nav>
  );
};

export default DesktopHeader;
