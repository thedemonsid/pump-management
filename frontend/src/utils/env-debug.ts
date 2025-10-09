// Environment detection utility for debugging
export const getEnvironmentInfo = () => {
  return {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    proxyTarget: import.meta.env.VITE_PROXY_TARGET,
  };
};

// Log environment info on app start
console.log("🔧 Environment Info:", getEnvironmentInfo());
