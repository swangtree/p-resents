# P-resents API Design Document

## Overview
FastAPI service for gift exchange matching algorithms. Supports multiple rulesets: Secret Santa (Random, Max Utility, Max Fairness) and White Elephant.

## Architecture

### Three-Layer Architecture
```
┌─────────────────────────────────────┐
│     Controller Layer (FastAPI)     │  ← You implement
│  - Route handlers                   │
│  - Request/response validation      │
│  - Pydantic models                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Service/Logic Layer            │
│  - Orchestration                    │
│  - Data transformation              │
│  - Algorithm dispatch               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Algorithm Layer (Pure Python)  │  ← Team implements
│  - random_matching()                │
│  - max_utility_matching()           │
│  - max_fairness_matching()          │
│  - white_elephant_matching()        │
└─────────────────────────────────────┘
```

## Data Contracts

### User Preference Input Schema
```json
{
  "user_id": "uuid_string",
  "preference_practicality_giving": 1-5,
  "preference_practicality_receiving": 1-5,
  "preference_novelty_giving": 1-5,
  "preference_novelty_receiving": 1-5,
  "preference_thoughtfulness_giving": 1-5,
  "preference_thoughtfulness_receiving": 1-5,
  "preferred_interests": ["Coffee", "Hiking", "..."],
  "we_hate_being_stolen_from": 1-5,
  "we_enjoy_stealing": 1-5,
  "exclusions": ["uuid_user_2", "uuid_user_3"]
}
```

## API Endpoints

### 1. POST `/recalculate`
**Purpose**: Calculate statistics for ALL rulesets to help admin choose.

**Request Body**:
```json
{
  "group_id": "uuid_string",
  "preferences": [
    {
      "user_id": "uuid_user_1",
      "preference_practicality_giving": 4,
      "preference_practicality_receiving": 3,
      "preference_novelty_giving": 5,
      "preference_novelty_receiving": 2,
      "preference_thoughtfulness_giving": 3,
      "preference_thoughtfulness_receiving": 5,
      "preferred_interests": ["Coffee", "Tech"],
      "we_hate_being_stolen_from": 2,
      "we_enjoy_stealing": 4,
      "exclusions": ["uuid_user_5"]
    },
    // ... more users
  ]
}
```

**Response** (200 OK):
```json
{
  "group_id": "uuid_string",
  "rulesets": {
    "Random Matching": {
      "group_satisfaction_score": 5.5,
      "group_fairness_score": 9.1,
      "min_utility": 1.0,
      "max_utility": 10.0,
      "std_dev": 2.3,
      "user_stats": {
        "uuid_user_1": {
          "expected_utility": 5.5,
          "variance": 2.3
        },
        // ... more users
      }
    },
    "Max Utility": {
      "group_satisfaction_score": 8.7,
      "group_fairness_score": 6.2,
      "min_utility": 3.0,
      "max_utility": 10.0,
      "std_dev": 1.8,
      "user_stats": { /* ... */ }
    },
    "Max Fairness": {
      "group_satisfaction_score": 7.2,
      "group_fairness_score": 9.8,
      "min_utility": 6.0,
      "max_utility": 8.5,
      "std_dev": 0.9,
      "user_stats": { /* ... */ }
    },
    "White Elephant": {
      "group_satisfaction_score": 6.8,
      "group_fairness_score": 7.5,
      "avg_steals_per_game": 8.3,
      "max_steals_observed": 15,
      "simulations_run": 1000,
      "user_stats": {
        "uuid_user_1": {
          "avg_utility": 6.5,
          "utility_standard_deviation": 2.2,
          "times_stolen_from_pct": 0.234,
          "times_stole_pct": 0.189
        }
        // ... more users
      }
    }
  }
}
```

### 2. POST `/finalize_group`
**Purpose**: Generate final, concrete pairings for the chosen ruleset.

**Request Body**:
```json
{
  "group_id": "uuid_string",
  "ruleset": "Max Utility",
  "preferences": [
    // ... same preference array as /recalculate
  ],
  "seed": 42  // optional: for reproducible randomness
}
```

**Response** (200 OK):
```json
{
  "group_id": "uuid_string",
  "ruleset": "Max Utility",
  "pairings": {
    "uuid_user_1": "uuid_user_4",
    "uuid_user_2": "uuid_user_3",
    "uuid_user_3": "uuid_user_1",
    "uuid_user_4": "uuid_user_2"
  },
  "metadata": {
    "total_utility": 42.5,
    "timestamp": "2025-11-08T12:00:00Z"
  }
}
```

For White Elephant, the response includes a single randomized play order for the actual game:
```json
{
  "group_id": "uuid_string",
  "ruleset": "White Elephant",
  "play_order": ["uuid_user_3", "uuid_user_1", "uuid_user_4", "uuid_user_2"],
  "metadata": {
    "seed": 42,
    "timestamp": "2025-11-08T12:00:00Z"
  }
}
```

Note: This is just a randomized order for playing the actual White Elephant game, not a matching.

## Algorithm Interface

Each algorithm module must implement a standard interface:

### Secret Santa Algorithms
```python
def algorithm_name(preferences: List[UserPreference]) -> MatchingResult:
    """
    Args:
        preferences: List of user preference objects

    Returns:
        MatchingResult with:
        - matching: Dict[str, str] (giver_id -> receiver_id)
        - statistics: Dict with metrics
    """
    pass
```

### White Elephant Algorithm
```python
def white_elephant_simulation(preferences: List[UserPreference], num_simulations: int = 1000) -> WhiteElephantResult:
    """
    Runs multiple White Elephant game simulations with randomized play orders.

    Game mechanics:
    1. Each turn, player chooses to either:
       - Open a new gift
       - Steal an already-opened gift from someone else
    2. Players choose gifts based on best utility fit (suggested: practicality + novelty only)
    3. Happiness is calculated separately:
       - Base utility from the gift they end up with
       - MINUS penalty from `we_hate_being_stolen_from` (if they were stolen from)
       - PLUS bonus from `we_enjoy_stealing` (if they stole)

    Args:
        preferences: List of user preference objects
        num_simulations: Number of simulations to run (default 1000)

    Returns:
        WhiteElephantResult with:
        - statistics: Dict with aggregate metrics across all simulations
            - avg_satisfaction: Average satisfaction across simulations
            - avg_steals: Average number of steals per simulation
            - user_stats: Per-user statistics aggregated across simulations

    Note: Implementer has flexibility to adjust which preference criteria are used for gift selection.
    """
    pass
```

## Team Assignments

### Person 1: Random Matching + Max Utility
- Implement `algorithms/random_matching.py`
- Implement `algorithms/max_utility_matching.py`
- Calculate utility scores from receiver perspective
- Handle exclusions

### Person 2: Max Fairness
- Implement `algorithms/max_fairness_matching.py`
- Implement minimax or variance-minimization approach
- Handle exclusions

### Person 3: White Elephant
- Implement `algorithms/white_elephant_simulation.py`
- Run 1000+ game simulations with randomized play orders
- **Decision-making**: Players choose gifts based on utility fit (typically practicality + novelty, but implementer can adjust)
- **Happiness calculation**: Factor in `we_hate_being_stolen_from` (decreases happiness when stolen from) and `we_enjoy_stealing` (increases happiness when stealing)
- Calculate aggregate statistics across all simulations
- Note: Suggested to use only practicality and novelty for gift selection, but implementer has flexibility

### You: Controller Layer
- Implement FastAPI route handlers
- Define Pydantic request/response models
- Input validation
- Error handling

### Utility Calculator (One person volunteers)
- Implement `utils/utility_calculator.py`
- Define utility function that combines:
  - Giver's giving preferences
  - Receiver's receiving preferences
  - Shared interests
  - Custom weighting logic
- **Note**: One of the algorithm implementers (Person 1, 2, or 3) will volunteer to implement this as well

## Utility Calculation

**Key Principle**: Utility is calculated from the receiver's perspective.

The utility calculator will need to:
1. Take a potential (giver, receiver) pairing
2. Consider the receiver's receiving preferences
3. Consider the giver's giving preferences
4. Calculate a compatibility score
5. Factor in shared interests
6. Apply custom weights

Person 5 will implement the weighting logic.

## Error Handling

### Common Error Responses
```json
{
  "error": "InvalidInput",
  "message": "Preference values must be between 1 and 5",
  "details": {
    "field": "preference_practicality_giving",
    "value": 6
  }
}
```

### HTTP Status Codes
- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Algorithm failure

## File Structure
```
p-resents-api/
├── main.py                          # FastAPI app entry point
├── requirements.txt
├── Dockerfile
├── controllers/
│   ├── __init__.py
│   ├── recalculate.py              # POST /recalculate handler
│   └── finalize.py                 # POST /finalize_group handler
├── services/
│   ├── __init__.py
│   └── matching_service.py         # Orchestration logic
├── algorithms/
│   ├── __init__.py
│   ├── random_matching.py          # Person 1
│   ├── max_utility_matching.py     # Person 1
│   ├── max_fairness_matching.py    # Person 2
│   └── white_elephant_simulation.py # Person 3
├── utils/
│   ├── __init__.py
│   └── utility_calculator.py       # Person 5
├── models/
│   ├── __init__.py
│   ├── requests.py                 # Pydantic request models
│   ├── responses.py                # Pydantic response models
│   └── preferences.py              # UserPreference model
└── tests/
    ├── __init__.py
    ├── test_algorithms.py
    └── test_endpoints.py
```

## Next Steps
1. Set up project structure
2. Define Pydantic models for type safety
3. Implement controller layer (route handlers)
4. Implement service layer (orchestration)
5. Create algorithm stubs for team members
6. Write tests
7. Deploy to Fly.io

## Notes
- Use placeholders for database connections (no actual Supabase for now)
- API does NOT modify data - only returns JSON responses
- Calling service (frontend/webhook) handles data persistence
- All algorithms should be stateless and deterministic (given a seed)
