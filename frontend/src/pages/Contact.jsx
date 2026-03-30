import React from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, PhoneCall, Clock, Phone, ArrowRight, MessageSquare } from "lucide-react";

const contactHighlights = [
  {
    title: "Campus Address",
    detail: "Diva | Bhandup",
    sub: "Available during office hours",
    icon: MapPin,
    accent: "from-orange-100 to-orange-200",
    iconColor: "text-orange-600",
  },
  
  {
    title: "Counselling Line",
    detail: "+91 97654 32109",
    sub: "Available during office hours",
    icon: PhoneCall,
    accent: "from-blue-100 to-blue-200",
    iconColor: "text-blue-600",
  },
  {
    title: "Email Address",
    detail: "hello@vidyacoaching.in",
    sub: "Drop us a line anytime",
    icon: Mail,
    accent: "from-emerald-100 to-emerald-200",
    iconColor: "text-emerald-600",
  },
  {
    title: "Office Hours",
    detail: "Mon - Sat",
    sub: "08:00 AM - 08:00 PM",
    icon: Clock,
    accent: "from-purple-100 to-purple-200",
    iconColor: "text-purple-600",
  },
];

const stats = [
  { label: "Live Batches", value: "25+" },
  { label: "Mentors", value: "30+" },
  { label: "Scholars Guided", value: "3,500+" },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } },
};

const floatingAnimation = {
  y: ["-10px", "10px", "-10px"],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
};

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 font-sans selection:bg-orange-200 selection:text-orange-900 overflow-hidden relative pb-24">
      
      {/* Premium Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-300/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-emerald-200/20 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-16 lg:pt-32 max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
          
          {/* Left Text & Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Admissions Open 2026
              </p>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900">
              Let's shape your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                future together.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Reach out, visit our campus, or pick up a call. Our expert counselors are ready to map out your personalized path to success.
            </motion.p>

            <motion.div variants={containerVariants} className="flex flex-wrap gap-4 pt-4">
              {stats.map((item) => (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-xl px-6 py-4 shadow-sm"
                >
                  <p className="text-3xl font-black text-slate-900">{item.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Floating Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative lg:ml-auto w-full max-w-md"
          >
            <motion.div animate={floatingAnimation} className="rounded-[2rem] bg-white border border-slate-100 p-8 shadow-2xl shadow-blue-900/5 relative z-10">
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-orange-400 to-pink-500 text-white p-4 rounded-full shadow-lg">
                <MessageSquare size={24} fill="currentColor" />
              </div>
              
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">
                Quick Connect
              </p>
              <h3 className="text-2xl font-black text-slate-900 mb-6">+91 98765 43210</h3>
              
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Call during office hours to connect directly with an educator, or drop a WhatsApp message for a callback within 2 hours.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {["Students", "Parents", "Professionals"].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-600 border border-slate-100">
                    {tag}
                  </span>
                ))}
              </div>

              <motion.a
                href="https://wa.me/918652533860?text=Hello%20Vidya%20Coaching%20Team%2C%20I%20visited%20the%20website%20and%20would%20like%20to%20join%20a%20course."
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 focus:ring-4 focus:ring-slate-200"
              >
                <span>Chat on WhatsApp</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </motion.a>
            </motion.div>
            
            {/* Decorative background for the card */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-pink-200 blur-2xl -z-10 transform scale-95 translate-y-8 opacity-50" />
          </motion.div>
        </div>
      </section>

      {/* Grid Highlights Section */}
      <section className="max-w-7xl mx-auto px-6 mt-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {contactHighlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group rounded-[2rem] border border-slate-200/60 bg-white/70 backdrop-blur-xl p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:bg-white"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${item.accent} mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon size={24} className={item.iconColor} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  {item.title}
                </h3>
                <p className="text-lg font-black text-slate-900">{item.detail}</p>
                <p className="text-sm text-slate-500 mt-1">{item.sub}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Bottom Bento Box Section */}
      <section className="max-w-7xl mx-auto px-6 mt-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Visit Us Card */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-widest text-orange-400 mb-4"><span className="text-4xl">DIVA </span>Branch</p>
                <h2 className="text-3xl md:text-4xl font-black max-w-lg leading-tight">
                  Right beside Hanuman Mandir, Bhandup (W).
                </h2>
                <p className="mt-6 text-slate-300 max-w-md text-lg">
                  Drop in for a guided tour, sample classes, or a 1-on-1 strategy session with our lead faculty.
                </p>
              </div>

              <div className="mt-12 flex flex-wrap gap-8 border-t border-slate-700/50 pt-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Navigation</p>
                  <a href="#" className="text-white hover:text-orange-400 font-semibold transition-colors flex items-center gap-2">
                    Get Directions <ArrowRight size={14} />
                  </a>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">General Inquiry</p>
                  <a href="mailto:hello@vidyacoaching.in" className="text-white hover:text-orange-400 font-semibold transition-colors">
                    hello@vidyacoaching.in
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-widest text-orange-400 mb-4"><span className="text-4xl">BHANDUP </span> Branch</p>
                <h2 className="text-3xl md:text-4xl font-black max-w-lg leading-tight">
                  Right beside Hanuman Mandir, Bhandup (W).
                </h2>
                <p className="mt-6 text-slate-300 max-w-md text-lg">
                  Drop in for a guided tour, sample classes, or a 1-on-1 strategy session with our lead faculty.
                </p>
              </div>

              <div className="mt-12 flex flex-wrap gap-8 border-t border-slate-700/50 pt-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Navigation</p>
                  <a href="#" className="text-white hover:text-orange-400 font-semibold transition-colors flex items-center gap-2">
                    Get Directions <ArrowRight size={14} />
                  </a>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">General Inquiry</p>
                  <a href="mailto:hello@vidyacoaching.in" className="text-white hover:text-orange-400 font-semibold transition-colors">
                    hello@vidyacoaching.in
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          

        </motion.div>
      </section>
    </div>
  );
};

export default Contact;
