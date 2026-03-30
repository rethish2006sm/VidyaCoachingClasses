import React, { useState, useRef, useEffect } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";

const Morebtn = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const location = useLocation();

  const toggleMenu = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const getButtonText = () => {
    const path = location.pathname;

    if (path === "/gallery") return "GALLERY";
    if (path === "/contact") return "CONTACT";
    if (path === "/about") return "ABOUT";
    return "MORE";
  };

  return (
    /* hidden on mobile (md:flex makes it visible only on desktop) */
    <div ref={menuRef} className="hidden md:flex relative">
      <button
        onClick={toggleMenu}
        className="flex items-center bg-gradient-to-b from-[#ECA385] to-[#DC6C3F] text-white rounded-full pl-5 pr-1 py-1 shadow-md hover:brightness-110 transition-all"
      >
        <span className="text-[11px] tracking-[0.2em] font-black mr-3 uppercase">
          {getButtonText()}
        </span>

        <div className={`w-7 h-7 flex items-center justify-center rounded-full border-2 border-white transition-transform duration-300 ${
            open ? "rotate-90" : ""
          }`}>
          <FaAngleDoubleRight className="text-white text-xs" />
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-10 w-44 bg-[#263137] border border-white/10 text-white rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg">
          <ul className="py-2">
            {[
    
            { name: "Gallery", path: "/gallery" },
            { name: "Contact", path: "/contact" },
            { name: "About", path: "/about" },
            ].map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-3 text-sm font-bold tracking-wide transition-colors ${
                      isActive ? "text-[#FFAB89] bg-white/5" : "hover:bg-white/10 text-white/80 hover:text-white"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Morebtn;
