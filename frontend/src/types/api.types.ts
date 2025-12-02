export interface UserPreferences {
    user_id: string;
    giving_preferences: {
      practicality: number;
      novelty: number;
      sentimentality: number;
    };
    receiving_preferences: {
      practicality: number;
      novelty: number;
      sentimentality: number;
    };
    interests: string[];
    exclusions: string[];
  }
  
  export interface RecalculateRequest {
    group_id: string;
    preferences: UserPreferences[];
  }
  
  export interface RulesetStatistics {
    ruleset_name: string;
    avg_utility: number;
    min_utility: number;
    max_utility: number;
    std_utility: number;
    fairness_score: number;
    expected_happiness?: number;
  }
  
  export interface RecalculateResponse {
    group_id: string;
    statistics: RulesetStatistics[];
  }
  
  export interface FinalizeRequest {
    group_id: string;
    ruleset: string;
    preferences: UserPreferences[];
    seed?: number;
  }
  
  export interface Pairing {
    giver: string;
    receiver: string;
    utility: number;
  }
  
  export interface FinalizeResponse {
    group_id: string;
    ruleset: string;
    pairings?: Pairing[];
    play_order?: string[];
    seed?: number;
  }