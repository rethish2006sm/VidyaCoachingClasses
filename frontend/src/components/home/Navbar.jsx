import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";
import logo from "../../assets/class_logo.png";
import Morebtn from "./Morebtn";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScroll = useRef(0);
  const location = useLocation();

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "COURSES", path: "/courses" },
    { name: "RESULTS", path: "/results" },
    { name: "LEADERBOARD", path: "/leaderboard" },
    { name: "ADMISSION", path: "/admission" },
  ];

  const moreLinks = [
    { name: "GALLERY", path: "/gallery" },
    { name: "CONTACT", path: "/contact" },
    { name: "ABOUT", path: "/about" },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      
      // Glassmorphism effect trigger
      setScrolled(currentScroll > 20);

      // Hide/Show logic
      if (currentScroll <= 50) {
        setVisible(true);
      } else if (currentScroll > lastScroll.current) {
        setVisible(false); // Scrolling down
      } else {
        setVisible(true); // Scrolling up
      }
      lastScroll.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out
        ${visible ? "translate-y-0" : "-translate-y-full"}
        ${scrolled ? "bg-[#263137]/90 backdrop-blur-lg py-2 shadow-2xl" : "bg-[#263137] py-4"}`}
      >
        <div className="max-w-[1440px] mx-auto flex justify-between items-center px-6 md:px-12">
          
          {/* --- LOGO SECTION --- */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                className="h-12 w-auto sm:h-14 md:h-16 transition-transform duration-500 group-hover:scale-110" 
                src={logo} 
                alt="logo" 
              />
              <div className="absolute -inset-1 bg-[#FFAB89]/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="border-l-2 border-white/20 pl-3">
              <h1 className="text-white font-black tracking-tighter text-sm sm:text-lg md:text-2xl leading-none">
                VIDYA <span className="text-[#ffffff]">COACHING CLASSES</span>
              </h1>
              <p className="text-[#FFAB89] text-[8px] md:text-[10px] font-bold tracking-[0.4em] mt-1 uppercase">
                Excellence in Education
              </p>
            </div>
          </NavLink>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden lg:flex gap-8 items-center">
            {navLinks.map((link) => (
              <NavLink 
                key={link.name} 
                to={link.path} 
                className="relative py-2 group"
              >
                {({ isActive }) => (
                  <>
                    <span className={`text-[12px] font-bold tracking-[0.15em] transition-all duration-300
                      ${isActive ? "text-[#FFAB89]" : "text-white/70 group-hover:text-white"}`}>
                      {link.name}
                    </span>
                    <span className={`absolute left-0 bottom-0 h-[2px] bg-[#FFAB89] transition-all duration-300
                      ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}>
                    </span>
                  </>
                )}
              </NavLink>
            ))}
            <div className="pl-4 border-l border-white/10">
              <Morebtn />
            </div>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button 
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2 text-white/80 hover:text-[#FFAB89] transition-colors"
          >
            <Menu size={32} />
          </button>
        </div>
      </nav>

      {/* --- MOBILE OVERLAY MENU --- */}
      <div 
        className={`fixed inset-0 z-[110] lg:hidden transition-all duration-500 
        ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* Dark Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />

        {/* Menu Content */}
        <div className={`absolute top-0 right-0 w-[80%] max-w-sm h-full bg-[#263137] shadow-2xl transition-transform duration-500 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <span className="text-[#FFAB89] font-black tracking-widest">NAVIGATION</span>
              <button onClick={() => setIsOpen(false)} className="text-white hover:rotate-90 transition-transform duration-300">
                <X size={30} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-8 px-6">
              <div className="flex flex-col gap-2">
                {[...navLinks, ...moreLinks].map((link, index) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) => `
                      group flex items-center justify-between p-4 rounded-xl transition-all duration-300
                      ${isActive ? "bg-[#FFAB89]/10 text-[#FFAB89]" : "text-white/70 hover:bg-white/5 hover:text-white"}
                    `}
                  >
                    <span className="text-lg font-bold tracking-wider">{link.name}</span>
                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="p-8 bg-black/20 text-center">
              <p className="text-white/40 text-[10px] tracking-widest uppercase">Empowering Students Since 2010</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;