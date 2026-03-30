import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const About = () => {
  return (
    <div className="bg-[#FCFBFA] min-h-screen text-[#1a1a1a] font-sans selection:bg-orange-100 overflow-x-hidden">
      
      {/* 1. HERO SECTION: Typographic Impact */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6 overflow-hidden">
        {/* Abstract Background Element */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -right-24 w-64 md:w-96 h-64 md:h-96 border border-orange-100 rounded-full opacity-30 md:opacity-50"
        />

        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6"
          >
            <span className="h-[1px] w-8 md:w-12 bg-[#d12a28]"></span>
            <span className="uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs font-bold text-[#d12a28]">About Our Philosophy</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.9] md:leading-[0.85] mb-8 md:mb-12"
          >
            NOT JUST <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d12a28] to-orange-400">TEACHING.</span>
          </motion.h1>

          <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-end">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-5 text-base md:text-xl text-slate-500 leading-relaxed"
            >
              We've replaced traditional rote learning with a high-performance system designed for clarity, discipline, and undeniable confidence.
            </motion.p>
            
            {/* Minimalist Floating Stat */}
            <motion.div 
              whileHover={{ y: -10 }}
              whileTap={{ scale: 0.95 }}
              className="md:col-start-9 md:col-span-4 p-6 md:p-8 bg-white border border-slate-100 shadow-xl md:shadow-2xl rounded-2xl md:rounded-3xl mt-4 md:mt-0"
            >
              <h4 className="text-4xl md:text-5xl font-bold mb-2">100%</h4>
              <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider md:tracking-widest font-semibold">Average Student Score Improvement</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. THE BENTO GRID: Visual Storytelling */}
      <section className="px-4 md:px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[600px]"
        >
          {/* Card 1: Experience */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="md:col-span-2 bg-orange-50 rounded-[32px] md:rounded-[40px] p-8 md:p-10 flex flex-col justify-between group overflow-hidden relative min-h-[250px] md:min-h-0"
          >
            <div className="z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Established <br /> since 2000</h3>
              <p className="text-sm md:text-base text-slate-600 max-w-xs">Decades of refining the methodology that produces toppers year after year.</p>
            </div>
            <div className="absolute -bottom-10 -right-10 text-[120px] md:text-[180px] font-bold text-orange-100 select-none group-hover:text-orange-200 transition-colors">14</div>
          </motion.div>

          {/* Card 2: Trusted By */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="md:col-span-1 bg-white border border-slate-100 rounded-[32px] md:rounded-[40px] p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[220px] md:min-h-0"
          >
            <div className="flex -space-x-3 md:-space-x-4 mb-4 md:mb-6">
              {[1,2,3,4].map(i => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white bg-slate-200"
                />
              ))}
            </div>
            <motion.h3 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-2xl md:text-3xl font-bold italic text-[#d12a28]"
            >
              3,200+
            </motion.h3>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Students Trusted Us</p>
          </motion.div>

          {/* Card 3: Image/Visual Placeholder */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="md:col-span-1 bg-slate-900 rounded-[32px] md:rounded-[40px] relative overflow-hidden group min-h-[280px] md:min-h-0"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-20 text-white">
                <p className="text-[10px] md:text-xs uppercase tracking-widest opacity-70">Our Classes</p>
                <p className="text-sm md:text-base font-bold">Structured for Focus</p>
            </div>
            <motion.div 
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.7 }}
              className="w-full h-full bg-[url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80')] bg-cover bg-center"
            />
          </motion.div>

          {/* Card 4: Mentors */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="md:col-span-1 bg-[#1a1a1a] text-white rounded-[32px] md:rounded-[40px] p-8 md:p-10 flex flex-col justify-center shadow-2xl min-h-[180px] md:min-h-0"
          >
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold mb-2"
            >
              30+
            </motion.h3>
            <p className="text-orange-300 text-sm md:text-base font-medium">Expert Mentors</p>
          </motion.div>

          {/* Card 5: The System */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="md:col-span-3 bg-white border border-slate-100 rounded-[32px] md:rounded-[40px] p-8 md:p-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center shadow-sm hover:shadow-md transition-shadow"
          >
             <div className="space-y-3 md:space-y-4">
               <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Your success <span className="text-[#d12a28]">is our system.</span></h3>
               <p className="text-sm md:text-base text-slate-500">We don't leave results to chance. Our dashboard-driven performance tracking ensures every student knows exactly where they stand every single day.</p>
             </div>
             <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="flex gap-3 md:gap-4 shrink-0 justify-center w-full md:w-auto"
             >
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 md:w-20 h-24 md:h-32 bg-orange-100 rounded-xl md:rounded-2xl"
                />
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="w-16 md:w-20 h-24 md:h-32 bg-red-100 rounded-xl md:rounded-2xl mt-4 md:mt-8"
                />
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  className="w-16 md:w-20 h-24 md:h-32 bg-slate-100 rounded-xl md:rounded-2xl"
                />
             </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. FINAL CALL TO ACTION */}
      <section className="py-20 md:py-32 relative text-center px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 md:mb-8 italic"
          >
            Ready to transform?
          </motion.h2>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#d12a28] text-white px-10 md:px-12 py-4 md:py-5 rounded-full font-bold text-base md:text-lg shadow-xl hover:bg-black transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Start Your Journey</span>
            <motion.div 
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-r from-orange-500 to-[#d12a28]"
            />
          </motion.button>
          
          {/* Decorative elements for mobile */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-10 -left-10 w-32 h-32 border border-orange-200 rounded-full opacity-30 md:hidden"
          />
        </motion.div>
      </section>

      {/* Custom Global Styles for typography */}
      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; }
        
        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          * {
            -webkit-tap-highlight-color: transparent;
          }
          
          .bento-grid-card {
            transition: transform 0.2s ease;
          }
          
          .bento-grid-card:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  );
};

export default About;
