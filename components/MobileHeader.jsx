"use client";
import React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/Sheet";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const MobileHeader = () => {
  const pathname = usePathname();
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="h-6 md:hidden w-6" />
      </SheetTrigger>
      <SheetContent side="right" className="p-6">
        <VisuallyHidden>
          <SheetTitle>Menu</SheetTitle>
        </VisuallyHidden>
        <nav className="flex flex-col items-center justify-center">
          <Link className={cn(buttonVariants({ variant: "ghost" }))} href="/">
            Login
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
export default MobileHeader;
