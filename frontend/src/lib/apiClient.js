const rawBase = import.meta.env.VITE_API_BASE_URL ?? "https://vidyacoachingclasses-backend.onrender.com/api";
const API_BASE = rawBase.endsWith("/") ? rawBase : rawBase + "/";

const buildUrl = (path, params = {}) => {
  const relativePath = path?.startsWith("/") ? path.slice(1) : path;
  const url = new URL(relativePath, API_BASE);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.message || "API request failed.");
    error.status = res.status;
    error.payload = data;
    throw error;
  }
  return data;
};

export const apiClient = {
  get: async (path, params, options = {}) => {
    const res = await fetch(buildUrl(path, params), {
      method: "GET",
      ...options,
    });
    return handleResponse(res);
  },
  delete: async (path, paramsOrOptions = {}, options = {}) => {
    let params = {};
    let opts = options;
    if (options && Object.keys(options).length) {
      params = paramsOrOptions;
    } else if (paramsOrOptions && ("headers" in paramsOrOptions || "body" in paramsOrOptions)) {
      opts = paramsOrOptions;
      params = {};
    } else {
      params = paramsOrOptions;
    }
    const res = await fetch(buildUrl(path, params), {
      method: "DELETE",
      headers: {
        ...(opts.headers || {}),
      },
    });
    return handleResponse(res);
  },
  put: async (path, body, options = {}) => {
    const res = await fetch(buildUrl(path), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  post: async (path, body, options = {}) => {
    const res = await fetch(buildUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  ADMIN_HEADERS: (apiKey) => ({
    "x-admin-api-key": apiKey,
  }),
};
