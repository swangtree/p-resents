// API Type Definitions

export interface UserPreferences {
    user_id: string;
    preference_practicality_giving: number;
    preference_novelty_giving: number;
    preference_thoughtfulness_giving: number;
    preference_practicality_receiving: number;
    preference_novelty_receiving: number;
    preference_thoughtfulness_receiving: number;
    we_hate_being_stolen_from: number;
    we_enjoy_stealing: number;
    hate_missing_out: number;
    enjoy_missing_out: number;
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
    expected_happiness?: number; // For White Elephant
  }
  
  export interface RecalculateResponse {
    statistics: RulesetStatistics[];
  }
  
  export interface FinalizeRequest {
    group_id: string;
    ruleset: string;
    preferences: UserPreferences[];
    seed: number;
  }
  
  export interface Pairing {
    giver: string;
    receiver: string;
    utility: number;
  }
  
  export interface FinalizeResponse {
    ruleset: string;
    pairings?: Pairing[];
    play_order?: string[];
  }