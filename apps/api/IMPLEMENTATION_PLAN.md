# P-resents API Implementation Plan

## Phase 1: Project Structure & Models (Controller Layer - You)

### 1.1 Create directory structure
```bash
mkdir -p controllers services algorithms utils models tests
touch controllers/__init__.py services/__init__.py algorithms/__init__.py utils/__init__.py models/__init__.py tests/__init__.py
```

### 1.2 Define Pydantic Models
**File: `models/preferences.py`**
- `UserPreference` class with all fields from data contract
- Validation for 1-5 ranges
- UUID validation for user_id and exclusions

**File: `models/requests.py`**
- `RecalculateRequest` (group_id + preferences array)
- `FinalizeGroupRequest` (group_id + ruleset + preferences + optional seed)

**File: `models/responses.py`**
- `RulesetStats` (stats for one algorithm)
- `RecalculateResponse` (contains all rulesets)
- `FinalizeResponse` (pairings or play_order)
- `ErrorResponse`

### 1.3 Update requirements.txt
Add necessary dependencies:
- `pydantic>=2.0`
- `numpy`
- `scipy` (for max utility algorithm)
- Any other algorithm dependencies

---

## Phase 2: Controller Layer (You)

### 2.1 FastAPI Route Handlers
**File: `controllers/recalculate.py`**
```python
@router.post("/recalculate")
async def recalculate_handler(request: RecalculateRequest) -> RecalculateResponse:
    # 1. Validate input
    # 2. Call matching_service.run_all_algorithms(request.preferences)
    # 3. Format response
    # 4. Return RecalculateResponse
```

**File: `controllers/finalize.py`**
```python
@router.post("/finalize_group")
async def finalize_group_handler(request: FinalizeGroupRequest) -> FinalizeResponse:
    # 1. Validate input
    # 2. Call matching_service.finalize_matching(ruleset, preferences, seed)
    # 3. Format response
    # 4. Return FinalizeResponse
```

### 2.2 Update main.py
- Import and register routers
- Add CORS middleware
- Add error handlers
- Health check endpoint (`GET /health`)

---

## Phase 3: Service Layer (Orchestration)

### 3.1 Matching Service
**File: `services/matching_service.py`**

```python
def run_all_algorithms(preferences: List[UserPreference]) -> Dict[str, RulesetStats]:
    """
    Run all 4 algorithms and return statistics for comparison.

    Returns dict with keys: "Random Matching", "Max Utility", "Max Fairness", "White Elephant"
    """
    results = {}

    # Run each algorithm
    results["Random Matching"] = run_random_matching(preferences)
    results["Max Utility"] = run_max_utility(preferences)
    results["Max Fairness"] = run_max_fairness(preferences)
    results["White Elephant"] = run_white_elephant(preferences)

    return results

def finalize_matching(ruleset: str, preferences: List[UserPreference], seed: Optional[int]) -> Dict:
    """
    Generate final pairings for the chosen ruleset.
    """
    if seed:
        set_random_seed(seed)

    if ruleset == "Random Matching":
        return random_matching.generate_matching(preferences)
    elif ruleset == "Max Utility":
        return max_utility_matching.generate_matching(preferences)
    elif ruleset == "Max Fairness":
        return max_fairness_matching.generate_matching(preferences)
    elif ruleset == "White Elephant":
        return white_elephant_simulation.generate_play_order(preferences)
    else:
        raise ValueError(f"Unknown ruleset: {ruleset}")
```

---

## Phase 4: Algorithm Stubs (For Team Members)

### 4.1 Create stub files with clear interfaces

**File: `algorithms/random_matching.py`**
```python
from typing import List, Dict
from models.preferences import UserPreference

def calculate_statistics(preferences: List[UserPreference]) -> Dict:
    """
    Calculate expected statistics for random matching.

    Returns:
        Dict with keys: group_satisfaction_score, group_fairness_score,
        min_utility, max_utility, std_dev, user_stats
    """
    # TODO: Person 1 to implement
    raise NotImplementedError("Random matching statistics not yet implemented")

def generate_matching(preferences: List[UserPreference]) -> Dict[str, str]:
    """
    Generate a random valid matching.

    Returns:
        Dict mapping giver_id -> receiver_id
    """
    # TODO: Person 1 to implement
    raise NotImplementedError("Random matching generation not yet implemented")
```

**File: `algorithms/max_utility_matching.py`**
```python
# Similar structure to random_matching.py
# TODO: Person 1 to implement
```

**File: `algorithms/max_fairness_matching.py`**
```python
# Similar structure
# TODO: Person 2 to implement
```

**File: `algorithms/white_elephant_simulation.py`**
```python
from typing import List, Dict

def calculate_statistics(preferences: List[UserPreference], num_simulations: int = 1000) -> Dict:
    """
    Run 1000+ White Elephant simulations and return aggregate statistics.

    Game mechanics:
    - Players choose gifts based on best fit (practicality + novelty)
    - Happiness = base utility +/- stealing modifiers

    Returns:
        Dict with keys: group_satisfaction_score, group_fairness_score,
        avg_steals_per_game, max_steals_observed, simulations_run, user_stats
    """
    # TODO: Person 3 to implement
    raise NotImplementedError("White Elephant simulation not yet implemented")

def generate_play_order(preferences: List[UserPreference], seed: Optional[int] = None) -> List[str]:
    """
    Generate a randomized play order for the actual game.

    Returns:
        List of user_ids in play order
    """
    # TODO: Person 3 to implement
    raise NotImplementedError("White Elephant play order not yet implemented")
```

### 4.2 Utility Calculator Stub
**File: `utils/utility_calculator.py`**
```python
from models.preferences import UserPreference

def calculate_utility(giver: UserPreference, receiver: UserPreference) -> float:
    """
    Calculate utility score from receiver's perspective.

    Combines:
    - Giver's giving preferences
    - Receiver's receiving preferences
    - Shared interests
    - Custom weighting

    Returns:
        Float utility score (higher = better match)
    """
    # TODO: Person 5 to implement
    # For now, return a placeholder
    return 5.0
```

---

## Phase 5: Integration & Testing

### 5.1 Wire everything together
- Connect controllers to services
- Connect services to algorithms
- Ensure proper error propagation

### 5.2 Create test data
**File: `tests/test_data.py`**
- Sample preference arrays (3-4 users)
- Edge cases (2 users, 10+ users, exclusions)

### 5.3 Test endpoints
**File: `tests/test_endpoints.py`**
- Test `/recalculate` with sample data
- Test `/finalize_group` for each ruleset
- Test error cases (invalid inputs, missing fields)

### 5.4 Algorithm testing
**File: `tests/test_algorithms.py`**
- Unit tests for each algorithm (once implemented)
- Verify matching validity (no self-assignments, respects exclusions)
- Verify statistics calculations

---

## Phase 6: Documentation & Deployment

### 6.1 Create README for team members
Document:
- How to run the API locally
- Algorithm interface specifications
- Example usage
- Testing instructions

### 6.2 Local testing
```bash
uvicorn main:app --reload
# Test with curl or Postman
```

### 6.3 Deploy to Fly.io
```bash
fly deploy
```

---

## Task Assignment Summary

| Who | Tasks | Files |
|-----|-------|-------|
| **You** | Controller layer, models, service orchestration, project setup | `controllers/`, `models/`, `services/`, `main.py` |
| **Person 1** | Random matching + Max utility algorithms | `algorithms/random_matching.py`, `algorithms/max_utility_matching.py` |
| **Person 2** | Max fairness algorithm | `algorithms/max_fairness_matching.py` |
| **Person 3** | White Elephant simulation | `algorithms/white_elephant_simulation.py` |
| **TBD (volunteer)** | Utility scoring function | `utils/utility_calculator.py` |

**Note**: One of Persons 1, 2, or 3 will volunteer to also implement the utility calculator.

---

## Next Immediate Steps

1. ✅ Review this plan
2. Create project structure
3. Define Pydantic models
4. Implement basic route handlers with stubs
5. Test with mock/placeholder algorithms
6. Distribute algorithm stubs to team members
7. Integrate completed algorithms as they're finished

## Questions Before Starting?
- Do you want me to start implementing the controller layer now?
- Any adjustments to the plan?
- Should I create detailed interface documentation for the algorithm implementers?
