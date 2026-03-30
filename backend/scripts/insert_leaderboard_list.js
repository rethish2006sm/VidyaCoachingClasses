const fs = require("fs");
const path = require("path");

const filePath = path.join("src", "pages", "Admin.jsx");
const text = fs.readFileSync(filePath, "utf8");

const target = `        <motion.div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111827] to-[#0f172a] p-6 shadow-2xl space-y-4 text-white">
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
        </motion.div>`;

const replacement = `${target}
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl space-y-4 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em]">Existing leaderboard entries</p>
            {leaderboardListStatus && (
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">{leaderboardListStatus}</span>
            )}
          </div>
          {leaderboardListError && <p className="text-sm text-rose-400">{leaderboardListError}</p>}
          {leaderboardListLoading ? (
            <p className="text-sm text-white/60">Loading entries…</p>
          ) : leaderboardList.length ? (
            <div className="space-y-3">
              {leaderboardList.map((entry) => (
                <div key={entry._id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-xs uppercase tracking-[0.3em]">
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
          ) : (
            <p className="text-sm text-white/60">No leaderboard entries yet.</p>
          )}
        </div>`;

if (!text.includes(target)) {
  throw new Error("target missing");
}

const result = text.replace(target, replacement);
fs.writeFileSync(filePath, result, "utf8");
