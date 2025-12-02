import { RecalculateRequest, RecalculateResponse, FinalizeRequest, FinalizeResponse, RulesetStatistics } from '@/types/api.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiService {
  /**
   * Calculate statistics for all matching algorithms
   * No transformation needed - frontend now uses backend field names
   */
  static async recalculate(request: RecalculateRequest): Promise<RecalculateResponse> {
    try {
      console.log('Sending to API:', request);
      
      const response = await fetch(`${API_URL}/recalculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Transform backend response if needed
      if (data.statistics) {
        return data; // Already in correct format
      } else {
        // Backend returns { "Random Matching": {...}, "Max Utility": {...} }
        // Transform to { statistics: [...] }
        const statistics = Object.entries(data).map(([ruleset_name, stats]) => {
          const typedStats = stats as Omit<RulesetStatistics, 'ruleset_name'>;
          return {
            ruleset_name,
            avg_utility: typedStats.avg_utility || 0,
            min_utility: typedStats.min_utility || 0,
            max_utility: typedStats.max_utility || 0,
            std_utility: typedStats.std_utility || 0,
            fairness_score: typedStats.fairness_score || 0,
            expected_happiness: typedStats.expected_happiness,
          };
        });
        return { statistics };
      }
    } catch (error: unknown) {
      console.error('Error in recalculate:', error);
      if (error instanceof Error) {
      error.message || 'Failed to calculate statistics. Make sure the API is running at ' + API_URL
      } else {
        console.error('Unknown error type in recalculate');
      }
      throw new Error('Failed to calculate statistics. Make sure the API is running at ' + API_URL);
    }
  }

  /**
   * Finalize matching with selected algorithm
   * No transformation needed - frontend now uses backend field names
   */
  static async finalize(request: FinalizeRequest): Promise<FinalizeResponse> {
    try {
      console.log('Sending to API:', request);
      
      // Backend uses /finalize_group endpoint
      const response = await fetch(`${API_URL}/finalize_group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Add ruleset to response if not present
      if (!data.ruleset) {
        data.ruleset = request.ruleset;
      }
      
      return data;
    } catch (error: unknown) {
      console.error('Error in finalize:', error);
      if (error instanceof Error) {
        error.message || 'Failed to finalize match. Make sure the API is running at ' + API_URL
      } else {
        console.error('Unknown error type in finalize');
      }
      throw new Error('Failed to finalize match. Make sure the API is running at ' + API_URL);
    }
  }
}