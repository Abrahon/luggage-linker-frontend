"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Compass,
  Headphones,
  Mail,
  PackageCheck,
  Plane,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const highlights = [
  {
    title: "Booking Assistance",
    description:
      "Need help creating or managing your luggage shipment? Our support team is here to help.",
    icon: PackageCheck,
  },
  {
    title: "Shipment Tracking",
    description:
      "Questions about your shipment status or delivery updates? We're happy to assist.",
    icon: Compass,
  },
  {
    title: "Payment Support",
    description:
      "Need help with payments, invoices, or refunds? Our specialists are ready to help.",
    icon: BadgeCheck,
  },
  {
    title: "Business Partnerships",
    description:
      "Interested in partnering with LuggageLinker? We'd love to hear from you.",
    icon: Plane,
  },
];

const infoCards = [
  {
    title: "Fast Response",
    description:
      "We typically respond to all inquiries within 24 business hours.",
    icon: Send,
  },
  {
    title: "Support Hours",
    description: "Monday – Friday\n9:00 AM – 6:00 PM",
    icon: Clock3,
  },
  {
    title: "Email Support",
    description: "support@luggagelinker.com",
    icon: Mail,
  },
];

export const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(135deg,#f8fbff_0%,#ffffff_45%,#f8fbff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[36px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_25px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur-md md:p-8 lg:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="max-w-2xl animate-[fadeInUp_0.7s_ease-out]">
              <div className="mb-5 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                <Headphones className="mr-2 h-4 w-4" />
                Premium support for every shipment
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Contact Us
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600 sm:text-xl">
                Have a question about your shipment, booking, or account? We're
                here to help. Send us a message and our support team will get
                back to you as soon as possible.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                  24/7 concierge support
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Trusted by frequent travelers
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block animate-[fadeInUp_0.9s_ease-out]">
              <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-blue-500/20 via-cyan-400/10 to-transparent blur-3xl" />
              <div className="relative rounded-[30px] border border-slate-200 bg-slate-950 p-6 shadow-2xl">
                <div className="rounded-[24px] bg-gradient-to-br from-blue-500 to-cyan-400 p-6">
                  <div className="flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-sm">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Live tracking
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        LuggageLinker
                      </p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-3 text-blue-700">
                      <PackageCheck className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-2xl border border-white/40 bg-white/75 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          Priority shipment
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          On route
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200">
                        <div className="h-2 w-3/4 rounded-full bg-blue-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/75 p-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Secure handling
                        </p>
                        <p className="text-sm text-slate-500">
                          24/7 monitoring
                        </p>
                      </div>
                      <div className="rounded-full bg-slate-900 p-3 text-white">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_18px_70px_-28px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                  About LuggageLinker
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Travel lighter with a team that supports every step
                </h2>
              </div>
            </div>

            <p className="text-base leading-8 text-slate-600">
              LuggageLinker makes luggage shipping simple, secure and
              stress-free. Whether you are flying internationally, relocating,
              or sending bags ahead of time, our dedicated team helps you plan,
              track and deliver with confidence.
            </p>

            <div className="mt-8 space-y-4">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition duration-300 hover:border-blue-200 hover:bg-white"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="mt-0.5 rounded-2xl bg-white p-2 text-blue-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-7 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_18px_70px_-28px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 sm:p-8 lg:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">
                Send us a Message
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                We'd love to hear from you. Fill out the form below and we'll
                respond as quickly as possible.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Alex Morgan"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="alex@email.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us how we can help..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-blue-600"
              >
                Send Message
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              {submitted && (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Thanks! Your message has been received and our team will reach
                  out shortly.
                </p>
              )}
            </form>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {infoCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.3)] transition duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {card.description}
                </p>
              </div>
            );
          })}
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-8 text-white shadow-[0_20px_70px_-28px_rgba(15,23,42,0.45)] sm:p-10">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Your Privacy Matters
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-300 sm:text-lg">
              Your information is secure and will only be used to respond to
              your inquiry. We respect your privacy and never share your
              personal information with third parties.
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-blue-100 bg-blue-50/70 p-8 text-center shadow-[0_16px_55px_-26px_rgba(37,99,235,0.35)] sm:p-10">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Need More Help?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Whether you need assistance with bookings, tracking, payments, or
            general inquiries, our dedicated support team is always ready to
            help.
          </p>
          <a
            href="mailto:support@luggagelinker.com"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-blue-700"
          >
            Contact Support
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </section>
      </div>
    </div>
  );
};
