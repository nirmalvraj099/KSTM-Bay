"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { DemoBanner } from "@/features/marketplace/DemoBanner";
import { JobCard } from "@/features/marketplace/JobCard";
import { listJobs } from "@/features/marketplace/jobs-repo";
import type { Job } from "@/features/marketplace/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  useEffect(() => {
    listJobs().then(setJobs);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <SiteHeader />
      <DemoBanner />
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-a2">Marketplace</p>
          <h1 className="disp mt-2 text-4xl sm:text-5xl">Open <span className="grad-text">jobs</span></h1>
        </div>
        <Link href="/jobs/new" className="rounded-lg bg-gradient-to-r from-a1 to-a2 px-5 py-3 font-semibold text-bg">Post my car →</Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs === null ? <p className="text-mut">Loading…</p> : jobs.map((j) => <JobCard key={j.id} job={j} />)}
      </div>
    </div>
  );
}
