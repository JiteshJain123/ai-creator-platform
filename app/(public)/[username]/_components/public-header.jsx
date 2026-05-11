import { ArrowLeft, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const PublicHeader = ({ link, title }) => {
  return (
    <header className="border-b border-slate-800 sticky top-0 bg-slate-900/80 backdrop-blur-md z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <Link
          href={link}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          {title}
        </Link>

        <Link href="/" className="flex-shrink-0 absolute left-1/2 -translate-x-1/2">
          <Image
            src="/logo.png"
            alt="Creatr Logo"
            width={96}
            height={32}
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </Link>

        <Link
          href="/search"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <Search className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
};

export default PublicHeader;
