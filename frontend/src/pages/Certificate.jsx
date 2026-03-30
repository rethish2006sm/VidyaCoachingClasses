import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import classLogo from "../assets/class_logo.png";
import signImage from "../assets/sign.png";

let cachedHtml2Canvas = null;

const ensureHtml2Canvas = async () => {
  if (cachedHtml2Canvas) return cachedHtml2Canvas;
  const module = await import(
    "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js"
  );
  cachedHtml2Canvas = module.default || module.html2canvas || module;
  return cachedHtml2Canvas;
};

const Certificate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { student, sectionLabel, rank } = location.state || {};

  useEffect(() => {
    if (!student) {
      navigate("/leaderboard", { replace: true });
    }
  }, [navigate, student]);

  if (!student) return null;

  const issuedDate = new Date();
  const issuedFormatted = `${issuedDate.toLocaleString("default", {
    month: "long",
  })} ${issuedDate.getFullYear()}`;

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    try {
      const html2canvas = await ensureHtml2Canvas();
      
      // Use a higher scale for crisp text and graphics
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: "#ffffff",
        scale: 3, 
        useCORS: true,
        logging: false,
        // This helper ensures standard colors are used during the capture process
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector(".vidya-certificate-card");
          if (el) el.style.fontFamily = "sans-serif";
        }
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${(student.name || "certificate").replace(/\s+/g, "_")}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download certificate image", error);
      alert("There was an error generating the image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#f8fafc" }}>
      <div className="w-full max-w-5xl">
        
        {/* MOBILE SCROLL WRAPPER - Keeps the landscape layout intact on phones */}
        <div className="overflow-x-auto pb-6">
          <div
            ref={certificateRef}
            className="vidya-certificate-card mx-auto bg-white border border-[#8a3c11] rounded-[30px] overflow-hidden"
            style={{ 
                minWidth: "800px", // Fixed width to prevent "oklch" scaling issues and maintain layout
                boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                backgroundColor: "#ffffff"
            }}
          >
            {/* Header */}
            <div className="p-10 text-center">
              <img src={classLogo} alt="Vidya logo" className="mx-auto h-20 w-auto" />
              <p className="text-[10px] uppercase tracking-[0.6em] mt-4 font-bold" style={{ color: "#6b1e07" }}>
                VIDYA COACHING CLASSES
              </p>
              <h2 className="mt-2 text-4xl font-black uppercase tracking-[0.5em] leading-tight" style={{ color: "#6b1e07" }}>
                CERTIFICATE OF HONOUR
              </h2>
              <p className="text-xl mt-2 tracking-[0.15em] italic font-medium" style={{ color: "#822b04" }}>
                Student of the Month Certificate
              </p>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                For outstanding dedication and performance
              </p>
            </div>
            
            {/* Student Name */}
            <div className="px-10 text-center pb-8">
              <h3 className="text-5xl font-black uppercase tracking-tight pb-2 border-b-2 inline-block px-6" style={{ color: "#0f172a", borderBottomColor: "#f1f5f9" }}>
                {student.name}
              </h3>
              <p className="text-lg uppercase tracking-[0.4em] mt-4 font-semibold" style={{ color: "#64748b" }}>
                {sectionLabel} · Batch {student.batchYear || new Date().getFullYear()}
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="px-10 pb-10">
              <div className="grid grid-cols-3 gap-6 text-left">
                {[
                  {
                    label: "SCORE",
                    value: `${student.score ?? student.percentage ?? "--"}%`,
                  },
                  { label: "RANK", value: `#${rank}` },
                  { label: "ISSUED", value: issuedFormatted },
                ].map((entry) => (
                  <div
                    key={entry.label}
                    className="rounded-2xl border p-5 shadow-sm"
                    style={{ backgroundColor: "#ffffff", borderColor: "#f1f5f9" }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: "#a9714b" }}>
                      {entry.label}
                    </p>
                    <p className="text-3xl font-black" style={{ color: "#1e293b" }}>
                        {entry.value}
                    </p>
                    <div
                      className="mt-3 h-[4px] rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #8a1e1e, rgba(138,30,30,0))",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Signature Area */}
            <div className="px-10 pb-12 text-center flex flex-col items-center">
              <div className="w-56 border-b mb-2" style={{ borderColor: "#cbd5e1" }}>
                <img src={signImage} alt="Authority signature" className="mx-auto h-20 object-contain" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: "#94a3b8" }}>
                Authority Signature
              </p>
            </div>
          </div>
        </div>

        {/* Action Button - Outside the capture area */}
        <div className="mt-4 text-center">
          <button
            onClick={downloadCertificate}
            disabled={isDownloading}
            className="w-full sm:w-auto rounded-full px-10 py-4 text-sm font-black uppercase tracking-[0.4em] text-white transition-all active:scale-95 disabled:opacity-70 shadow-xl"
            style={{ backgroundColor: "#6b1e07" }}
          >
            {isDownloading ? "Capturing..." : "Download certificate"}
          </button>
          <p className="mt-4 text-[11px] uppercase tracking-widest" style={{ color: "#94a3b8" }}>
            The certificate layout is preserved for high-quality export
          </p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;