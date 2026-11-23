"use client";

import * as React from "react";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  topic: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  topic: "Family Vault & Product Question",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactFormProps {
  compact?: boolean;
}

export function ContactForm({ compact = false }: ContactFormProps) {
  const [form, setForm] = React.useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submittedName, setSubmittedName] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  function validate(values: FormState): FormErrors {
    const next: FormErrors = {};
    if (values.name.trim().length < 2) {
      next.name = "Please enter your name so we know how to address you.";
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      next.email = "Please enter a valid email address so we can reply.";
    }
    if (values.message.trim().length < 12) {
      next.message = "Please share a few details about how we can help (at least 12 characters).";
    }
    return next;
  }

  function handleChange(
    field: keyof FormState,
    value: string,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    const senderName = form.name.trim();
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmittedName(senderName);
      setForm(INITIAL_STATE);
      setErrors({});
    }, 320);
  }

  if (submittedName) {
    return (
      <div
        role="status"
        className="space-y-4 rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-6 sm:p-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#059669] text-white">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-xl font-semibold text-[#0F172A]">
          Message received for {submittedName}
        </h3>
        <p className="text-base leading-relaxed text-[#065F46]">
          Thank you for reaching out to MedBay. Our family support and privacy team reviews
          inquiries within one business day. Do not include sensitive medical attachments in general
          contact messages.
        </p>
        <button
          type="button"
          onClick={() => setSubmittedName(null)}
          className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#059669] bg-white px-4 text-sm font-semibold text-[#065F46] transition-colors duration-300 hover:bg-[#F8FAFC]"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className={compact ? "grid gap-4 sm:grid-cols-2" : "space-y-5"}>
        <div>
          <label
            htmlFor={compact ? "home-contact-name" : "contact-name"}
            className="mb-1.5 block text-sm font-semibold text-[#0F172A]"
          >
            Full name
          </label>
          <input
            id={compact ? "home-contact-name" : "contact-name"}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            placeholder="Elena Vance"
            className={`h-11 w-full rounded-[10px] border bg-white px-3.5 text-base text-[#0F172A] placeholder:text-[#64748B] transition-colors duration-300 focus:outline-none ${
              errors.name
                ? "border-[#991B1B]"
                : "border-[#CBD5E1] focus:border-[#059669]"
            }`}
          />
          {errors.name && (
            <p
              id="contact-name-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#991B1B]"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={compact ? "home-contact-email" : "contact-email"}
            className="mb-1.5 block text-sm font-semibold text-[#0F172A]"
          >
            Email address
          </label>
          <input
            id={compact ? "home-contact-email" : "contact-email"}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            placeholder="elena@example.com"
            className={`h-11 w-full rounded-[10px] border bg-white px-3.5 text-base text-[#0F172A] placeholder:text-[#64748B] transition-colors duration-300 focus:outline-none ${
              errors.email
                ? "border-[#991B1B]"
                : "border-[#CBD5E1] focus:border-[#059669]"
            }`}
          />
          {errors.email && (
            <p
              id="contact-email-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#991B1B]"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>
      </div>

      {!compact && (
        <div>
          <label htmlFor="contact-topic" className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
            Topic
          </label>
          <select
            id="contact-topic"
            name="topic"
            value={form.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
            className="h-11 w-full rounded-[10px] border border-[#CBD5E1] bg-white px-3.5 text-base text-[#0F172A] focus:border-[#059669] focus:outline-none"
          >
            <option value="Family Vault & Product Question">Family Vault &amp; Product Question</option>
            <option value="Privacy, Encryption & Data Requests">
              Privacy, Encryption &amp; Data Requests
            </option>
            <option value="Clinical Partnerships & Press">Clinical Partnerships &amp; Press</option>
            <option value="Technical Support">Technical Support</option>
          </select>
        </div>
      )}

      <div>
        <label
          htmlFor={compact ? "home-contact-message" : "contact-message"}
          className="mb-1.5 block text-sm font-semibold text-[#0F172A]"
        >
          How can we help?
        </label>
        <textarea
          id={compact ? "home-contact-message" : "contact-message"}
          name="message"
          rows={compact ? 3 : 5}
          required
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : "contact-message-hint"}
          placeholder="Tell us about your question regarding family profiles, privacy controls, or Google Workspace sync..."
          className={`w-full rounded-[10px] border bg-white p-3.5 text-base text-[#0F172A] placeholder:text-[#64748B] transition-colors duration-300 focus:outline-none ${
            errors.message
              ? "border-[#991B1B]"
              : "border-[#CBD5E1] focus:border-[#059669]"
          }`}
        />
        {errors.message ? (
          <p
            id="contact-message-error"
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#991B1B]"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{errors.message}</span>
          </p>
        ) : (
          <p id="contact-message-hint" className="mt-1.5 text-xs text-[#64748B]">
            Please keep personal medical records inside your encrypted MedBay vault rather than in
            general contact forms.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#047857] px-6 text-base font-semibold text-white transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#065F46] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span>{submitting ? "Sending message..." : "Send Message"}</span>
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </button>
    </form>
  );
}
