import sharp from "sharp";

const BASE64_IMAGE_REGEX = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i;
const CONVERTIBLE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);
const CONVERSION_CANDIDATES = [
  {
    mimeType: "image/avif",
    convert: (input) => sharp(input).avif({ quality: 55 }).toBuffer(),
  },
  {
    mimeType: "image/webp",
    convert: (input) => sharp(input).webp({ quality: 75, effort: 4 }).toBuffer(),
  },
];

const pickBestBuffer = (results) =>
  results.reduce((best, current) => {
    if (!best) return current;
    return current.buffer.length < best.buffer.length ? current : best;
  }, null);

const convertBase64ImageForStorage = async (value) => {
  if (typeof value !== "string") {
    return value;
  }
  const match = BASE64_IMAGE_REGEX.exec(value);
  if (!match) {
    return value;
  }
  const [, mimeTypeToken, payload] = match;
  const mimeType = mimeTypeToken.toLowerCase();
  if (!CONVERTIBLE_MIME_TYPES.has(mimeType)) {
    return value;
  }
  try {
    const buffer = Buffer.from(payload, "base64");
    const conversions = await Promise.all(
      CONVERSION_CANDIDATES.map(async (candidate) => {
        try {
          const converted = await candidate.convert(buffer);
          return { mimeType: candidate.mimeType, buffer: converted };
        } catch {
          return null;
        }
      }),
    );
    const valid = conversions.filter(Boolean);
    if (!valid.length) {
      return value;
    }
    const best = pickBestBuffer(valid);
    if (!best) {
      return value;
    }
    return `data:${best.mimeType};base64,${best.buffer.toString("base64")}`;
  } catch (error) {
    console.warn("Image conversion failed:", error?.message || error);
    return value;
  }
};

export const convertImageForStorage = convertBase64ImageForStorage;
export const convertGalleryImageForStorage = convertBase64ImageForStorage;
