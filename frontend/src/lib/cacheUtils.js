import { useEffect } from "react";

const CACHE_PREFIX = "vidya-cache:";

export const CACHE_KEYS = {
  HOME_FEATURED_RESULTS: `${CACHE_PREFIX}home-featured-results`,
  HOME_FEATURED_COURSES: `${CACHE_PREFIX}home-featured-courses`,
  HOME_OFFER_BANNERS: `${CACHE_PREFIX}home-offer-banners`,
  HOME_GALLERY: `${CACHE_PREFIX}home-gallery-showcase`,
  GALLERY_FOLDERS: `${CACHE_PREFIX}gallery-folders`,
  RESULTS_SECTIONS: `${CACHE_PREFIX}results-sections`,
  LEADERBOARD_DATA: `${CACHE_PREFIX}leaderboard-data`,
};

export const ALL_CACHE_KEYS = Object.values(CACHE_KEYS);

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getLocalCache = (key) => {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(key);
  if (!raw) return null;
  return safeParse(raw);
};

export const setLocalCache = (key, value) => {
  const storage = getStorage();
  if (!storage) return;
  if (value === null || typeof value === "undefined") {
    storage.removeItem(key);
    return;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently ignore storage quota issues
  }
};

export const clearLocalCache = (key) => {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(key);
};

export const clearMultipleLocalCache = (keys = []) => {
  keys.forEach((key) => clearLocalCache(key));
};

export const useClearCacheOnUnload = (keys = ALL_CACHE_KEYS) => {
  useEffect(() => {
    const storage = getStorage();
    if (!storage) return undefined;
    const handleBeforeUnload = () => {
      clearMultipleLocalCache(keys);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [keys]);
};
