import Link from "next/link";
import type { Job } from "./types";
import { formatINR, modLabel } from "./options";

export function CarPhoto({ job, className = "" }: { job: Pick<Job, "photos" | "make" | "model">; className?: string }) {
  if (job.photos[0]) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={job.photos[0]} alt={`${job.make} ${job.model}`} className={`object-cover ${className}`} />;
  }
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-[#1d1d26] to-[#0f0f14] ${className}`}>
      <span className="disp text-2xl text-[#2e2e3a]">{job.make.toUpperCase()}</span>
    </div>
  );
}

export function daysLeft(closesAt: string) {
  const d = Math.ceil((Date.parse(closesAt) - Date.now()) / 86_400_000);
  return d <= 0 ? "Bidding closed" : d === 1 ? "1 day left" : `${d} days left`;
}

export function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`} className="group overflow-hidden rounded-2xl border border-line bg-panel transition hover:border-a1/60">
      <CarPhoto job={job} className="h-40 w-full" />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-mut">
          <span>{job.city}</span>
          {!job.sample && <span className="text-cy">Your job</span>}
        </div>
        <h3 className="font-bold leading-snug group-hover:text-a2">{job.title}</h3>
        <div className="flex flex-wrap gap-1">
          {job.modTypes.map((m) => (
            <span key={m} className="rounded-full border border-line px-2 py-0.5 text-xs text-mut">{modLabel(m)}</span>
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-semibold">{formatINR(job.budgetMin)} – {formatINR(job.budgetMax)}</span>
          <span className="text-mut">
            {job.bidCount} {job.bidCount === 1 ? "bid" : "bids"} ·{" "}
            {job.status === "awarded" ? <span className="text-cy">Winner picked</span> : daysLeft(job.closesAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
