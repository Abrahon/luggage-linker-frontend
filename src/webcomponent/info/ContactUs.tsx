"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  HelpCircle,
  LifeBuoy,
  Loader2,
  Mail,
  MessageSquare,
  PackageCheck,
  Phone,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

// Support Categories for Form
const inquiryTypes = [
  { id: "tracking", label: "Shipment Tracking", icon: PackageCheck },
  { id: "booking", label: "Booking Assistance", icon: Plane },
  { id: "billing", label: "Payments & Refunds", icon: BadgeCheck },
  { id: "business", label: "Partnerships", icon: Building2 },
];

const faqs = [
  {
    q: "How can I track my luggage in real-time?",
    a: "Enter your Booking Reference ID (e.g., LL-8921) into the search bar at the top of this page or visit the Tracking Portal in your dashboard.",
  },
  {
    q: "What happens if my shipment is delayed?",
    a: "Our 24/7 concierge continuously monitors active routes. If a delay occurs, you will receive real-time SMS & email notifications along with an updated delivery estimate.",
  },
  {
    q: "Can I modify my pickup address after booking?",
    a: "Yes! Address changes can be requested up to 12 hours prior to scheduled pickup directly through your account dashboard or by contacting us below.",
  },
];

export const ContactUs = () => {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API submission
    await new Promise((res) => setTimeout(res, 1200));

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-tr from-blue-400/15 via-indigo-300/15 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-blue-700 shadow-sm backdrop-blur-md mb-6">
            <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
            LuggageLinker Concierge Support
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900">
            How can we help with your journey?
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Have questions regarding your shipment, rates, or active delivery? 
            Our global support specialists are here 24/7 to keep you moving stress-free.
          </p>

          {/* Quick Tracking Search Bar */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Have a tracking ID? Search status (e.g. LL-98213)..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-28 text-sm text-slate-900 shadow-xl shadow-slate-200/40 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <button 
                type="button" 
                className="absolute right-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition"
              >
                Track
              </button>
            </div>
          </div>
        </div>

        {/* MAIN INTERACTIVE SECTION */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT SIDE: DIRECT CONTACT CHANNELS & HIGHLIGHTS */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Quick Contact Info Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-blue-600" /> Direct Channels
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email Concierge
                    </p>
                    <a
                      href="mailto:support@luggagelinker.com"
                      className="text-base font-semibold text-slate-900 hover:text-blue-600 transition"
                    >
                      support@luggagelinker.com
                    </a>
                    <p className="text-xs text-slate-500 mt-0.5">Average reply time: &lt; 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Phone Line
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      +1 (800) 584-4243
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Mon–Fri, 9:00 AM – 6:00 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Emergency Support
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      24/7 Active Transit Monitoring
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Automated dispatch team always on duty</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Banner */}
            <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
              <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4" /> Luggage Security Promise
              </div>
              <h3 className="text-xl font-bold">Safe & On-Time Arrival Guarantee</h3>
              <p className="mt-2 text-sm text-blue-100 leading-relaxed">
                Every shipment linked through our platform includes $1,000 complimentary protection coverage and real-time GPS check-ins.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: DYNAMIC FORM */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xl shadow-slate-200/50">
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Send Us a Message</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select a category to help us route your request to the right team.
                </p>
              </div>

              {/* Inquiry Category Selector */}
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {inquiryTypes.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/60 text-blue-700 shadow-sm ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="text-xs font-semibold leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {submitted ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center animate-in fade-in zoom-in duration-300">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                  <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                    Thank you for contacting LuggageLinker. A support manager will review your inquiry and get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", bookingRef: "", message: "" });
                    }}
                    className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-600 transition"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
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
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
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
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bookingRef" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Booking Reference ID <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="bookingRef"
                      name="bookingRef"
                      type="text"
                      value={formData.bookingRef}
                      onChange={handleChange}
                      placeholder="e.g. LL-89214"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      How can we help?
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Provide details about your luggage shipment, destination, or question..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-blue-600 focus:outline-none transition-all disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Request...
                      </>
                    ) : (
                      <>
                        Submit Message
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ ACCORDION SECTION */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Quick answers to common questions about luggage transfers and platform support.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-semibold text-slate-900 hover:bg-slate-50/50 transition"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-blue-600 shrink-0" />
                      {faq.q}
                    </span>
                    <span className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};