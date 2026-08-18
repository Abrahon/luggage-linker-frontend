"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  LifeBuoy,
  Loader2,
  Mail,
  PackageCheck,
  Phone,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

// Support Categories
const inquiryTypes = [
  { id: "tracking", label: "Shipment Tracking", icon: PackageCheck },
  { id: "booking", label: "Booking Assistance", icon: Plane },
  { id: "billing", label: "Payments & Refunds", icon: BadgeCheck },
  { id: "business", label: "Partnerships", icon: Building2 },
];

const faqs = [
  {
    q: "How can I track my luggage in real-time?",
    a: "Enter your Booking Reference ID into the search bar at the top or check your account dashboard.",
  },
  {
    q: "What happens if my shipment is delayed?",
    a: "Our team monitors active routes 24/7. You will receive instant SMS and email notifications with updated ETAs.",
  },
  {
    q: "Can I modify my pickup address after booking?",
    a: "Yes, address updates can be submitted up to 12 hours prior to scheduled pickup from your dashboard.",
  },
];

export const ContactUs = () => {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("tracking");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bookingRef: "",
    message: "",
  });

  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    router.push(`/tracking?id=${encodeURIComponent(trackingId.trim())}`);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-full max-w-7xl -translate-x-1/2 overflow-hidden blur-3xl opacity-30">
        <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-blue-600 to-indigo-500 opacity-40" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-semibold text-blue-400 mb-6 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Concierge Support
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            We're Here to Help
          </h1>
          <p className="mt-3 text-base text-slate-400">
            Have a question about your shipment or booking? Reach out to our
            24/7 team.
          </p>

          {/* Tracking Search Bar */}
          <form
            onSubmit={handleTrackingSearch}
            className="mt-8 relative max-w-md mx-auto"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Track shipment (e.g. LL-98213)..."
                className="w-full rounded-full border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-24 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                className="absolute right-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white shadow-md hover:bg-blue-500 transition"
              >
                Track
              </button>
            </div>
          </form>
        </motion.div>

        {/* MAIN SECTION */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* LEFT: CHANNELS & PROMO */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Direct Contact Cards */}
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-blue-400" /> Direct Channels
              </h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Email Us
                    </p>
                    <a
                      href="mailto:support@luggagelinker.com"
                      className="text-sm font-semibold text-white hover:text-blue-400 transition"
                    >
                      support@luggagelinker.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-400 shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Call Us
                    </p>
                    <p className="text-sm font-semibold text-white">
                      +1 (800) 584-4243
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400 shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Availability
                    </p>
                    <p className="text-sm font-semibold text-white">
                      24/7 Active Transit Monitoring
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantee Badge */}
            <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-900/40 to-slate-900 p-6">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4" /> Luggage Security
              </div>
              <h3 className="text-base font-bold text-white">
                Safe & On-Time Guarantee
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Includes $1,000 complimentary protection coverage and live GPS
                check-ins.
              </p>
            </div>
          </motion.div>

          {/* RIGHT: CONTACT FORM */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Send a Message</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select an inquiry topic below.
                </p>
              </div>

              {/* Inquiry Type Buttons */}
              <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {inquiryTypes.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm"
                          : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center"
                >
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
                  <h3 className="text-lg font-bold text-white">
                    Message Sent!
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Our team will get back to you within 2 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        bookingRef: "",
                        message: "",
                      });
                    }}
                    className="mt-5 rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                  >
                    Send Another Inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1.5 block text-xs font-medium text-slate-300"
                      >
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Alex Morgan"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-xs font-medium text-slate-300"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="alex@example.com"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="bookingRef"
                      className="mb-1.5 block text-xs font-medium text-slate-300"
                    >
                      Booking Reference{" "}
                      <span className="text-slate-500">(Optional)</span>
                    </label>
                    <input
                      id="bookingRef"
                      name="bookingRef"
                      type="text"
                      value={formData.bookingRef}
                      onChange={handleChange}
                      placeholder="e.g. LL-89214"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-xs font-medium text-slate-300"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Inquiry
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* FAQ ACCORDION */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-center text-xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-slate-200 hover:text-white transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
