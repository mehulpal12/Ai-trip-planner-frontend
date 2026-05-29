
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export const API_ROUTES = {
  USERS: `${API_BASE_URL}/api/users`,
  TRIPS: `${API_BASE_URL}/api/trips`,
  AI:    `${API_BASE_URL}/api/ai`
};

export { API_BASE_URL };