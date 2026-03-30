import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const topperDefaultSubjects = [
  { subject: "English", mark: 0 },
  { subject: "Marathi", mark: 0 },
  { subject: "Hindi", mark: 0 },
  { subject: "Mathematics", mark: 0 },
  { subject: "Science", mark: 0 },
  { subject: "Social Science", mark: 0 },
  { subject: "Optional", mark: 0 },
];

const EditableText = ({
  value,
  placeholder,
  editable,
  onChange,
  className,
  numeric,
  style,
  tag: Tag = "span",
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const hasValue = value !== undefined && value !== null && value !== "";
    const displayValue = hasValue ? `${value}` : placeholder || "";
    if (ref.current.innerText !== displayValue) {
      ref.current.innerText = displayValue;
    }
  }, [value, placeholder]);

  const emitChange = () => {
    if (!editable || !onChange || !ref.current) return;
    const text = ref.current.innerText.trim();
    if (numeric) {
      const parsed = parseFloat(text);
      onChange(isNaN(parsed) ? "" : parsed);
    } else {
      onChange(text);
    }
  };

  const handleFocus = () => {
    if (!editable || !ref.current) return;
    const hasValue = value !== undefined && value !== null && value !== "";
    if (!hasValue) {
      ref.current.innerText = "";
    }
  };

  const handleBlur = () => {
    if (!editable || !ref.current) return;
    if (!ref.current.innerText.trim() && placeholder) {
      ref.current.innerText = placeholder;
    }
  };

  return (
    <Tag
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      role={editable ? "textbox" : undefined}
      tabIndex={editable ? 0 : undefined}
      className={className}
      style={{ direction: "ltr", ...style }}
      onInput={emitChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
    >
      {value || placeholder || ""}
    </Tag>
  );
};

const Toppercard = ({
  school = "St. Xavier's High School",
  subjects = topperDefaultSubjects,
  topper = "Rethish Mudaliar",
  totalMarks = 572,
  percentage = 95.3,
  year = "2024",
  grade = "SSC",
  outOf = 500,
  imageUrl = "",
  imagePositionX = 50,
  imagePositionY = 50,
  editable = false,
  flipSide,
  onFieldEdit,
  onSubjectEdit,
  onAddSubject,
  onSubjectRemove,
}) => {
  const circleStyle = imageUrl
    ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: `${imagePositionX}% ${imagePositionY}%`,
      }
    : {};
  const isControlledFlip = flipSide === "front" || flipSide === "back";
  const [isFlipped, setIsFlipped] = useState(() => flipSide === "back");

  useEffect(() => {
    if (!isControlledFlip) return;
    setIsFlipped(flipSide === "back");
  }, [flipSide, isControlledFlip]);

  const allowLocalFlip = !isControlledFlip && !editable;
  const handleCardFlip = () => {
    if (!allowLocalFlip) return;
    setIsFlipped((prev) => !prev);
  };
  const handleMouseEnter = () => {
    if (!allowLocalFlip) return;
    setIsFlipped(true);
  };
  const handleMouseLeave = () => {
    if (!allowLocalFlip) return;
    setIsFlipped(false);
  };

  const nameTokens = topper.trim().split(" ");
  const firstName = nameTokens[0] || "";
  const restName = nameTokens.slice(1).join(" ");

  const handleFieldEdit = (field, value) => {
    onFieldEdit?.(field, value);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className={`relative h-[380px] w-[260px] sm:h-[420px] sm:w-[300px] ${allowLocalFlip ? "cursor-pointer" : "cursor-default"} group`}
      onClick={handleCardFlip}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1500px" }}
      // preserve group/hover styling even if not flipping manually
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 18,
          mass: 0.8,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ================= FRONT ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-white/40 overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Background Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#D41304] rounded-bl-[80px] -mr-10 -mt-10 opacity-10 group-hover:scale-110 transition-transform duration-500" />

          <div className="p-4 sm:p-6 h-full flex flex-col items-center">
            {/* Header */}
            <div className="w-full flex justify-between items-start mb-3 sm:mb-4">
              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-[#D41304] flex items-center gap-2">
                  <EditableText
                    value={String(year)}
                    placeholder="2024"
                    editable={editable}
                    numeric
                    className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-[#D41304]"
                    onChange={(value) => handleFieldEdit("year", value)}
                  />
                  <span className="text-xs text-slate-400 uppercase tracking-[0.3em]">Batch</span>
                </span>
                <EditableText
                  value={grade}
                  placeholder="Grade"
                  editable={editable}
                  tag="p"
                  className="text-xl sm:text-2xl font-black italic text-slate-900 mt-2"
                  onChange={(value) => handleFieldEdit("grade", value)}
                />
              </div>

              <div className="text-right">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Total Score
                </p>
                <p className="font-black text-slate-800 text-lg sm:text-xl flex items-center justify-end gap-1">
                  <EditableText
                    value={String(totalMarks)}
                    placeholder="000"
                    editable={editable}
                    numeric
                    className="text-[#D41304]"
                    onChange={(value) => handleFieldEdit("totalMarks", value)}
                  />
                  <span className="text-slate-800">/</span>
                  <EditableText
                    value={String(outOf)}
                    placeholder="600"
                    editable={editable}
                    numeric
                    className="text-slate-800 text-[15px]"
                    onChange={(value) => handleFieldEdit("outOf", value)}
                  />
                </p>
              </div>
            </div>

            {/* Profile */}
            <div className="relative mt-2">
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#D41304] to-orange-400 rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity" />
              <div
                className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden`}
                style={{
                  ...circleStyle,
                  backgroundColor: imageUrl ? "transparent" : "#f1f5f9",
                }}
              >
                {!imageUrl && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-slate-100 animate-pulse" />
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-3 py-1 rounded-full font-black tracking-widest uppercase">
                TOPPER
              </div>
            </div>

            {/* Name */}
            <div className="mt-6 sm:mt-8 text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-black leading-none text-slate-900">
                <EditableText
                  value={firstName}
                  placeholder="Topper name"
                  editable={editable}
                  className="inline-block"
                  onChange={(value) => handleFieldEdit("firstName", value)}
                />
                <br />
                <span className="text-[#D41304]">
                  <EditableText
                    value={restName}
                    placeholder="Last name"
                    editable={editable}
                    className="inline-block"
                    onChange={(value) => handleFieldEdit("lastName", value)}
                  />
                </span>
              </h3>

              <EditableText
                value={school}
                placeholder="School / Institution"
                editable={editable}
                tag="p"
                className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-widest pt-1 sm:pt-2"
                onChange={(value) => handleFieldEdit("school", value)}
              />
            </div>

            {/* Bottom */}
            <div className="mt-auto mb-2 w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center">
              <div>
                <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase">
                  Overall Performance
                </p>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-600">
                  Excellent Distinction
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <EditableText
                  value={String(percentage)}
                  placeholder="0.0"
                  numeric
                  editable={editable}
                  className="text-2xl sm:text-3xl font-black text-slate-900"
                  onChange={(value) => handleFieldEdit("percentage", value)}
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BACK ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-[#FCFBFA] rounded-[32px] shadow-2xl p-4 sm:p-5 flex flex-col border border-slate-200"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Header */}
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
              <h4 className="text-slate-900 font-black tracking-widest text-[9px] sm:text-[10px] uppercase">
                Marks Statement
              </h4>
              <div className="flex items-center gap-2">
                {editable && (
                  <button
                    type="button"
                    onClick={onAddSubject}
                    className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white bg-[#D41304] px-3 py-1 rounded-full shadow-lg"
                  >
                    + Add subject
                  </button>
                )}
                <div className="px-2 py-0.5 rounded bg-[#D41304]/10 text-[#D41304] text-[8px] sm:text-[9px] font-bold">
                  OFFICIAL
                </div>
              </div>
            </div>

          {/* Subjects */}
          <div className="flex-1 flex flex-col gap-1.5">
            {subjects.slice(0, 6).map((s, i) => {
              const normalizedMark = Math.min(Math.max(Number(s.mark) || 0, 0), 100);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-2 sm:px-3 py-2 rounded-xl bg-white border border-slate-100 hover:border-[#D41304]/30 transition-all shadow-sm"
                >
                  <EditableText
                    value={s.subject}
                    placeholder="Subject"
                    editable={editable}
                    className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                    onChange={(value) => onSubjectEdit?.(i, "subject", value)}
                  />

                  <div className="flex items-center gap-2">
                    <div className="h-1 w-8 sm:w-10 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: isFlipped ? `${normalizedMark}%` : "0%",
                        }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.1,
                        }}
                        className="h-full bg-[#D41304]"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <EditableText
                        value={String(s.mark)}
                        placeholder="00"
                        numeric
                        editable={editable}
                        className="text-xs sm:text-sm font-black text-slate-900"
                        onChange={(value) => onSubjectEdit?.(i, "mark", value)}
                      />
                      {editable && subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onSubjectRemove?.(i)}
                          className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-300 hover:text-amber-100 focus:outline-none"
                        >
                          x
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">
                Academic Status
              </span>
              <span className="text-[8px] sm:text-[9px] font-black text-green-600 uppercase">
                Distinction
              </span>
            </div>

            <p className="text-[7px] sm:text-[8px] text-slate-400 text-center uppercase tracking-[0.2em] font-medium">
              Vidya Coaching Classes
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Toppercard;
