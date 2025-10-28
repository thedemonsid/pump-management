// Extend axios types to include our custom properties
import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}
