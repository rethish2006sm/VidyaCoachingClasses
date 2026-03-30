const fs = require("fs");
const path = require("path");

const filePath = path.join("src", "pages", "Admin.jsx");
const text = fs.readFileSync(filePath, "utf8");

const startMarker = "  const renderLeaderboardPanel = () => {";
const endMarker = "  const renderGalleryPanel = () => (";
const start = text.indexOf(startMarker);
const end = text.indexOf(endMarker);

if (start === -1 || end === -1) {
  throw new Error("Could not locate leaderboard panel boundaries");
}

const newBlock = `  const renderLeaderboardPanel = () => {
    const availableBatchYears = Array.from(
      new Set(
        studentsList
          .map((student) => student.batchYear)
          .filter(Boolean)
      )
    ).sort((a, b) => (b || 0) - (a || 0));
    const filteredStudents = studentsList.filter((student) => {
      const matchesStandard =
        !leaderboardGroup.standard || student.standard === leaderboardGroup.standard;
      const matchesBatch =
        !leaderboardGroup.batchYear || Number(student.batchYear) === Number(leaderboardGroup.batchYear);
      const matchesSearch =
        !leaderboardSearch ||
        student.name.toLowerCase().includes(leaderboardSearch.toLowerCase());
      return matchesStandard && matchesBatch && matchesSearch;
    });

    const filteredLeaderboardEntries = leaderboardList
      .filter((entry) => {
        const matchesStandard =
          !leaderboardFilterStandard || entry.standard === leaderboardFilterStandard;
        const matchesBatch =
          !leaderboardFilterBatch || String(entry.year) === leaderboardFilterBatch;
        const matchesSearch =
          !leaderboardFilterSearch ||
          entry.name.toLowerCase().includes(leaderboardFilterSearch.toLowerCase());
        return matchesStandard && matchesBatch && matchesSearch;
      })
      .sort((a, b) => (a.rank || 0) - (b.rank || 0));

    return (
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-2xl space-y-5 text-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Leaderboard</p>
              <h3 className="text-2xl font-black uppercase">Create scoreboard</h3>
            </div>
            <button
              type="button"
              onClick={handleToggleLeaderboardForm}
              className="rounded-full border border-[#D41304] px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#D41304]"
            >
              {showLeaderboardForm ? "Close" : "Create leaderboard"}
            </button>
          </div>
          {showLeaderboardForm && (
            <motion.form onSubmit={handleCreateLeaderboard} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={leaderboardGroup.standard}
                  onChange={(e) =>
                    setLeaderboardGroup((prev) => ({ ...prev, standard: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none bg-white"
                >
                  <option value="">Select standard</option>
                  {romanStandards.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={leaderboardGroup.batchYear}
                  onChange={(e) =>
                    setLeaderboardGroup((prev) => ({
                      ...prev,
                      batchYear: Number(e.target.value) || "",
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none bg-white"
                >
                  <option value="">Batch year</option>
                  {availableBatchYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  Search students
                </label>
                <div className="flex gap-3">
                  <input
                    type="search"
                    placeholder="Type to filter"
                    value={leaderboardSearch}
                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                  />
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 flex items-center">
                    Type or pick below
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {leaderboardSelections.map((selection, index) => (
                  <div key={`leaderboard-selection-${index}`} className="grid gap-3 sm:grid-cols-[1fr_0.6fr]">
                    <select
                      value={selection.studentId}
                      onChange={(e) =>
                        handleLeaderboardSelectionChange(index, "studentId", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none bg-white"
                    >
                      <option value="">Choose student #{index + 1}</option>
                      {filteredStudents.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name} · {student.standard || "Standard"} · Batch {student.batchYear || "N/A"}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Percentage"
                      value={selection.percentage}
                      onChange={(e) =>
                        handleLeaderboardSelectionChange(index, "percentage", e.target.value)
                      }
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <button
                type="submit"
                disabled={leaderboardLoading}
                className={`${buttonStyles} bg-gradient-to-r from-[#F97316] to-[#D41304] text-white w-full flex justify-center ${leaderboardLoading ? "opacity-70" : ""}`}
              >
                {leaderboardLoading ? "Saving..." : "Save leaderboard"}
              </button>
              {leaderboardStatus && (
                <p className={`text-[11px] ${statusColor(leaderboardStatus)}`}>{leaderboardStatus}</p>
              )}
            </motion.form>
          )}
        </div>
        <motion.div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111827] to-[#0f172a] p-6 shadow-2xl space-y-4 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-300">Leaderboard preview</p>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-3">
            <p className="text-lg font-black uppercase tracking-[0.3em]">
              {leaderboardPreviewName}
            </p>
            <div className="flex items-center justify-between text-xs uppercase text-white/60">
              <span>{leaderboardPreviewCategory}</span>
              <span>{leaderboardPreviewYear}</span>
            </div>
            <div className="flex items-center justify-between text-2xl font-black">
              <span>{leaderboardPreviewScore}%</span>
              <span className="text-sm font-semibold text-white/70">
                Rank {leaderboardPreviewRank}
              </span>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {leaderboardForm.standard || "Standard"}
            </p>
          </div>
        </motion.div>
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl space-y-4 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em]">Existing leaderboard entries</p>
            {leaderboardListStatus && (
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">{leaderboardListStatus}</span>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-3 text-[10px] uppercase tracking-[0.3em]">
            <select
              value={leaderboardFilterStandard}
              onChange={(e) => setLeaderboardFilterStandard(e.target.value)}
              className="rounded-2xl border border-white/30 bg-black/30 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white"
            >
              <option value="">Filter standard</option>
              {romanStandards.map((label) => (
                <option key={`filter-${label}`} value={label}>
                  {label}
                </option>
              ))}
            </select>
            <input
              value={leaderboardFilterBatch}
              onChange={(e) => setLeaderboardFilterBatch(e.target.value)}
              placeholder="Batch year"
              className="rounded-2xl border border-white/30 bg-black/30 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white placeholder:text-white/40"
            />
            <input
              value={leaderboardFilterSearch}
              onChange={(e) => setLeaderboardFilterSearch(e.target.value)}
              placeholder="Search name"
              className="rounded-2xl border border-white/30 bg-black/30 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center text-[10px] uppercase tracking-[0.3em]">
            <select
              value={bulkDeleteStandard}
              onChange={(e) => setBulkDeleteStandard(e.target.value)}
              className="rounded-2xl border border-white/30 bg-black/30 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white"
            >
              <option value="">Select standard</option>
              {romanStandards.map((label) => (
                <option key={`bulk-${label}`} value={label}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={bulkDeleteLoading}
              onClick={() => handleBulkLeaderboardDelete("standard")}
              className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] transition ${bulkDeleteLoading ? "border-white/30 text-white/40 cursor-not-allowed" : "border-white/60 text-white hover:border-white"}`}
            >
              Delete standard
            </button>
            <button
              type="button"
              disabled={bulkDeleteLoading}
              onClick={() => handleBulkLeaderboardDelete("all")}
              className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] transition ${bulkDeleteLoading ? "border-white/30 text-white/40 cursor-not-allowed" : "border-white/60 text-white hover:border-white"}`}
            >
              Delete all
            </button>
          </div>
          {leaderboardListError && <p className="text-sm text-rose-400">{leaderboardListError}</p>}
          {leaderboardListLoading ? (
            <p className="text-sm text-white/60">Loading entries…</p>
          ) : (
            (() => {
              if (!filteredLeaderboardEntries.length) {
                return <p className="text-sm text-white/60">No leaderboard entries yet.</p>;
              }
              return (
                <div className="space-y-3">
                  {filteredLeaderboardEntries.map((entry) => (
                    <div
                      key={entry._id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-xs uppercase tracking-[0.3em]"
                    >
                      <div>
                        <p className="font-black">{entry.name}</p>
                        <p className="text-white/60 text-[9px]">
                          {entry.standard || "Standard"} · {entry.category || "Category"} · {entry.year || "Year"}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!adminKey || deletingLeaderboardId === entry._id}
                        onClick={() => handleDeleteLeaderboard(entry._id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition ${adminKey ? "border border-white/30 text-white hover:border-white" : "border border-white/10 text-white/40 cursor-not-allowed"}`}
                      >
                        {deletingLeaderboardId === entry._id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </div>
    );
  };`;

const result = `${text.slice(0, start)}${newBlock}${text.slice(end)}`;
fs.writeFileSync(filePath, result, "utf8");
