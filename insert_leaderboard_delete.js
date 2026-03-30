const fs = require("fs");
const path = require("path");

const filePath = path.join("src", "pages", "Admin.jsx");
const text = fs.readFileSync(filePath, "utf8");

const needle = "  const leaderboardPreviewName";
const addition = `
  const handleDeleteLeaderboard = async (entryId) => {
    if (!adminKey) {
      setLeaderboardListStatus("Set VITE_ADMIN_KEY to delete entries.");
      return;
    }
    setDeletingLeaderboardId(entryId);
    try {
      await apiClient.delete(\`/leaderboard/\${entryId}\`, { headers });
      setLeaderboardListStatus("Leaderboard entry removed.");
      setLeaderboardList((prev) => prev.filter((entry) => entry._id !== entryId));
    } catch (error) {
      setLeaderboardListStatus(error.message || "Unable to delete leaderboard entry.");
    } finally {
      setDeletingLeaderboardId("");
    }
  };

`;

if (!text.includes(needle)) {
  throw new Error("needle missing block");
}

const result = text.replace(needle, `${addition}  const leaderboardPreviewName`);
fs.writeFileSync(filePath, result, "utf8");
