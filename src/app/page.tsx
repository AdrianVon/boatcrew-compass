import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("notion_token")?.value;

  // If already authenticated, go to dashboard
  if (token) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-widest text-gray-400 uppercase">
            2026: Designed
          </p>
          <h1 className="text-5xl font-black tracking-tight">
            Boatcrew
            <br />
            <span className="text-pink-400">Compass</span>
          </h1>
        </div>

        <p className="text-lg text-gray-600 leading-relaxed">
          A one-page map for how you&apos;ll move through the year. Set your
          priorities, reflect each quarter, and stay on course.
        </p>

        <div className="space-y-4">
          <a
            href="/api/auth/notion"
            className="inline-block px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Connect with Notion
          </a>
          <p className="text-sm text-gray-400">
            Your data stays in your Notion workspace. Always.
          </p>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-1">
                Priorities Compass
              </h3>
              <p className="text-sm text-gray-500">
                North, South, East, West &mdash; map your projects, habits, and
                relationships.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-1">
                Quarterly Reflection
              </h3>
              <p className="text-sm text-gray-500">
                Revisit what worked, what to subtract, and recalibrate every 90
                days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
