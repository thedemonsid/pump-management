import axios from "axios";
import { handleTokenExpiration } from "@/hooks/useAuth";

// Create axios instance with dynamic base URL
// Development: Uses empty string to leverage Vite proxy
// Production: Uses /pump context path
const getApiBaseUrl = () => {
  // Get base URL from environment variable
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // If explicitly set in env, use that
  if (envBaseUrl !== undefined) {
    return envBaseUrl;
  }

  // Fallback: empty for dev (proxy), /pump for prod
  return import.meta.env.DEV ? "" : "";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );

    // Add authorization header if token exists
    const token = localStorage.getItem("authToken");
    console.log("Retrieved token from localStorage:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error("Response error:", error);

    const originalRequest = error.config;

    if (error.response) {
      const { status, data } = error.response;

      // Handle 403 Forbidden - authorization/permission errors
      if (status === 403) {
        console.error(
          "Access denied - insufficient permissions or invalid token"
        );

        // Check if this is an authorization error (not just permission issue)
        const errorCode = data?.errorCode;
        if (errorCode === "ACCESS_DENIED" && !originalRequest._retry) {
          // This might be due to expired/invalid token, try to refresh
          const refreshToken = localStorage.getItem("refreshToken");

          if (refreshToken && !isRefreshing) {
            originalRequest._retry = true;
            isRefreshing = true;

            try {
              console.log("Attempting to refresh token after 403 error...");

              const response = await axios.post(
                `${getApiBaseUrl()}/api/v1/users/refresh`,
                { refreshToken }
              );

              const { token: newAccessToken, refreshToken: newRefreshToken } =
                response.data;

              console.log("Token refreshed successfully after 403");

              // Update stored tokens
              localStorage.setItem("authToken", newAccessToken);
              if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
              }

              // Update the authorization header for the original request
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              // Process queued requests with new token
              processQueue(null, newAccessToken);
              isRefreshing = false;

              // Retry the original request
              return api(originalRequest);
            } catch (refreshError) {
              console.error("Token refresh failed after 403:", refreshError);
              processQueue(refreshError as Error, null);
              isRefreshing = false;
              handleTokenExpiration();
              return Promise.reject(
                new Error("Session expired. Please log in again.")
              );
            }
          } else {
            // No refresh possible, logout
            console.log(
              "No refresh token available for 403 error, logging out..."
            );
            handleTokenExpiration();
            return Promise.reject(
              new Error("Access denied. Please log in again.")
            );
          }
        }

        // If it's a genuine permission error after token is valid, just reject
        const message =
          data?.message || "You do not have permission to access this resource";
        throw new Error(`403: ${message}`);
      }

      // Handle 401 Unauthorized - authentication errors
      if (status === 401 && !originalRequest._retry) {
        // Token expired or invalid - try to refresh
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken && !isRefreshing) {
          if (originalRequest.url?.includes("/refresh")) {
            // Refresh endpoint itself failed, logout
            console.log("Refresh token expired, logging out...");
            handleTokenExpiration();
            return Promise.reject(
              new Error("Session expired. Please log in again.")
            );
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            console.log("Access token expired, attempting to refresh...");

            // Attempt to refresh the token
            const response = await axios.post(
              `${getApiBaseUrl()}/api/v1/users/refresh`,
              { refreshToken }
            );

            const { token: newAccessToken, refreshToken: newRefreshToken } =
              response.data;

            console.log("Token refreshed successfully");

            // Update stored tokens
            localStorage.setItem("authToken", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }

            // Update the authorization header for the original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Process queued requests with new token
            processQueue(null, newAccessToken);
            isRefreshing = false;

            // Retry the original request
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            console.error("Token refresh failed:", refreshError);
            processQueue(refreshError as Error, null);
            isRefreshing = false;
            handleTokenExpiration();
            return Promise.reject(
              new Error("Session expired. Please log in again.")
            );
          }
        } else if (isRefreshing) {
          // If a refresh is already in progress, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        } else {
          // No refresh token available, logout
          console.log("No refresh token available, logging out...");
          handleTokenExpiration();
          return Promise.reject(
            new Error("Authentication expired. Please log in again.")
          );
        }
      }

      const message =
        error.response.data?.message ||
        error.response.statusText ||
        "Server error";
      throw new Error(`${error.response.status}: ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Network error: No response from server");
    } else {
      // Something else happened
      throw new Error(`Request failed: ${error.message}`);
    }
  }
);

export default api;

// Re-export services for backward compatibility
export { ProductService } from "./product-service";
export { TankService } from "./tank-service";
export { NozzleService } from "./nozzle-service";
export { SalesmanService } from "./salesman-service";
export { ShiftService } from "./shift-service";
export { PumpService } from "./pump-service";
export { SupplierService } from "./supplier-service";
export { CustomerService } from "./customer-service";
export { PurchaseService } from "./purchase-service";
export { FuelPurchaseService } from "./fuel-purchase-service";
export { BankAccountService } from "./bank-account-service";
export { BillService } from "./bill-service";
export { SupplierPaymentService } from "./supplier-payment-service";
export { SalesmanShiftService } from "./salesman-shift-service";
export { NozzleAssignmentService } from "./nozzle-assignment-service";
