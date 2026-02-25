'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 text-center font-inter">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">
                Something went wrong!
            </h2>
            <p className="text-xl font-bold mb-8 bg-white border-2 border-black p-4 neo-shadow rotate-1 max-w-md">
                {error.message || "An unexpected error occurred during the toast session."}
            </p>
            <button
                onClick={() => reset()}
                className="bg-black text-white border-4 border-black px-8 py-4 text-xl font-black uppercase tracking-wider neo-shadow transition-all hover:bg-gray-800"
            >
                Try again
            </button>
        </div>
    );
}
