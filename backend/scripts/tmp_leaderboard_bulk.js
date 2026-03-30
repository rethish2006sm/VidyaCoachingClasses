const fs = require("fs");
const path = require("path");

const filePath = path.join("src", "pages", "Admin.jsx");
const text = fs.readFileSync(filePath, "utf8");

const target = `      await fetchLeaderboardList();
    } catch (error) {
      setLeaderboardStatus(error.message || "Unable to save leaderboard.");
    } finally {
      setLeaderboardLoading(false);
    }
  };
`;

const addition = `${target}  const handleBulkLeaderboardDelete = async (scope) => {
    if (!adminKey) {
      setLeaderboardListStatus("Set VITE_ADMIN_KEY to delete entries.");
      return;
    }
    if (scope === "standard" && !bulkDeleteStandard) {
      setLeaderboardListStatus("Select standard before deleting.");
      return;
    }
    const label =
      scope === "all" ? "all entries" : `standard ${bulkDeleteStandard}`;
    const proceed = window.confirm(
      `Delete ${label} from the leaderboard? This cannot be undone.`
    );
    if (!proceed) return;
    setBulkDeleteLoading(true);
    try {
      const params = scope === "standard" ? { standard: bulkDeleteStandard } : {};
      await apiClient.delete("/leaderboard", params, { headers });
      setLeaderboardListStatus(`Deleted ${label}.`);
      setBulkDeleteStandard("");
      await fetchLeaderboardList();
    } catch (error) {
      setLeaderboardListStatus(error.message || "Unable to delete entries.");
    } finally {
      setBulkDeleteLoading(false);
    }
  };
`;

if (!text.includes(target)) {
  throw new Error("target not found");
}

const result = text.replace(target, addition);
fs.writeFileSync(filePath, result, "utf8");
