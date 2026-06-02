import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";
import { API_ROUTES } from "@/config/api";
import {
  GenerateItineraryRequest,
  GenerateItineraryResponse,
} from "@/types/ai.types";

export const aiService = {
  async generateItinerary(
    payload: GenerateItineraryRequest
  ): Promise<GenerateItineraryResponse> {

    const response =
      await api.post<
        ApiResponse<GenerateItineraryResponse>
      >(
        `${API_ROUTES.AI}/itinerary/generate`,
        payload
      );

    return response.data.data;
  },

  async getCacheStats() {
    const response =
      await api.get(
        `${API_ROUTES.AI}/itinerary/cache-stats`
      );

    return response.data;
  },

  async clearCache() {
    const response =
      await api.delete(
        `${API_ROUTES.AI}/itinerary/cache`
      );

    return response.data;
  },
};