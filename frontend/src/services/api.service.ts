import { RecalculateRequest, RecalculateResponse, FinalizeRequest, FinalizeResponse, RulesetStatistics, Pairing } from '@/types/api.types';

interface RulesetData {
  group_satisfaction_score: number;
  group_fairness_score: number;
  min_utility: number;
  max_utility: number;
  std_dev: number;
  user_stats: Record<string, unknown>;
  avg_steals_per_game?: number;
  max_steals_observed?: number;
  simulations_run?: number;
}

export class ApiService {
  private static API_URL = (process.env.NEXT_PUBLIC_API_URL as string | undefined) || 'http://localhost:8000';

  static async recalculate(request: RecalculateRequest): Promise<RecalculateResponse> {
    console.log('=== RECALCULATE REQUEST ===');
    console.log('Sending to API:', JSON.stringify(request, null, 2));

    const response = await fetch(`${this.API_URL}/recalculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('=== RAW API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));

    // Check if response has rulesets object that needs transformation
    if (data.rulesets && typeof data.rulesets === 'object') {
      console.log('✓ Transforming rulesets object to statistics array');
      
      // Transform the rulesets object into the expected statistics array format
      const statistics: RulesetStatistics[] = Object.entries(data.rulesets).map(([ruleset_name, stats]) => {
        const rulesetData = stats as RulesetData;
        return {
          ruleset_name,
          avg_utility: rulesetData.group_satisfaction_score || 0,
          min_utility: rulesetData.min_utility || 0,
          max_utility: rulesetData.max_utility || 0,
          std_utility: rulesetData.std_dev || 0,
          fairness_score: rulesetData.group_fairness_score || 0,
          expected_happiness: rulesetData.group_satisfaction_score || 0,
        };
      });

      console.log('=== TRANSFORMED STATISTICS ===');
      console.log(JSON.stringify(statistics, null, 2));

      return {
        statistics,
      };
    }

    // If response already has statistics array, return as-is
    return data as RecalculateResponse;
  }

  static async finalize(request: FinalizeRequest): Promise<FinalizeResponse> {
    console.log('=== FINALIZE REQUEST ===');
    console.log('Sending to API:', JSON.stringify(request, null, 2));

    const response = await fetch(`${this.API_URL}/finalize_group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('=== FINALIZE API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));

    // Check if pairings is an object that needs to be converted to array
    if (data.pairings && typeof data.pairings === 'object' && !Array.isArray(data.pairings)) {
      console.log('✓ Transforming pairings object to array');
      
      const pairingsArray: Pairing[] = Object.entries(data.pairings).map(([giver, receiver]) => ({
        giver,
        receiver: receiver as string,
        utility: 0,
      }));
      
      console.log('Transformed pairings:', pairingsArray);
      data.pairings = pairingsArray;
    }

    return data as FinalizeResponse;
  }
}