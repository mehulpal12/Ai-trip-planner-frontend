
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const API_ROUTES = {
  USERS: `${process.env.NEXT_PUBLIC_USERS_API}`,
  TRIPS: `${process.env.NEXT_PUBLIC_TRIPS_API}`,
  AI:    `${process.env.NEXT_PUBLIC_AI_API}`
};

export { API_BASE_URL };
