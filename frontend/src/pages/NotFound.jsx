import React from "react";
import { Link } from "react-router-dom";
import { Compass, MoveRight } from "lucide-react"; 

const NotFound = () => {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      
      {/* Background Animated Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[#FFAB89]/20 rounded-full blur-[80px] -z-10 animate-pulse"></div>

      {/* Creative 404 Header with Spinning Icon */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2">
        <span className="text-7xl sm:text-9xl font-black text-[#263137] drop-shadow-sm">4</span>
        <div className="animate-[spin_6s_linear_infinite]">
          <Compass className="w-16 h-16 sm:w-28 sm:h-28 text-[#FFAB89]" />
        </div>
        <span className="text-7xl sm:text-9xl font-black text-[#263137] drop-shadow-sm">4</span>
      </div>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.4em] text-[#FFAB89] mb-6">
        Looks like you're lost
      </p>

      {/* Main Text */}
      <h1 className="text-3xl sm:text-5xl font-black text-[#263137] mb-4">
        Page not found
      </h1>
      <p className="max-w-md text-sm sm:text-base text-[#263137]/70 mb-10 leading-relaxed">
        The route you tried does not exist. It might have been moved or deleted. 
        Let's get you back on track.
      </p>

      {/* Animated Button */}
      <Link
        to="/"
        className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#ECA385] text-white font-black tracking-[0.2em] text-xs sm:text-sm rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(236,163,133,0.3)] hover:shadow-[0_15px_25px_rgba(236,163,133,0.4)]"
      >
        {/* Button Hover Shine Effect */}
        <span className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></span>
        
        <span className="relative flex items-center gap-3">
          GO TO HOME
          <MoveRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
        </span>
      </Link>
    </section>
  );
};

export default NotFound;  