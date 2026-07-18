import React from "react";
import classLogo from "../../assets/class_logo.png";

const Herobtn = ({
  label = "Explore Course",
  filled = false,
  onClick,
  fullWidth = true // ✅ optional controlsssss
}) => {
  const baseClasses =
    "flex items-center justify-center gap-2 font-semibold tracking-wide uppercase transition-all duration-300 shadow-md active:scale-95 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white " +
    "text-xs sm:text-sm md:text-base"; // ✅ responsive text

  const filledClasses =
    "bg-gradient-to-br from-[#FF7A29] to-[#FFAB89] text-white border border-transparent " +
    "px-4 py-2.5 sm:px-6 sm:py-3 rounded-full"; // ✅ responsive padding

  const outlineClasses =
    "bg-white/90 text-[#C64500] border-2 border-[#FF7A29] hover:bg-white " +
    "px-4 py-2.5 sm:px-6 sm:py-3 rounded-full";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${baseClasses} 
        ${filled ? filledClasses : outlineClasses}
        ${fullWidth ? "w-full sm:w-auto" : ""}
      `}
    >
      <img
        src={classLogo}
        alt="logo"
        className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" // ✅ responsive icon
      />
      <span>{label}</span>
    </button>
  );
};

export default Herobtn;
