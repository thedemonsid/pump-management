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
  (error) => {
    console.error("Response error:", error);

    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        // Token expired or invalid - logout and redirect to login
        console.log("Token expired or invalid, logging out...");
        handleTokenExpiration();
        return Promise.reject(
          new Error("Authentication expired. Please log in again.")
        );
      }

      const message =
        error.response.data?.message ||
        error.response.statusText ||
        "Server error";
      throw new Error(`${error.response.status}: ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      // Check if we have a token - if so, might be token expiration causing connection failure
      if (localStorage.getItem("authToken")) {
        console.log(
          "Network error with token present - likely token expired, logging out..."
        );
        handleTokenExpiration();
        window.location.href = "/login";
        return Promise.reject(
          new Error("Authentication expired. Please log in again.")
        );
      }
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
