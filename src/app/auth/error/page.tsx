"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "unknown";

  const errorInfo: Record<string, { message: string; help: string }> = {
    no_code: {
      message: "No authorization code received from Notion.",
      help: "This usually means the Notion window was closed before completing. Try again and make sure to click 'Allow access' on the Notion screen.",
    },
    invalid_state: {
      message: "Security validation failed.",
      help: "This can happen if you waited too long on the Notion screen. Just try connecting again.",
    },
    token_exchange_failed: {
      message: "Could not complete the Notion connection.",
      help: "Notion's servers may be temporarily unavailable. Wait a moment and try again.",
    },
    server_error: {
      message: "Something went wrong on our end.",
      help: "This is usually temporary. Try again in a few seconds.",
    },
    access_denied: {
      message: "You declined the Notion authorization.",
      help: "No worries! You need to grant access for the app to work. When you're ready, click below and hit 'Allow access' on the Notion screen.",
    },
    unknown: {
      message: "An unexpected error occurred.",
      help: "Try connecting again. If it keeps happening, try clearing your browser cookies or using a different browser.",
    },
  };

  const info = errorInfo[error] ?? errorInfo.unknown;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <svg
            className="w-7 h-7 text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black">Connection didn&apos;t go through</h1>
          <p className="text-gray-600">{info.message}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-left">
          <p className="text-sm text-gray-500 leading-relaxed">{info.help}</p>
        </div>

        <div className="space-y-3">
          <a
            href="/api/auth/notion"
            className="inline-block w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try connecting again
          </a>
          <a
            href="/"
            className="inline-block text-sm text-gray-400 hover:text-gray-600"
          >
            Back to home
          </a>
        </div>
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
