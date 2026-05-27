import { Link } from "react-router-dom";
import { trpc } from "./lib/trpc";

const appUrl = import.meta.env.VITE_APP_URL ?? "http://localhost:5173";

export default function App() {
  const { data: health } = trpc.health.useQuery();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
        <span className="text-xl font-semibold tracking-tight">Daylear</span>
        <a
          href={appUrl}
          className="rounded-full bg-white text-slate-950 px-5 py-2 text-sm font-medium hover:bg-slate-200"
        >
          Open app
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-bold tracking-tight mb-6 max-w-2xl">
          Plan meals, lists, and life together.
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl">
          Cross-platform app for iOS, Android, and web. This marketing site is a Vite SPA — same
          stack as the product, without Ionic.
        </p>
        <div className="flex gap-4">
          <a
            href={appUrl}
            className="rounded-full bg-emerald-500 text-slate-950 px-6 py-3 font-medium hover:bg-emerald-400"
          >
            Get started
          </a>
          <Link
            to="/"
            className="rounded-full border border-slate-700 px-6 py-3 font-medium hover:border-slate-500"
          >
            Learn more
          </Link>
        </div>

        {health && (
          <p className="mt-12 text-xs text-slate-600">
            API status: {health.ok ? "connected" : "unknown"} ({health.service})
          </p>
        )}
      </main>
    </div>
  );
}
