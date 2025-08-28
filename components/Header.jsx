import React from "react";
import Link from "next/link";
import MobileHeader from "@/components/MobileHeader";
import DesktopHeader from "@/components/DesktopHeader";
import Image from "next/image";
import { BG_WHITE_NOISE, cn } from "@/lib/utils";

const Header = () => {
  return (
    <header
      className={cn(
        "sticky left-0 top-0 z-50 h-20 w-full justify-center",
        BG_WHITE_NOISE
      )}
    >
      <div className="m-auto flex h-full w-full max-w-screen-xl justify-between px-6 sm:px-16">
        {/* 1280px */}
        <div className="items-center flex">
          <Link
            className="hover:opacity-70 text-primary font-bold text-sm flex items-center gap-2 whitespace-nowrap"
            href="/"
          >
            <span className="relative w-[30px] h-[30px]">
              <Image
                src="/logo/logo.png"
                alt="logo"
                sizes="30px"
                fill
                className="object-contain"
              />
            </span>
            Name
          </Link>
        </div>
        <MobileHeader />
        <DesktopHeader />
      </div>
    </header>
  );
};

export default Header;
