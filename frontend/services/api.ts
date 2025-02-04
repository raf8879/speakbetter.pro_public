import axios from "axios";

let onLogoutCallback: () => void = () => {};

export function setOnLogoutCallback(fn: () => void) {
  onLogoutCallback = fn;
}

export const api = axios.create({
  baseURL: "https://speakbetter.pro",
  withCredentials: true, /
});

let isRefreshing = false;
let refreshSubscribers: Array<(ok: boolean) => void> = [];

function subscribeTokenRefresh(cb: (ok: boolean) => void) {
  refreshSubscribers.push(cb);
}
function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

async function refreshToken() {
  console.log("[api] Attempting refresh");
  const resp = await api.post("/api/token/refresh/");
  console.log("[api] Refresh OK");
  return resp;
}

async function doLogout() {
  console.warn("[api] Refresh failed => calling onLogoutCallback");
  onLogoutCallback(); 
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Если не 401 -> отдаём дальше
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Проверка: если запрос сам к /api/token/refresh/, не рефрешим
    const originalRequest = error.config as any;
    if (originalRequest.url.includes("/api/token/")) {
      await doLogout();
      return Promise.reject(error);
    }

    // Если уже делали retry
    if (originalRequest._retry) {
      await doLogout();
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // Если уже идёт рефреш => подписываемся
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((ok) => {
          if (ok) {
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    // Начинаем рефреш
    isRefreshing = true;
    try {
      await refreshToken();
      onRefreshed(true);
      // Повторяем запрос
      return api(originalRequest);
    } catch (err) {
      onRefreshed(false);
      await doLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
