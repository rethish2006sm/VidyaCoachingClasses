const fs = require("fs");
const path = require("path");

const filePath = path.join("src", "pages", "Admin.jsx");
const text = fs.readFileSync(filePath, { encoding: "latin1" });
fs.writeFileSync(filePath, text, "utf8");
