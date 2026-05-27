import { TripItem, TripMember } from "@/features/dashboard/types/dashboard.types";
import { ApiResponse } from "@/types/api.types";

const BASE_URL = "http://localhost:4001/api/trips";

type TripPayload = {
  title: string;
  country?: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes?: string;
};

type RawTrip = Omit<Partial<TripItem>, "_id"> & {
  id?: string;
  _id?: string;
  description?: string;
  destinations?: Array<{
    city?: string | null;
    name?: string | null;
  }>;
};

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const unwrap = async <T>(response: Response): Promise<T> => {
  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Request failed with status ${response.status}`);
  }

  return body.data;
};

const normalizeTrip = (trip: RawTrip): TripItem => ({
  ...trip,
  _id: trip._id || trip.id || "",
  destination:
    trip.destination ||
    trip.destinations?.[0]?.city ||
    trip.destinations?.[0]?.name ||
    "",
  notes: trip.notes || trip.description || "",
} as TripItem);

export const tripService = {
  async getTrips(token: string): Promise<TripItem[]> {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: authHeaders(token),
    });

    const trips = await unwrap<RawTrip[]>(response);
    return trips.map(normalizeTrip);
  },

  async createTrip(token: string, payload: TripPayload): Promise<TripItem> {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });

    return normalizeTrip(await unwrap<RawTrip>(response));
  },

  async updateTrip(token: string, tripId: string, payload: TripPayload): Promise<TripItem> {
    const response = await fetch(`${BASE_URL}/${tripId}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });

    return normalizeTrip(await unwrap<RawTrip>(response));
  },

  async deleteTrip(token: string, tripId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/${tripId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });

    await unwrap<never>(response);
  },

  async getMembers(token: string, tripId: string): Promise<TripMember[]> {
    const response = await fetch(`${BASE_URL}/${tripId}/members`, {
      headers: authHeaders(token),
    });

    return unwrap<TripMember[]>(response);
  },

  async addMember(token: string, tripId: string, memberName: string): Promise<TripMember> {
    const response = await fetch(`${BASE_URL}/${tripId}/members`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ memberName }),
    });

    return unwrap<TripMember>(response);
  },

  async removeMember(token: string, tripId: string, userId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/${tripId}/members/${userId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });

    await unwrap<never>(response);
  },
};
