import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ImageOff,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Folder,
  ArrowLeft,
  Grid3x3,
  LayoutGrid,
} from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { useAdminSession } from "../contexts/AdminSession";
import { groupGalleryImages, slugify } from "../lib/galleryUtils";
import {
  getLocalCache,
  setLocalCache,
  useClearCacheOnUnload,
  CACHE_KEYS,
} from "../lib/cacheUtils";

const getCachedGalleryFolders = () => {
  const cached = getLocalCache(CACHE_KEYS.GALLERY_FOLDERS);
  return Array.isArray(cached) ? cached : [];
};

const formatDate = (value) => {
  if (!value) return "Uploaded recently";
  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Uploaded recently";
    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Uploaded recently";
  }
};

const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Custom hook for touch gestures
const useTouchGestures = (
  onSwipeLeft,
  onSwipeRight,
  onDoubleTap,
  enabled = true,
) => {
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const lastTap = useRef(0);

  const handleTouchStart = (e) => {
    if (!enabled) return;
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e) => {
    if (!enabled) return;
    const touchEnd = e.changedTouches[0];
    const dx = touchEnd.clientX - touchStart.current.x;
    const dy = touchEnd.clientY - touchStart.current.y;
    const timeDiff = Date.now() - touchStart.current.time;

    // Double tap detection
    const now = Date.now();
    if (now - lastTap.current < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      if (onDoubleTap) onDoubleTap();
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;

    // Swipe detection (horizontal)
    if (Math.abs(dx) > 50 && Math.abs(dy) < 50 && timeDiff < 300) {
      if (dx > 0 && onSwipeRight) onSwipeRight();
      if (dx < 0 && onSwipeLeft) onSwipeLeft();
    }
  };

  return { handleTouchStart, handleTouchEnd };
};

const GALLERY_LOADER_DISPLAY_PERCENT = 99;

const GalleryDisplay = ({ isAdmin = false }) => {
  const { credentials, isAdminAuthenticated } = useAdminSession();
  const adminHeaders = isAdminAuthenticated
    ? {
        "x-admin-username": credentials.username,
        "x-admin-password": credentials.password,
      }
    : {};

  const initialGalleryFolders = useMemo(
    () => getCachedGalleryFolders(),
    [],
  );
  const [folders, setFolders] = useState(initialGalleryFolders);
  const [newFolders, setNewFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState("");
  const [isViewingFolder, setIsViewingFolder] = useState(false);
  const [loading, setLoading] = useState(
    initialGalleryFolders.length === 0,
  );
  const [loadPercent, setLoadPercent] = useState(
    initialGalleryFolders.length === 0 ? 0 : 100,
  );
  const [loaderValue, setLoaderValue] = useState(1);
  const loaderTimer = useRef(null);
  const isLoaderVisible = loading || loadPercent < 100;
  const [error, setError] = useState("");
  const [layoutMode, setLayoutMode] = useState("grid"); // grid or list for mobile

  // Lightbox & Zoom/Pan state
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPinchDistance, setInitialPinchDistance] = useState(null);
  const [initialZoom, setInitialZoom] = useState(1);

  const fileInputRef = useRef(null);
  const imageContainerRef = useRef(null);
  const lightboxRef = useRef(null);
  const imageLoadersRef = useRef([]);

  const cancelImageLoads = useCallback(() => {
    imageLoadersRef.current.forEach((img) => {
      img.onload = null;
      img.onerror = null;
    });
    imageLoadersRef.current = [];
  }, []);

  const stopLoaderTimer = () => {
    if (loaderTimer.current) {
      clearInterval(loaderTimer.current);
      loaderTimer.current = null;
    }
  };

  const startLoaderTimer = () => {
    stopLoaderTimer();
    setLoaderValue(1);
    loaderTimer.current = window.setInterval(() => {
      setLoaderValue((prev) => {
        if (prev >= GALLERY_LOADER_DISPLAY_PERCENT) {
          stopLoaderTimer();
          return GALLERY_LOADER_DISPLAY_PERCENT;
        }
        return prev + 1;
      });
    }, 40);
  };

  const trackGalleryImageLoading = useCallback((folders = [], shouldTrack = true) => {
    cancelImageLoads();
    if (!shouldTrack) {
      setLoadPercent(100);
      return;
    }
    const urls = [];
    folders.forEach((folder) => {
      folder.images.forEach((image) => {
        if (image.imageUrl) {
          urls.push(image.imageUrl);
        }
      });
    });
    const uniqueUrls = [...new Set(urls)];
    if (uniqueUrls.length === 0) {
      setLoadPercent(100);
      setLoading(false);
      return;
    }
    setLoadPercent(0);
    let loadedCount = 0;
    const handleProgress = () => {
      loadedCount += 1;
      const percent = Math.round((loadedCount / uniqueUrls.length) * 100);
      setLoadPercent(
        loadedCount === uniqueUrls.length ? 100 : Math.max(1, percent),
      );
      if (loadedCount === uniqueUrls.length) {
        setLoading(false);
        cancelImageLoads();
      }
    };
    uniqueUrls.forEach((src) => {
      const img = new Image();
      imageLoadersRef.current.push(img);
      img.onload = handleProgress;
      img.onerror = handleProgress;
      img.src = src;
    });
  }, [cancelImageLoads]);

  useEffect(() => {
    if (isLoaderVisible) {
      startLoaderTimer();
    } else {
      stopLoaderTimer();
      setLoaderValue(GALLERY_LOADER_DISPLAY_PERCENT);
    }
    return () => stopLoaderTimer();
  }, [isLoaderVisible]);

  useEffect(() => {
    return () => {
      cancelImageLoads();
    };
  }, []);

  useClearCacheOnUnload();

  const fetchGallery = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) {
        setLoading(true);
      }
      setError("");
      try {
        const data = await apiClient.get("/gallery");
        const grouped = groupGalleryImages(data);
        setFolders(grouped);
        setLocalCache(CACHE_KEYS.GALLERY_FOLDERS, grouped);
        setNewFolders((prev) =>
          prev.filter(
            (folder) =>
              !grouped.some(
                (serverFolder) =>
                  serverFolder.category.toLowerCase() ===
                  folder.category.toLowerCase(),
            ),
          ),
        );
        if (showLoading) {
          trackGalleryImageLoading(grouped, showLoading);
        } else {
          setLoadPercent(100);
        }
      } catch (fetchError) {
        setError(fetchError.message || "Unable to load the gallery.");
        setLoadPercent(100);
        if (showLoading) {
          setLoading(false);
        }
      } finally {
      }
    },
    [trackGalleryImageLoading],
  );

  const displayedFolders = useMemo(() => {
    const existingCategories = new Set(
      folders.map((folder) => folder.category.toLowerCase()),
    );
    return [
      ...newFolders.filter(
        (folder) => !existingCategories.has(folder.category.toLowerCase()),
      ),
      ...folders,
    ];
  }, [folders, newFolders]);

  useEffect(() => {
    const hasCache = initialGalleryFolders.length > 0;
    if (hasCache) {
      setFolders(initialGalleryFolders);
      setLoading(false);
    }
    fetchGallery({ showLoading: !hasCache });
  }, [fetchGallery, initialGalleryFolders]);

  const activeFolder = isViewingFolder
    ? displayedFolders.find((folder) => folder.id === activeFolderId) ?? null
    : null;
  const activeImages = activeFolder?.images ?? [];
  const selectedCount = activeImages.filter((img) => img.featured).length;
  const totalImages = folders.reduce(
    (sum, folder) => sum + folder.images.length,
    0,
  );

  const handleCreateFolder = () => {
    setError("");
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    const normalized = trimmed.toLowerCase();
    if (
      displayedFolders.some(
        (folder) => folder.category.toLowerCase() === normalized,
      )
    ) {
      setNewFolderName("");
      const existing = displayedFolders.find(
        (folder) => folder.category.toLowerCase() === normalized,
      );
      if (existing) {
        setActiveFolderId(existing.id);
      }
      return;
    }
    const placeholder = {
      id: `placeholder-${slugify(trimmed) || "new"}-${Date.now()}`,
      name: trimmed,
      category: trimmed,
      description: "New memories from Vidya Coaching Classes",
      images: [],
      isPlaceholder: true,
    };
    setNewFolders((prev) => [...prev, placeholder]);
    setActiveFolderId(placeholder.id);
    setIsViewingFolder(true);
    setIsCreatingFolder(false);
    setNewFolderName("");
  };

  const handleUploadClick = (folderId) => {
    setUploadTargetFolderId(folderId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilesSelected = async (event) => {
    setError("");
    const files = Array.from(event.target.files ?? []);
    const folderId = uploadTargetFolderId || activeFolder?.id;
    if (!files.length || !folderId) return;
    const targetFolder = displayedFolders.find(
      (folder) => folder.id === folderId,
    );
    if (!targetFolder) return;
    if (!isAdminAuthenticated) {
      setError("Log in to upload gallery images.");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    const payload = [];
    const supported = ["image/jpeg", "image/png", "image/webp"];
    let processed = 0;
    for (const file of files) {
      if (!supported.includes(file.type)) {
        processed += 1;
        continue;
      }
      try {
        const dataUrl = await readImageFile(file);
        payload.push({
          title: file.name.replace(/\.[^.]+$/, ""),
          category: targetFolder.category,
          description: "",
          imageUrl: dataUrl,
          featured: false,
        });
      } catch (fileError) {
        console.error("Unable to read file", fileError);
      } finally {
        processed += 1;
        setUploadProgress(Math.round((processed / files.length) * 80));
      }
    }
    if (!payload.length) {
      setUploading(false);
      setUploadProgress(0);
      return;
    }
    try {
      await apiClient.post(
        "/gallery/batch",
        { images: payload },
        { headers: adminHeaders },
      );
      setUploadProgress(100);
      await fetchGallery();
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload gallery images.");
    } finally {
      setUploading(false);
      setUploadTargetFolderId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => setUploadProgress(0), 600);
    }
  };

  const handleToggleFeatured = async (folderId, imageId) => {
    setError("");
    if (!isAdminAuthenticated) return;
    const folder = folders.find((item) => item.id === folderId);
    const image = folder?.images.find((img) => img.id === imageId);
    if (!image) return;
    const nextValue = !image.featured;
    try {
      await apiClient.put(
        `/gallery/${imageId}`,
        { featured: nextValue },
        { headers: adminHeaders },
      );
      setFolders((prev) =>
        prev.map((item) =>
          item.id === folderId
            ? {
                ...item,
                images: item.images.map((img) =>
                  img.id === imageId ? { ...img, featured: nextValue } : img,
                ),
              }
            : item,
        ),
      );
    } catch (toggleError) {
      setError(toggleError.message || "Unable to update featured state.");
    }
  };

  const handleDeleteImage = async (folderId, imageId) => {
    setError("");
    if (!isAdminAuthenticated) {
      setError("Log in to delete gallery images.");
      return;
    }
    if (!window.confirm("Remove this photo from the folder?")) {
      return;
    }
    try {
      await apiClient.delete(`/gallery/${imageId}`, { headers: adminHeaders });
      await fetchGallery();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete this photo.");
    }
  };

  const handleDeleteFolder = async (folderId) => {
    setError("");
    const folder = displayedFolders.find((item) => item.id === folderId);
    if (!folder) return;
    if (!isAdminAuthenticated) {
      setError("Log in to delete gallery folders.");
      return;
    }
    if (folder.isPlaceholder) {
      setNewFolders((prev) => prev.filter((item) => item.id !== folderId));
      if (activeFolderId === folderId) {
        setActiveFolderId("");
      }
      return;
    }
    if (
      !window.confirm(
        `Delete all photos in ${folder.name}? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await apiClient.delete(
        `/gallery/categories/${encodeURIComponent(folder.category)}`,
        { headers: adminHeaders },
      );
      await fetchGallery();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete the folder.");
    }
  };

  const resetZoomAndPan = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  };

  // Handle pinch zoom for mobile
  const handleTouchStartPinch = (e) => {
    if (lightboxIndex === null) return;
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      setInitialPinchDistance(distance);
      setInitialZoom(zoomLevel);
    }
  };

  const handleTouchMovePinch = (e) => {
    if (initialPinchDistance === null || lightboxIndex === null) return;
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDistance = Math.sqrt(dx * dx + dy * dy);
      const scale = newDistance / initialPinchDistance;
      let newZoom = Math.min(Math.max(1, initialZoom * scale), 5);
      setZoomLevel(newZoom);
      if (newZoom <= 1) {
        setPan({ x: 0, y: 0 });
      }
    }
  };

  const handleTouchEndPinch = () => {
    setInitialPinchDistance(null);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") {
        setLightboxIndex(null);
        resetZoomAndPan();
      }
      if (e.key === "ArrowRight") {
        resetZoomAndPan();
        setLightboxIndex((prev) => (prev + 1) % activeImages.length);
      }
      if (e.key === "ArrowLeft") {
        resetZoomAndPan();
        setLightboxIndex(
          (prev) => (prev - 1 + activeImages.length) % activeImages.length,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, activeImages.length]);

  // Handle Ctrl+Scroll for zoom
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomDelta = e.deltaY * -0.005;
        setZoomLevel((prev) => Math.min(Math.max(1, prev + zoomDelta), 5));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [lightboxIndex]);

  // Drag handlers for panning
  const handlePointerDown = (e) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Swipe handlers for lightbox
  const handleNext = () => {
    if (!activeImages.length) return;
    resetZoomAndPan();
    setLightboxIndex((prev) => (prev + 1) % activeImages.length);
  };

  const handlePrev = () => {
    if (!activeImages.length) return;
    resetZoomAndPan();
    setLightboxIndex(
      (prev) => (prev - 1 + activeImages.length) % activeImages.length,
    );
  };

  const handleDoubleTap = () => {
    if (zoomLevel > 1) {
      resetZoomAndPan();
    } else {
      setZoomLevel(2.5);
      setPan({ x: 0, y: 0 });
    }
  };

  const {
    handleTouchStart: lightboxTouchStart,
    handleTouchEnd: lightboxTouchEnd,
  } = useTouchGestures(
    handleNext,
    handlePrev,
    handleDoubleTap,
    lightboxIndex !== null,
  );


  const folderGrid = useMemo(() => {
    return displayedFolders.map((folder) => {
      const cover = folder.images[0]?.imageUrl;
      return (
        <motion.div
          key={folder.id}
          className="group relative flex flex-col overflow-hidden rounded-2xl md:rounded-[28px] border border-slate-200 bg-white shadow-md hover:shadow-xl transition-all touch-manipulation cursor-pointer"
          onClick={() => {
            setActiveFolderId(folder.id);
            setIsViewingFolder(true);
          }}
          whileTap={{ scale: 0.98 }}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setActiveFolderId(folder.id);
            }
          }}
        >
          {isAdmin && (
            <span
              type="button"
              className="absolute top-3 right-3 z-20 rounded-full border border-white bg-white/90 p-2 text-slate-500 shadow-sm transition active:scale-95"
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteFolder(folder.id);
              }}
            >
              <Trash2 size={16} />
            </span>
          )}
          <div className="relative h-40 md:h-52 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
            {cover ? (
              <img
                src={cover}
                alt={folder.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <Folder size={40} />
                <p className="mt-2 text-xs">Empty folder</p>
              </div>
            )}
          </div>
          <div className="px-4 py-3 md:px-6 md:py-4 space-y-1 text-left">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-orange-500 font-semibold">
              {folder.images.length
                ? `${folder.images.length} memories`
                : "Ready for photos"}
            </p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900 truncate">
              {folder.name}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2">
              {folder.description}
            </p>
          </div>
        </motion.div>
      );
    });
  }, [folders, isAdmin]);

  const activeFolderContent = (
    <div className="space-y-4 md:space-y-8 pb-24">
      {/* Mobile-friendly header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 -mx-4 px-4 py-3 md:static md:bg-transparent md:backdrop-blur-none md:border-none md:p-0">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
          onClick={() => {
            setIsViewingFolder(false);
            setActiveFolderId("");
            setLightboxIndex(null);
            resetZoomAndPan();
          }}
            className="flex items-center gap-1 text-sm font-semibold text-slate-600 active:text-orange-500 transition px-2 py-1 rounded-full active:bg-slate-100"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="text-center flex-1">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wide">
              {activeFolder?.name}
            </p>
            <p className="text-[11px] text-slate-500">
              {activeImages.length}{" "}
              {activeImages.length === 1 ? "photo" : "photos"} · {selectedCount}{" "}
              featured
            </p>
          </div>

          <div className="flex items-center gap-1">
            {/* Layout toggle for mobile */}
            <button
              onClick={() =>
                setLayoutMode(layoutMode === "grid" ? "list" : "grid")
              }
              className="md:hidden p-2 rounded-full bg-slate-100 active:bg-slate-200 transition"
            >
              {layoutMode === "grid" ? (
                <LayoutGrid size={18} />
              ) : (
                <Grid3x3 size={18} />
              )}
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => handleUploadClick(activeFolder?.id)}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Add</span>
              </button>
            )}
          </div>
        </div>

        {!isAdmin && (
          <p className="text-center text-[10px] text-slate-400 mt-2">
            📸 Contact admin to add photos
          </p>
        )}
      </div>

      {uploading && (
        <div className="space-y-1 px-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 text-center">
            Uploading {uploadProgress}%...
          </p>
        </div>
      )}

      {activeImages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center mx-2"
        >
          <ImageOff size={48} className="text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">
            No images yet in {activeFolder?.name}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? "Tap the + button to upload your first memory"
              : "Check back soon for new memories!"}
          </p>
        </motion.div>
      ) : (
        <div
          className={`grid gap-3 px-1 ${
            layoutMode === "grid"
              ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {activeImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative flex flex-col overflow-hidden bg-white shadow-sm border border-slate-100 ${
                layoutMode === "grid"
                  ? "rounded-xl"
                  : "rounded-xl flex-row h-28"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {isAdmin && (
                <div
                  className={`absolute ${layoutMode === "grid" ? "top-2 right-2" : "top-2 right-2"} z-10 flex gap-1`}
                >
                  <button
                    type="button"
                    className="rounded-full bg-white/95 p-1.5 shadow-sm backdrop-blur active:scale-95 transition"
                    onClick={() =>
                      handleToggleFeatured(activeFolder?.id, image.id)
                    }
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        image.featured
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      <Check size={12} />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-white/95 p-1.5 shadow-sm text-rose-500 active:scale-95 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(activeFolder?.id, image.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}

              <div
                className={`cursor-pointer overflow-hidden bg-slate-50 ${
                  layoutMode === "grid" ? "aspect-square w-full" : "w-28 h-full"
                }`}
                onClick={() => {
                  setLightboxIndex(index);
                  resetZoomAndPan();
                }}
              >
                <img
                  src={image.imageUrl}
                  alt="Gallery"
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div
                className={`flex-1 p-2 ${layoutMode === "list" ? "flex flex-col justify-center" : ""}`}
              >
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {formatDate(image.uploadedAt)}
                </p>
                <span
                  className={`inline-block text-[9px] px-2 py-0.5 rounded-full mt-1 ${
                    image.featured
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {image.featured ? "Featured" : "In folder"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      {/* Hero Section - Mobile Optimized */}
      <div className="relative px-4 pt-8 pb-8 md:pt-16 md:pb-16 text-center">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-orange-100/40 to-transparent blur-2xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-orange-500 font-semibold">
            Events · Picnics · Celebrations
          </p>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight mt-2">
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Memories
            </span>{" "}
            Gallery
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-2 max-w-md mx-auto px-4">
            Create folders, upload moments, and highlight your favorites
          </p>
        </motion.div>
      </div>

      <div className="px-4 pb-20 max-w-7xl mx-auto">
        {activeFolder ? (
          activeFolderContent
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
                  <Folder size={24} className="text-orange-500" />
                  All Folders
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {totalImages} photo{totalImages !== 1 ? "s" : ""} ·{" "}
                  {displayedFolders.length} folder
                  {displayedFolders.length !== 1 ? "s" : ""}
                </p>
                {error && (
                  <p className="text-sm text-rose-500 mt-2">{error}</p>
                )}
              </div>
              {isAdmin && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreatingFolder(true)}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-md"
                >
                  <Plus size={18} />
                  New Folder
                </motion.button>
              )}
            </div>

      {isLoaderVisible && displayedFolders.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500 transition-colors">
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-violet-500 opacity-80 blur-sm"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
              <motion.span
                className="absolute inset-2 rounded-full border-2 border-white/40"
                animate={{ scale: [1, 0.82, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                className="h-9 w-9 rounded-full bg-white shadow-lg"
                animate={{
                  y: [0, -9, 0],
                  x: [0, 6, -6, 0],
                  boxShadow: [
                    "0 0 0 rgba(249, 115, 22, 0)",
                    "0 12px 24px rgba(15, 23, 42, 0.25)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-500">
              Syncing gallery memories…
            </span>
            <p className="text-[11px] text-slate-400">
              Hang tight while we load your folders.
            </p>
            <p className="text-[10px] uppercase tracking-[0.4em] text-orange-500">
              {Math.min(
                GALLERY_LOADER_DISPLAY_PERCENT,
                Math.max(1, Math.round(loaderValue)),
              )}
              % ready
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {folderGrid}
        </div>
      )}
          </motion.div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {/* Mobile-Optimized Lightbox with Touch Gestures */}
      <AnimatePresence>
        {lightboxIndex !== null && activeImages[lightboxIndex] && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md"
            onTouchStart={(e) => {
              lightboxTouchStart(e);
              handleTouchStartPinch(e);
            }}
            onTouchMove={(e) => {
              handleTouchMovePinch(e);
              e.preventDefault();
            }}
            onTouchEnd={(e) => {
              lightboxTouchEnd(e);
              handleTouchEndPinch();
            }}
            onClick={() => {
              setLightboxIndex(null);
              resetZoomAndPan();
            }}
          >
            {/* Header Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-[60]">
              <div className="bg-black/50 rounded-full px-3 py-1.5 backdrop-blur-sm">
                <span className="text-white text-xs font-mono">
                  {lightboxIndex + 1} / {activeImages.length}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(null);
                  resetZoomAndPan();
                }}
                className="text-white bg-black/50 rounded-full p-2 backdrop-blur-sm active:scale-95 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3 bg-black/70 rounded-full px-4 py-2 backdrop-blur-md z-[60]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.max(1, z - 0.5));
                  if (zoomLevel <= 1.5) setPan({ x: 0, y: 0 });
                }}
                className="text-white p-1.5 active:scale-90 transition"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-white text-xs font-mono min-w-[45px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.min(5, z + 0.5));
                }}
                className="text-white p-1.5 active:scale-90 transition"
              >
                <ZoomIn size={18} />
              </button>
            </div>

            {/* Navigation Arrows (only visible on larger screens) */}
            {zoomLevel <= 1.2 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-3 hover:bg-black/50 transition"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-3 hover:bg-black/50 transition"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            {/* Image Container for Pan and Zoom */}
            <div
              ref={imageContainerRef}
              className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={{
                cursor:
                  zoomLevel > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
              }}
            >
              <img
                src={activeImages[lightboxIndex].imageUrl}
                alt="Expanded view"
                draggable={false}
                className="max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-75"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Swipe indicator for mobile */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-[10px] md:hidden">
              ← Swipe to navigate →
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Folder Modal - Mobile Friendly */}
      <AnimatePresence>
        {isCreatingFolder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 px-4"
            onClick={() => setIsCreatingFolder(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Folder size={20} className="text-orange-500" />
                  Create New Folder
                </h3>
                <button
                  onClick={() => setIsCreatingFolder(false)}
                  className="p-1 rounded-full active:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Give your folder a name to organize your memories
              </p>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., Summer Camp, Farewell Party"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                autoFocus
              />
              <div className="mt-5 flex gap-3">
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 text-sm font-bold text-white shadow-md active:scale-95 transition"
                >
                  Create Folder
                </button>
                <button
                  onClick={() => setIsCreatingFolder(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 active:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryDisplay;
