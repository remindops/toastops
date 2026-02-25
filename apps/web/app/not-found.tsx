'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfbf7] p-4 text-center font-inter">
            <h1 className="text-9xl font-black uppercase tracking-tighter mb-4 text-black drop-shadow-[4px_4px_0px_rgba(249,115,22,1)]">
                404
            </h1>
            <p className="text-2xl font-bold mb-8 bg-white border-2 border-black p-4 neo-shadow rotate-1">
                This page was toasted. Not found!
            </p>
            <Link
                href="/"
                className="bg-orange-500 text-white border-4 border-black px-8 py-4 text-xl font-black uppercase tracking-wider neo-shadow transition-all hover:bg-orange-400"
            >
                Go Back Home
            </Link>
        </div>
    );
}
