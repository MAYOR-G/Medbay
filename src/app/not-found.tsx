import Link from "next/link";
import { ArrowLeft, ArrowRight, FileQuestion } from "lucide-react";
import { MedBayLogo } from "@/components/ui";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F0] px-5 py-12 text-[#0F172A]">
      <Link href="/" aria-label="MedBay Home" className="mb-8">
        <MedBayLogo size="lg" />
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-[#DCE2DF] bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
          <FileQuestion className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-4 font-mono text-xs font-semibold tracking-wider text-[#065F46] uppercase">
          404 · Record Not Found
        </p>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-[#0F172A]">
          This page could not be found
        </h1>
        <p className="mt-2 text-base leading-relaxed text-[#475569]">
          The page you requested may have moved, or the address might contain a typo.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#DCE2DF] bg-white px-5 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/vault"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#059669] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#047857]"
          >
            <span>Open Vault</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
