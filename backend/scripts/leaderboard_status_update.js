const fs = require("fs");
const path = require("path");

const filePath = path.join("src", "pages", "Admin.jsx");
const text = fs.readFileSync(filePath, "utf8");

const target = `      setLeaderboardStatus("Leaderboard saved.");
      setShowLeaderboardForm(false);
      setLeaderboardSelections(
        Array.from({ length: 3 }, () => ({ studentId: "", percentage: "" }))
      );
      setLeaderboardSearch("");
      await fetchResultList();
    } catch (error) {
      setLeaderboardStatus(error.message || "Unable to save leaderboard.");
    } finally {`;

const replacement = `      setLeaderboardStatus("Leaderboard saved.");
      setLeaderboardListStatus("Leaderboard saved.");
      setShowLeaderboardForm(false);
      setLeaderboardSelections(
        Array.from({ length: 3 }, () => ({ studentId: "", percentage: "" }))
      );
      setLeaderboardSearch("");
      await fetchResultList();
      await fetchLeaderboardList();
    } catch (error) {`;

if (!text.includes(target)) {
  throw new Error("target not found");
}

const result = text.replace(target, replacement);
fs.writeFileSync(filePath, result, "utf8");
