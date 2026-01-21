# Algorithm Implementation Guide - P-resents API

## Welcome Team!

The API infrastructure is **100% complete**. You only need to implement your assigned algorithm functions. Everything else (API endpoints, validation, testing, deployment) is already done.

## What's Already Built ✅

- ✅ FastAPI application with `/recalculate` and `/finalize_group` endpoints
- ✅ Pydantic models for type safety and validation
- ✅ Service layer that orchestrates all algorithms
- ✅ Full test suite (9 tests passing)
- ✅ Interactive API documentation at `/docs`
- ✅ Error handling and validation
- ✅ Deployment configuration for Fly.io

**You don't touch any of this.** Just implement your algorithm functions.

---

## Your Assignments

### Person 1: Random Matching + Max Utility

**Your files:**
- `algorithms/random_matching.py`
- `algorithms/max_utility_matching.py`

**What to implement:**

For **Random Matching**:
1. `calculate_statistics()` - Calculate expected stats for random matching
   - For each person, calculate average utility across all possible givers
   - Compute overall mean and standard deviation
2. `generate_matching()` - Generate a random valid matching
   - Create a derangement (no one gives to themselves)
   - Respect exclusions

For **Max Utility**:
1. `calculate_statistics()` - Find optimal matching stats
   - Use `scipy.optimize.linear_sum_assignment()` to maximize total utility
   - Return stats for the optimal matching
2. `generate_matching()` - Generate the optimal matching
   - Use same algorithm as `calculate_statistics()`

**Key requirements:**
- Call `calculate_utility()` from `utils/utility_calculator.py` for all scores
- Handle exclusions: set utility to `-inf` for excluded pairs
- Return proper `RulesetStats` and `UserStats` objects

---

### Person 2: Max Fairness

**Your file:**
- `algorithms/max_fairness_matching.py`

**What to implement:**

1. `calculate_statistics()` - Calculate stats for fairness-optimized matching
   - Choose a fairness metric (minimax recommended: maximize minimum utility)
   - Find matching that optimizes your fairness metric
   - Return stats

2. `generate_matching()` - Generate the fair matching
   - Use same algorithm as `calculate_statistics()`

**Design decision:** Choose your fairness definition
- **Minimax** (recommended): Maximize the minimum utility score
- **Variance minimization**: Minimize standard deviation
- **Your choice**: Define another fairness metric

**Key requirements:**
- Call `calculate_utility()` from `utils/utility_calculator.py`
- Handle exclusions
- Return proper `RulesetStats` and `UserStats` objects

---

### Person 3: White Elephant

**Your file:**
- `algorithms/white_elephant_simulation.py`

**What to implement:**

1. `calculate_statistics()` - Run 1000+ game simulations
   - Simulate full White Elephant games with randomized play orders
   - **Decision-making**: Players choose gifts based on utility (practicality + novelty suggested)
   - **Happiness calculation**: Base utility +/- stealing modifiers
   - Aggregate results across all simulations
   - Return stats including steal frequencies

2. `generate_play_order()` - Generate randomized play order
   - Simply shuffle user IDs randomly
   - Return as a list

**Game mechanics:**
- Each turn: player opens new gift OR steals already-opened gift
- Players choose based on best utility fit
- Happiness = base utility - `we_hate_being_stolen_from` (if stolen from) + `we_enjoy_stealing` (if stole)

**Key requirements:**
- Run 1000+ simulations (parameter: `num_simulations`)
- Track stealing statistics
- Return proper `RulesetStats` with White Elephant-specific fields

---

### Volunteer: Utility Calculator

**Your file:**
- `utils/utility_calculator.py`

**What to implement:**

1. `calculate_utility(giver, receiver)` - Calculate compatibility score
   - Combine giver's giving preferences with receiver's receiving preferences
   - Factor in shared interests
   - Apply custom weighting logic
   - Return float (suggested range: 0-10)

**Design decision:** You define the weighting formula

Example approach:
```python
# Match preferences (e.g., giver likes giving practical + receiver likes receiving practical)
preference_score = ...

# Shared interests bonus
shared_interests = calculate_shared_interests(giver, receiver)
interest_bonus = shared_interests * weight

# Total utility
return preference_score + interest_bonus
```

**Note:** This function is used by all Secret Santa algorithms

---

## How to Implement

### Step 1: Set Up Your Environment

```bash
# Pull latest code
git pull

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Open Your File(s)

Open the algorithm file assigned to you. You'll see:
- Function signatures already defined
- Detailed TODO comments explaining what to implement
- Placeholder return values

### Step 3: Implement Your Functions

Replace the placeholder implementations with your algorithm logic.

### Step 4: Test Your Implementation

**Option A: Test your algorithm directly**
```python
# Add at the bottom of your algorithm file:
if __name__ == "__main__":
    from models.preferences import UserPreference

    # Create test data
    test_prefs = [
        UserPreference(
            user_id="alice",
            preference_practicality_giving=4,
            preference_practicality_receiving=3,
            preference_novelty_giving=5,
            preference_novelty_receiving=2,
            preference_thoughtfulness_giving=3,
            preference_thoughtfulness_receiving=5,
            preferred_interests=["Coffee", "Tech"],
            we_hate_being_stolen_from=2,
            we_enjoy_stealing=4,
            exclusions=[]
        ),
        # Add more test users...
    ]

    # Test your function
    result = calculate_statistics(test_prefs)
    print(result)
```

Then run:
```bash
python algorithms/your_file.py
```

**Option B: Test via the API**

1. Start the API:
```bash
uvicorn main:app --reload
```

2. Visit Interactive Docs:
Open http://localhost:8000/docs in your browser

### 3. Try the Endpoints
Click "Try it out" and test your algorithm through `/recalculate` or `/finalize_group`

**Option C: Run automated tests**

```bash
pytest tests/ -v
```

All tests should still pass after your implementation.

---

## Important Notes

### What You DON'T Need to Touch
- ❌ `controllers/` - API route handlers (already done)
- ❌ `services/` - Orchestration layer (already done)
- ❌ `models/` - Pydantic models (already done)
- ❌ `main.py` - FastAPI app (already done)
- ❌ `tests/` - Test suite (already done)

**You only edit files in `algorithms/` and `utils/`**

### Reference Code

You can reference `secret_santa_solution.py` for algorithm logic:
- Random matching implementation
- Max utility using linear_sum_assignment
- Fairness matching with minimax approach

**Key differences:**
- Old code uses dict, new code uses `UserPreference` objects
- Old code uses direct preference lookups, new code calls `calculate_utility()`
- Access fields like: `user.preference_practicality_giving` instead of `dict["preference_practicality_giving"]`

### Common Issues & Tips
**1. Import errors**
```python
# Correct imports:
from models.preferences import UserPreference
from models.responses import RulesetStats, UserStats
from utils.utility_calculator import calculate_utility
```

**2. Handling exclusions**
```python
# Check if giver is excluded by receiver:
if giver.user_id in receiver.exclusions:
    # Set utility to -inf or skip this pairing
    utility = float('-inf')
```

**3. Accessing UserPreference fields**
```python
# UserPreference is an object, not a dict:
user.preference_practicality_giving  # ✅ Correct
user["preference_practicality_giving"]  # ❌ Wrong
```

**4. Return types matter**
```python
# Must return Pydantic models:
from models.responses import RulesetStats, UserStats

return RulesetStats(
    group_satisfaction_score=7.5,
    group_fairness_score=8.2,
    std_dev=1.5,
    user_stats={"alice": UserStats(expected_utility=7.0), ...}
)
```

**5. Use sample data from tests**
```python
# See tests/test_data.py for example UserPreference objects
from tests.test_data import SAMPLE_PREFERENCES_4_USERS
```

---

## Questions?

- **Full API spec**: See `API_DESIGN.md`
- **Setup guide**: See `README.md`
- **Example data**: See `tests/test_data.py`
- **API documentation**: Visit http://localhost:8000/docs after starting the server
- **Algorithm reference**: See `secret_santa_solution.py` (needs adaptation)

---

## When You're Done

Once all algorithms are implemented, the API is ready to deploy:

```bash
fly deploy
```

The deployment configuration is already set up!
