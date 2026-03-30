import fs from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credentialsFile = path.join(__dirname, "..", "data", "adminCredentials.json");

const hashPassword = (password) =>
  createHash("sha256").update(String(password)).digest("hex");

const ensureCredentialsFile = async () => {
  try {
    await fs.access(credentialsFile);
  } catch {
    await fs.mkdir(path.dirname(credentialsFile), { recursive: true });
    const defaultCredentials = {
      username: "vidyacoachingclasses.vcc.com",
      passwordHash: hashPassword("1234567"),
    };
    await fs.writeFile(credentialsFile, JSON.stringify(defaultCredentials, null, 2));
  }
};

const readCredentials = async () => {
  await ensureCredentialsFile();
  const contents = await fs.readFile(credentialsFile, "utf-8");
  return JSON.parse(contents);
};

export const getAdminCredentials = async () => readCredentials();

export const verifyAdminCredentials = async (username, password) => {
  const credentials = await readCredentials();
  if (!username || !password) return false;
  return (
    credentials.username === username &&
    credentials.passwordHash === hashPassword(password)
  );
};

export const updateAdminPassword = async (newPassword) => {
  const credentials = await readCredentials();
  const updated = {
    ...credentials,
    passwordHash: hashPassword(newPassword),
  };
  await fs.writeFile(credentialsFile, JSON.stringify(updated, null, 2));
  return updated;
};
