const fs = require("fs");
const path = require("path");

const filePath = path.join("src", "pages", "Admin.jsx");
const text = fs.readFileSync(filePath, "utf8");

const needle = `  useEffect(() => {
    if (!adminKey) {
      return;
    }
    const fetchLeaderboardList = async () => {
      setLeaderboardListError("");
      setLeaderboardListLoading(true);
      try {
        const data = await apiClient.get("/leaderboard");
        setLeaderboardList(Array.isArray(data) ? data : []);
      } catch (error) {
        setLeaderboardListError(error.message || "Unable to load leaderboard entries.");
      } finally {
        setLeaderboardListLoading(false);
      }
    };
    fetchLeaderboardList();
  }, [adminKey]);
`;

const replacement = `  const fetchLeaderboardList = async () => {
    setLeaderboardListError("");
    setLeaderboardListLoading(true);
    try {
      const data = await apiClient.get("/leaderboard");
      setLeaderboardList(Array.isArray(data) ? data : []);
    } catch (error) {
      setLeaderboardListError(error.message || "Unable to load leaderboard entries.");
    } finally {
      setLeaderboardListLoading(false);
    }
  };

  useEffect(() => {
    if (!adminKey) {
      return;
    }
    fetchLeaderboardList();
  }, [adminKey]);
`;

if (!text.includes(needle)) {
  throw new Error("needle missing block");
}

const result = text.replace(needle, replacement);
fs.writeFileSync(filePath, result, "utf8");
