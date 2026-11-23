import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Lock, Mail, ShieldCheck } from "lucide-react";
import {
  ContactForm,
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing";

export const metadata: Metadata = {
  title: "Contact MedBay",
  description:
    "Reach the MedBay support, security, and clinical partnerships team for questions about your encrypted family medical vault.",
};

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "Family Support",
    detail: "Questions about family sub profiles, document ingestion, or Google Workspace sync.",
    email: "support@medbay.health",
  },
  {
    icon: Lock,
    title: "Privacy & Security Desk",
    detail: "Data export requests, encryption architecture reviews, or responsible disclosure.",
    email: "privacy@medbay.health",
  },
  {
    icon: ShieldCheck,
    title: "Clinical & Press Inquiries",
    detail: "Healthcare literacy collaborations, caregiver guides, and brand asset requests.",
    email: "hello@medbay.health",
  },
] as const;

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#0F172A]">
      <MarketingHeader />

      <main id="main-content" className="flex-1">
        <section className="bg-[#F5F5F0] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#065F46] hover:text-[#047857]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Home</span>
            </Link>

            <div className="mt-8 max-w-3xl space-y-4">
              <h1 className="font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-[#0F172A] text-balance sm:text-5xl">
                Contact the MedBay team
              </h1>
              <p className="text-lg leading-relaxed text-[#475569] text-pretty">
                Whether you have a question about managing dependent profiles, revoking shared
                doctor links, or protecting your household&apos;s data, we are here to help.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left: Contact Form */}
            <div className="rounded-2xl border border-[#DCE2DF] bg-white p-6 sm:p-8 lg:col-span-7">
              <h2 className="font-heading text-2xl font-semibold text-[#0F172A]">
                Send us a message
              </h2>
              <p className="mt-2 text-base text-[#475569]">
                Fill out the form below and our team will reply to your email directly.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            {/* Right: Direct Channels & Privacy Notice */}
            <div className="space-y-6 lg:col-span-5">
              <div className="space-y-4">
                {CONTACT_CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <div
                      key={channel.title}
                      className="rounded-2xl border border-[#DCE2DF] bg-[#F8FAFC] p-6"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669]">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="space-y-1.5">
                          <h3 className="font-heading text-base font-semibold text-[#0F172A]">
                            {channel.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-[#475569]">
                            {channel.detail}
                          </p>
                          <a
                            href={`mailto:${channel.email}`}
                            className="inline-block pt-1 text-sm font-semibold text-[#059669] hover:text-[#047857]"
                          >
                            {channel.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#065F46]">
                  <Clock className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                  <span>Response expectations</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#065F46]">
                  Support and privacy inquiries receive a human response within one business day.
                  For urgent medical emergencies, always contact your local emergency services or
                  licensed clinician immediately.
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-[#064E3B]">
                  <Link href="/privacy" className="underline-offset-4 hover:underline">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="underline-offset-4 hover:underline">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
