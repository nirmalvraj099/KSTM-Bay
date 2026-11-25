import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-line py-5">
      <Link href="/"><Logo size={40} /></Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/jobs" className="hidden px-2 py-2 font-medium text-mut hover:text-txt sm:inline-block">Open jobs</Link>
        <Link href="/login" className="rounded-lg border border-line px-4 py-2 font-medium hover:bg-panel">Log in</Link>
        <Link href="/jobs/new" className="rounded-lg bg-gradient-to-r from-a1 to-a2 px-4 py-2 font-semibold text-bg">Post a job</Link>
      </nav>
    </header>
  );
}
