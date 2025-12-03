import { RecalculateRequest, RecalculateResponse, FinalizeRequest, FinalizeResponse, RulesetStatistics } from '@/types/api.types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL as string | undefined) || 'http://localhost:8000';

export class ApiService {
  /**
   * Calculate statistics for all matching algorithms
   * Transforms backend format to frontend format
   */
  static async recalculate(request: RecalculateRequest): Promise<RecalculateResponse> {
    try {
      console.log('=== RECALCULATE REQUEST ===');
      console.log('Sending to API:', JSON.stringify(request, null, 2));
      
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
      console.log('=== RAW API RESPONSE ===');
      console.log(JSON.stringify(data, null, 2));
      
      // Backend returns: { "rulesets": { "Random Matching": {...}, ... } }
      // We need: { "statistics": [{ruleset_name: "...", ...}, ...] }
      
      if (data.rulesets) {
        console.log('✓ Transforming rulesets object to statistics array');
        
        const statistics: RulesetStatistics[] = Object.entries(data.rulesets).map(([ruleset_name, stats]: [string, any]) => {
          // Map backend field names to frontend field names
          return {
            ruleset_name,
            avg_utility: stats.group_satisfaction_score || 0,
            min_utility: stats.min_utility || 0,
            max_utility: stats.max_utility || 0,
            std_utility: stats.std_dev || 0,
            fairness_score: stats.group_fairness_score || 0,
            expected_happiness: stats.group_satisfaction_score, // For White Elephant
          };
        });
        
        console.log('=== TRANSFORMED STATISTICS ===');
        console.log(JSON.stringify(statistics, null, 2));
        
        return { statistics };
      } else if (data.statistics && Array.isArray(data.statistics)) {
        console.log('✓ Response already has statistics array');
        return data;
      } else {
        console.error('⚠ Unexpected response format');
        throw new Error('Unexpected response format from API');
      }
    } catch (error: unknown) {
      console.error('Error in recalculate:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to calculate statistics. Make sure the API is running at ' + API_URL);
      }
    }
  }

  /**
   * Finalize matching with selected algorithm
   */
  static async finalize(request: FinalizeRequest): Promise<FinalizeResponse> {
    try {
      console.log('=== FINALIZE REQUEST ===');
      console.log('Sending to API:', JSON.stringify(request, null, 2));
      
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
      console.log('=== FINALIZE API RESPONSE ===');
      console.log(JSON.stringify(data, null, 2));
      
      // Transform pairings from object to array if needed
      if (data.pairings && typeof data.pairings === 'object' && !Array.isArray(data.pairings)) {
        console.log('✓ Transforming pairings object to array');
        const pairingsArray = Object.entries(data.pairings).map(([giver, receiver]) => ({
          giver,
          receiver: receiver as string,
          utility: 0, // Backend doesn't provide individual utility in finalize
        }));
        data.pairings = pairingsArray;
        console.log('Transformed pairings:', pairingsArray);
      }
      
      // Add ruleset to response if not present
      if (!data.ruleset) {
        data.ruleset = request.ruleset;
      }
      
      return data;
    } catch (error: unknown) {
      console.error('Error in finalize:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to finalize match. Make sure the API is running at ' + API_URL);
      }
    }
  }
}