import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("notion_token")?.value;

  if (token) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center space-y-8">
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

          <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
            A one-page map for how you&apos;ll move through the year. Set your
            priorities, reflect each quarter, and stay on course&mdash;together.
          </p>

          {/* CTA */}
          <div className="space-y-3">
            <a
              href="/api/auth/notion"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors text-lg shadow-lg shadow-gray-900/10"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.193-6.023-.39-8.16-3.113L3.3 79.94c-2.333-3.113-3.3-5.443-3.3-8.167V11.113c0-3.497 1.553-6.413 6.017-6.8z"
                  fill="#fff"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M61.35.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723.967 5.053 3.3 8.167l12.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257-3.89c5.433-.387 6.99-2.917 6.99-7.193V20.64c0-2.21-.88-2.847-3.443-4.733L74.167 3.143C69.893.027 68.147-.357 61.35.227zM25.723 19.12c-5.58.34-6.847.417-10.027-2.253L8.33 10.897c-.78-.78-.39-1.753 1.163-1.947l52.833-3.887c4.667-.387 7.003 1.17 8.817 2.527l8.377 6.03c.39.193 1.36 1.363.193 1.363l-54.567 3.333-.423.803zM19.803 88.3V30.367c0-2.53.78-3.697 3.107-3.893L86.05 22.78c2.14-.193 3.107 1.167 3.107 3.693v57.547c0 2.53-1.36 4.473-4.277 4.667L28.467 92.193c-2.917.193-4.28-.777-4.28-3.503l-.383-.39zm56.057-54.4c.39 1.75 0 3.5-1.75 3.7l-2.723.533v42.267c-2.333 1.167-4.473 1.75-6.22 1.75-2.917 0-3.693-.917-5.833-3.5l-17.86-28.057v27.14l5.64 1.36s0 3.307-4.473 3.307l-12.393.777c-.393-.777 0-2.723 1.36-3.11l3.497-.97V40.57l-4.86-.393c-.39-1.75.583-4.277 3.303-4.47l13.363-.887 18.633 28.443V37.483l-4.667-.583c-.393-1.947 1.163-3.307 2.917-3.5l12.58-.803z"
                  fill="#000"
                />
              </svg>
              Get Started with Notion
            </a>
            <p className="text-sm text-gray-500">
              Free &middot; Takes about 2 minutes &middot; No sign-up needed
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-gray-100 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-12">
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-400 font-black text-xl flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-bold">Connect your Notion</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Click &ldquo;Get Started&rdquo; and you&apos;ll see a Notion
                pop-up asking you to grant access. Pick any page in your
                workspace&mdash;that&apos;s where your data will live.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-400 font-black text-xl flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-bold">Set your compass</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Fill in your North (career), South (relationships), East
                (personal growth), and West (body &amp; health) priorities for
                the year.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 font-black text-xl flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-bold">Reflect each quarter</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Every 90 days, come back and journal what worked, what
                didn&apos;t, and what to adjust. Your crew does the same.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="text-2xl mb-3">&#x1F9ED;</div>
              <h3 className="font-bold text-lg mb-2">Priorities Compass</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Map your year across four directions: career projects, key
                relationships, personal growth, and physical wellbeing. Three
                items per direction keeps it focused.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="text-2xl mb-3">&#x1F4DD;</div>
              <h3 className="font-bold text-lg mb-2">Quarterly Reflection</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Six prompts guide your thinking at the end of each quarter: what
                worked, what to subtract, surprises, theme alignment,
                adjustments, and a 7-day action step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy / trust */}
      <section className="bg-white border-t border-gray-100 px-6 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-black">Your data, your workspace</h2>
          <p className="text-gray-600 leading-relaxed">
            Boatcrew Compass doesn&apos;t have a database. When you connect,
            two small tables are created inside <strong>your own</strong> Notion
            workspace. You can view, edit, or delete them anytime from Notion
            directly. We never see each other&apos;s data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              No passwords stored
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Data lives in your Notion
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Disconnect anytime
            </span>
          </div>
        </div>
      </section>

      {/* FAQ / common questions */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-10">
            Common questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                Do I need a Notion account?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Yes, but Notion&apos;s free plan works perfectly. If you
                don&apos;t have one, you can create it during the connection
                step&mdash;it takes about 30 seconds.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                What happens when I click &ldquo;Get Started&rdquo;?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                You&apos;ll be taken to Notion&apos;s authorization screen. It
                will ask you to select a page to share with Boatcrew Compass.
                Pick any page (or create a new one)&mdash;we&apos;ll create two
                small databases inside it for your priorities and reflections.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                Can I see my data in Notion?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Absolutely. Open Notion and you&apos;ll see &ldquo;Priorities
                Compass&rdquo; and &ldquo;Quarterly Reflections&rdquo; tables
                right on the page you shared. They&apos;re fully yours.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                How do I disconnect?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Click &ldquo;Log out&rdquo; on your dashboard, or go to
                Notion&apos;s Settings &rarr; Connections and remove Boatcrew
                Compass. Your data stays in your workspace either way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-900 px-6 py-12">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <h2 className="text-2xl font-black text-white">Ready to start?</h2>
          <p className="text-gray-400 text-sm">
            Connect your Notion, set your compass, and you&apos;re on your way.
          </p>
          <a
            href="/api/auth/notion"
            className="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Get Started with Notion
          </a>
        </div>
      </section>
    </main>
  );
}
