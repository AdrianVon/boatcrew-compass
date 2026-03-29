"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "unknown";

  const messages: Record<string, string> = {
    no_code: "No authorization code received from Notion.",
    invalid_state: "Security validation failed. Please try again.",
    token_exchange_failed: "Could not complete Notion authorization.",
    server_error: "Something went wrong on our end.",
    access_denied: "You declined the Notion authorization.",
    unknown: "An unexpected error occurred.",
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-3xl font-black">Something went wrong</h1>
        <p className="text-gray-600">{messages[error] ?? messages.unknown}</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Try again
        </a>
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
