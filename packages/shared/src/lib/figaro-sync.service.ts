import type {
  FigaroListSummary,
  FigaroReminder,
  FigaroBriefing,
  SubscriptionTier,
} from "../stores/figaro.store";

// Response type from Figaro API
export interface ModuleSummary {
  subscription: {
    tier: SubscriptionTier;
    expiresAt: string | null;
  };
  lists: FigaroListSummary[];
  reminders: FigaroReminder[];
  briefing: FigaroBriefing | null;
  memoriesCount: number;
}

// API error response
interface ApiError {
  error: string;
  code?: string;
}

/**
 * FigaroSyncService handles all communication with the Figaro API.
 *
 * The service is designed to:
 * - Fetch user data summaries for display in Figaro Tab widgets
 * - Handle authentication tokens
 * - Implement smart caching to minimize API calls
 */
export class FigaroSyncService {
  private readonly API_BASE = "https://textfigaro.com/api";

  // Stale threshold: 5 minutes
  private readonly STALE_THRESHOLD_MS = 5 * 60 * 1000;

  // Request timeout: 10 seconds
  private readonly REQUEST_TIMEOUT_MS = 10 * 1000;

  /**
   * Fetch a summary of user's Figaro data for widget display.
   *
   * This endpoint returns lightweight summaries optimized for the new tab page:
   * - Lists with item counts and top 3 items
   * - Upcoming reminders (next 24h)
   * - Latest briefing shortcode
   * - Subscription status
   *
   * @param token - Figaro API authentication token
   * @returns ModuleSummary with user data
   * @throws Error on API failure or network error
   */
  async fetchModuleSummary(token: string): Promise<ModuleSummary> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.API_BASE}/tab/summary`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: "Unknown error" })) as ApiError;

        // Specific handling for auth errors
        if (response.status === 401) {
          throw new Error(`401: ${errorBody.error || "Unauthorized"}`);
        }

        throw new Error(errorBody.error || `API error: ${response.status}`);
      }

      const data = await response.json() as ModuleSummary;

      // Validate response structure
      if (!this.isValidModuleSummary(data)) {
        throw new Error("Invalid response format from API");
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        // Handle abort (timeout)
        if (error.name === "AbortError") {
          throw new Error("Request timeout - Figaro API did not respond");
        }
        throw error;
      }

      throw new Error("Network error - unable to reach Figaro API");
    }
  }

  /**
   * Check if data should be synced based on staleness.
   *
   * Returns true if:
   * - No previous sync has occurred (lastSyncAt is null)
   * - Last sync was more than 5 minutes ago
   *
   * @param lastSyncAt - Unix timestamp of last successful sync, or null
   * @returns boolean indicating whether sync should occur
   */
  shouldSync(lastSyncAt: number | null): boolean {
    if (lastSyncAt === null) {
      return true;
    }

    const timeSinceSync = Date.now() - lastSyncAt;
    return timeSinceSync >= this.STALE_THRESHOLD_MS;
  }

  /**
   * Validate that the API response matches expected ModuleSummary shape.
   */
  private isValidModuleSummary(data: unknown): data is ModuleSummary {
    if (!data || typeof data !== "object") return false;

    const summary = data as Record<string, unknown>;

    // Check required fields exist
    if (!summary.subscription || typeof summary.subscription !== "object") return false;
    if (!Array.isArray(summary.lists)) return false;
    if (!Array.isArray(summary.reminders)) return false;
    if (typeof summary.memoriesCount !== "number") return false;

    // briefing can be null or object
    if (summary.briefing !== null && typeof summary.briefing !== "object") return false;

    return true;
  }

  /**
   * Get the API base URL (useful for testing/debugging).
   */
  getApiBase(): string {
    return this.API_BASE;
  }
}

// Export singleton instance for convenience
export const figaroSyncService = new FigaroSyncService();
