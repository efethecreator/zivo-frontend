// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (Platform.OS === 'web' 
    ? "http://localhost:4000/api" 
    : "http://10.0.2.2:4000/api"); // Android emulator
    // : "http://localhost:4000/api"); // iOS simulator

// App Configuration
export const APP_NAME = "Zivo";
export const APP_DESCRIPTION = "Book appointments with your favorite businesses";

// Theme Configuration
export const PRIMARY_COLOR = "#2596be";
export const SECONDARY_COLOR = "#1B9AAA";
export const ACCENT_COLOR = "#FF3B30";
export const TEXT_COLOR = "#333333";
export const LIGHT_TEXT_COLOR = "#666666";
export const BACKGROUND_COLOR = "#FFFFFF";
export const LIGHT_BACKGROUND_COLOR = "#F5F5F5";

// Storage Keys
export const TOKEN_KEY = "token";
export const USER_KEY = "user";

// Date & Time
export const DATE_FORMAT = "DD/MM/YYYY";
export const TIME_FORMAT = "HH:mm";
export const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100; 