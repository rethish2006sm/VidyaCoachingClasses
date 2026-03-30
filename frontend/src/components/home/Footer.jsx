import React, { useRef } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import instagramIcon from "../../assets/instagram.png";
import linkedinIcon from "../../assets/linkedin.png";
import twitterIcon from "../../assets/twitter.png";

/* ---------------- MAGNETIC ---------------- */
const useMagnet = (strength = 0.3) => {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);
    ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0px, 0px)";
  };

  return { ref, handleMouseMove, handleLeave };
};

/* ---------------- ANIMATION ---------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const Footer = () => {
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Result", href: "/results" },
    { label: "Course", href: "/courses" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Admission", href: "/admission" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const socials = [
    { label: "IG", icon: instagramIcon, href: "https://www.instagram.com/vidya_classes.1/" },
    { label: "LN", icon: linkedinIcon, href: "#" },
    { label: "TW", icon: twitterIcon, href: "#" },
  ];

  return (
    <footer className="relative bg-[#0a0f1a] text-white w-full overflow-hidden border-t border-white/5">

      {/* MARQUEE */}
      <div className="absolute top-4 left-0 w-full overflow-hidden opacity-[0.08] pointer-events-none">
        <motion.div
          animate={{ x: [0, -600] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-[14vw] sm:text-[10vw] md:text-[12vw] font-black italic"
        >
          VIDYA COACHING CLASSES VIDYA COACHING CLASSES VIDYA COACHING CLASSES VIDYA COACHING CLASSES VIDYA COACHING CLASSES VIDYA COACHING CLASSES VIDYA COACHING CLASSES
        </motion.div>
      </div>

      {/* GLOW BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-[#1280c7]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-[#FFAB89]/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-16 sm:pt-20 pb-10 relative z-10">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          className="grid gap-10 sm:gap-14 md:grid-cols-12 text-center md:text-left"
        >

          {/* BRAND */}
          <motion.div variants={itemVariants} className="md:col-span-5 space-y-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic">
              Vidya Coaching Classes<span className="text-[#FFAB89]">.</span>
            </h2>

            <p className="text-slate-400 text-sm sm:text-base max-w-sm mx-auto md:mx-0">
              Sculpting confident learners through academic excellence and disciplined mentorship since 2010.
            </p>

            <div className="p-4 sm:p-5 bg-white/[0.03] border border-white/5 rounded-xl inline-block">
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#FFAB89] mb-2">
                Directed By
              </p>
              <p className="text-base sm:text-lg font-bold">Mrs. Vaishali Shinde</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                Founder & Director
              </p>
            </div>
          </motion.div>

          {/* NAVIGATION */}
          <motion.div variants={itemVariants} className="md:col-span-4">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-5">
              Navigation
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 justify-items-center md:justify-items-start">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white"
                >
                  {link.label.toUpperCase()}
                </NavLink>
              ))}
            </div>
          </motion.div>

          {/* CONTACT */}
          <motion.div variants={itemVariants} className="md:col-span-3 space-y-5">
            <div className="text-xs sm:text-sm text-slate-300 space-y-2">
              <p>Diva & Bhandup</p>
              <p className="text-[#FFAB89] font-semibold">+91 12345 67890</p>
              <p className="underline">hello@vidyacoaching.in</p>
            </div>

            {/* SOCIALS */}
            <div className="flex justify-center md:justify-start gap-4">
              {socials.map((social) => {
                const magnet = useMagnet();
                return (
                  <div
                    key={social.label}
                    ref={magnet.ref}
                    onMouseMove={magnet.handleMouseMove}
                    onMouseLeave={magnet.handleLeave}
                  >
                    <motion.a
                      href={social.href}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
                    >
                      <img
                        src={social.icon}
                        alt={social.label}
                        className="h-4 w-4 sm:h-5 sm:w-5"
                      />
                    </motion.a>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* BOTTOM */}
        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col items-center gap-3 text-center md:flex-row md:justify-between">
          <p className="text-[10px] text-slate-500">
            © {new Date().getFullYear()} Vidya Coaching Classes
          </p>

          <div className="flex gap-5 text-[10px] text-slate-500">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
