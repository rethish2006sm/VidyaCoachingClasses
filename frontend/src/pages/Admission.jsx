import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiClient } from "../lib/apiClient";
import { useLocation } from "react-router-dom";
import hereImage from "../assets/here-section-half.png";

const processSteps = [
  {
    step: "01",
    title: "Submit Inquiry",
    text: "Share your grade, interests, and preferred batch time in our digital portal.",
  },
  {
    step: "02",
    title: "Counseling Call",
    text: "Our academic mentors map a bespoke course pathway based on your goals.",
  },
  {
    step: "03",
    title: "Confirm Seat",
    text: "Secure your place in the batch with flexible digital payment options.",
  },
];

const standardOptions = [
  "Standard IX",
  "Standard X (SSC)",
  "Class XI Commerce",
  "Class XII Commerce",
];

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  phone: "",
  applyingFor: "",
  course: "",
  learningGoals: "",
};

const Admission = () => {
  const location = useLocation();
  const selectedCourse = location.state?.course;
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [prefilledFromCourse, setPrefilledFromCourse] = useState(false);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const validateCoreFields = useCallback(() => {
    if (!form.name.trim()) return "Enter your full name.";
    if (!form.email.trim() || !form.email.includes("@")) return "Enter a valid email address.";
    if (!form.phone.trim()) return "Enter your phone number.";
    if (!form.applyingFor.trim()) return "Select the standard you are applying for.";
    return "";
  }, [form.name, form.email, form.phone, form.applyingFor]);

  useEffect(() => {
    if (!selectedCourse || prefilledFromCourse) return;
    setForm((prev) => ({
      ...prev,
      applyingFor: selectedCourse.grade || prev.applyingFor,
      course: selectedCourse.title || prev.course,
    }));
    setPrefilledFromCourse(true);
  }, [selectedCourse, prefilledFromCourse]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setValidationMessage(validateCoreFields());
    }, 420);
    return () => clearTimeout(timer);
  }, [validateCoreFields]);

  const handleFieldChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const errorMessage = validateCoreFields();
      setValidationMessage(errorMessage);
      if (errorMessage) {
        setStatus({ type: "error", message: errorMessage });
        return;
      }
      setIsSubmitting(true);
      setStatus({ type: "", message: "" });
      try {
        await apiClient.post("/inquiries", {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          applyingFor: form.applyingFor.trim(),
          course: form.course.trim(),
          learningGoals: form.learningGoals.trim(),
        });
        setStatus({
          type: "success",
          message: "Inquiry received! Our mentors will reach back within 24 hours.",
        });
        setForm(INITIAL_FORM_STATE);
        setPrefilledFromCourse(false);
      } catch (error) {
        setStatus({
          type: "error",
          message: error?.message || "Unable to submit the inquiry. Please try again later.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, validateCoreFields],
  );

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-slate-900 font-sans selection:bg-red-100 overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <header className="relative pt-20 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background Layer - Adjusted for better mobile positioning */}
        <div className="absolute inset-0 z-0 opacity-[0.05] md:opacity-[0.03] pointer-events-none">
          <img src={hereImage} alt="BG" className="w-full h-full object-contain md:object-cover blur-sm" />
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative z-10 w-full">
          <div className="inline-flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6 md:mb-8">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#D41304] animate-pulse" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-600">Admissions Open 2025-26</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.9] md:leading-[0.8] mb-6 md:mb-8">
            Join the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D41304] to-orange-500 italic pr-2 md:pr-4">
              Legacy.
            </span>
          </h1>
          <p className="text-base md:text-xl text-slate-500 max-w-2xl font-medium mx-auto leading-relaxed px-4">
            Your journey toward academic distinction starts with a single conversation. Choose your path and let our mentors sculpt your success.
          </p>
        </motion.div>
      </header>

      {/* --- THE ROADMAP (Process) --- */}
      <section className="px-4 md:px-6 py-12 md:py-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {processSteps.map((step, index) => (
            <motion.div 
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative flex-1 bg-white border border-slate-100 rounded-[24px] md:rounded-[32px] p-8 md:p-10 shadow-xl shadow-slate-200/40 group hover:border-[#D41304]/30 transition-all"
            >
              {/* Step number scaling for mobile */}
              <span className="text-4xl md:text-5xl font-black text-slate-100 group-hover:text-red-50 transition-colors absolute top-6 right-8 md:top-8 md:right-10">
                {step.step}
              </span>
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-3 md:mb-4">{step.title}</h3>
                <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">{step.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- ADMISSION FORM SECTION --- */}
      <main className="px-4 md:px-6 pb-20 md:pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Side: Info */}
          <div className="lg:col-span-5 space-y-6 md:y-8">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-tight md:leading-none">
                Begin your <br className="hidden md:block" /> enrollment.
              </h2>
              <p className="text-sm md:text-base text-slate-500 font-medium max-w-md mx-auto lg:mx-0">
                Complete the inquiry form and a mentor will reach out within 24 hours with a customized plan and fee structure.
              </p>
            </div>

            <div className="p-6 md:p-8 bg-slate-900 rounded-[24px] md:rounded-[32px] text-white space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Direct Contact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                <div>
                  <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest">General Admissions</p>
                  <p className="text-lg md:text-xl font-bold">+91 98765 43210</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest">Email Support</p>
                  <p className="text-lg md:text-xl font-bold">hello@vidya.edu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Floating Form */}
          <div className="lg:col-span-7">
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-12 border border-slate-200 shadow-2xl shadow-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
            >
              {selectedCourse && (
                <div className="md:col-span-2 space-y-1 rounded-[28px] border border-[#fde3de] bg-[#fff4f2] p-5 text-sm text-slate-600">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-[#c62c3a]">
                    Auto-filled from the course you chose
                  </p>
                  <h3 className="text-2xl font-black text-[#c62c3a]">
                    {selectedCourse.title}
                  </h3>
              <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                {(() => {
                  const gradeLabel =
                    Array.isArray(selectedCourse?.grades) && selectedCourse.grades.length
                      ? selectedCourse.grades.join(" / ")
                      : selectedCourse?.grade;
                  return gradeLabel ? <span>{gradeLabel}</span> : null;
                })()}
                <span>{selectedCourse.fee || "Fee on request"}</span>
              </div>
                  <p className="text-[11px] text-slate-500">
                    You can adjust the preferred course below if needed.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                  Full Name
                </label>
                <input
                  autoComplete="name"
                  type="text"
                  value={form.name}
                  onChange={handleFieldChange("name")}
                  placeholder="e.g. Arjun Sharma"
                  className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl py-3.5 md:py-4 px-5 md:px-6 focus:ring-2 focus:ring-[#D41304]/20 transition-all font-semibold text-sm md:text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                  Email Address
                </label>
                <input
                  autoComplete="email"
                  type="email"
                  value={form.email}
                  onChange={handleFieldChange("email")}
                  placeholder="name@email.com"
                  className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl py-3.5 md:py-4 px-5 md:px-6 focus:ring-2 focus:ring-[#D41304]/20 transition-all font-semibold text-sm md:text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                  Phone Number
                </label>
                <input
                  autoComplete="tel"
                  type="tel"
                  value={form.phone}
                  onChange={handleFieldChange("phone")}
                  placeholder="+91 00000 00000"
                  className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl py-3.5 md:py-4 px-5 md:px-6 focus:ring-2 focus:ring-[#D41304]/20 transition-all font-semibold text-sm md:text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                  Applying for
                </label>
                <select
                  value={form.applyingFor}
                  onChange={handleFieldChange("applyingFor")}
                  className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl py-3.5 md:py-4 px-5 md:px-6 focus:ring-2 focus:ring-[#D41304]/20 transition-all font-semibold appearance-none text-sm md:text-base"
                >
                  <option value="">Select Standard</option>
                  {standardOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                  Preferred Course (optional)
                </label>
                <input
                  type="text"
                  value={form.course}
                  onChange={handleFieldChange("course")}
                  placeholder="E.g. Commerce Batch / SSC Accelerator"
                  className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl py-3.5 md:py-4 px-5 md:px-6 focus:ring-2 focus:ring-[#D41304]/20 transition-all font-semibold text-sm md:text-base"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                  Learning Goals
                </label>
                <textarea
                  rows="4"
                  value={form.learningGoals}
                  onChange={handleFieldChange("learningGoals")}
                  placeholder="Tell us what you want to achieve..."
                  className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl py-3.5 md:py-4 px-5 md:px-6 focus:ring-2 focus:ring-[#D41304]/20 transition-all font-semibold resize-none text-sm md:text-base"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-[#D41304] text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs shadow-xl shadow-red-200 transition-transform ${
                    isSubmitting ? "opacity-60" : "hover:-translate-y-1 hover:bg-slate-900"
                  }`}
                >
                  {isSubmitting ? "Submitting…" : "Submit Enrollment Inquiry"}
                </button>
                {validationMessage && (
                  <p className="text-xs text-red-600">{validationMessage}</p>
                )}
                {status.message && (
                  <p
                    className={`text-sm font-semibold ${
                      status.type === "success" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {status.message}
                  </p>
                )}
              </div>
            </motion.form>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Admission;
