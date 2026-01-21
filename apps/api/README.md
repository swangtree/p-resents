# P-resents API

Gift exchange matching algorithms service built with FastAPI.

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the API

```bash
uvicorn main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3. Test the API

```bash
# Run all tests
pytest tests/ -v

# Or run a specific test file
pytest tests/test_endpoints.py -v
```

## API Endpoints

### POST `/recalculate`
Calculate statistics for all rulesets to help admin choose.

**Request:**
```json
{
  "group_id": "group_123",
  "preferences": [...]
}
```

**Response:** Statistics for Random Matching, Max Utility, Max Fairness, and White Elephant

### POST `/finalize_group`
Generate final pairings or play order for chosen ruleset.

**Request:**
```json
{
  "group_id": "group_123",
  "ruleset": "Max Utility",
  "preferences": [...],
  "seed": 42
}
```

**Response:** Pairings (for Secret Santa) or play_order (for White Elephant)

## Team Implementation Tasks

### Person 1: Random Matching + Max Utility
**Files:**
- `algorithms/random_matching.py`
- `algorithms/max_utility_matching.py`

**Tasks:**
1. Implement `calculate_statistics()` for both algorithms
2. Implement `generate_matching()` for both algorithms
3. Use `utils/utility_calculator.calculate_utility()` for utility scores
4. Handle exclusions properly
5. For Max Utility: Use `scipy.optimize.linear_sum_assignment()`

### Person 2: Max Fairness
**Files:**
- `algorithms/max_fairness_matching.py`

**Tasks:**
1. Choose fairness definition (minimax recommended)
2. Implement `calculate_statistics()`
3. Implement `generate_matching()`
4. Handle exclusions

### Person 3: White Elephant
**Files:**
- `algorithms/white_elephant_simulation.py`

**Tasks:**
1. Implement `calculate_statistics()` - run 1000+ simulations
2. Implement game mechanics:
   - Players choose based on gift utility (practicality + novelty suggested)
   - Happiness = base utility +/- stealing modifiers
3. Implement `generate_play_order()` - simple random shuffle

### Volunteer: Utility Calculator
**Files:**
- `utils/utility_calculator.py`

**Tasks:**
1. Implement `calculate_utility(giver, receiver)` function
2. Combine giver's giving preferences with receiver's receiving preferences
3. Factor in shared interests
4. Apply custom weighting logic

## Project Structure

```
p-resents-api/
├── main.py                    # FastAPI app (✅ Done)
├── controllers/               # Route handlers (✅ Done)
│   ├── recalculate.py
│   └── finalize.py
├── services/                  # Orchestration (✅ Done)
│   └── matching_service.py
├── algorithms/                # Team to implement
│   ├── random_matching.py     # Person 1
│   ├── max_utility_matching.py # Person 1
│   ├── max_fairness_matching.py # Person 2
│   └── white_elephant_simulation.py # Person 3
├── utils/                     # Team to implement
│   └── utility_calculator.py  # Volunteer
├── models/                    # Pydantic models (✅ Done)
│   ├── preferences.py
│   ├── requests.py
│   └── responses.py
└── tests/                     # Test data (✅ Done)
    ├── test_data.py
    └── test_endpoints.py
```

## Testing Your Implementation

1. **Run the API locally**
   ```bash
   uvicorn main:app --reload
   ```

2. **Visit http://localhost:8000/docs** to see interactive API documentation

3. **Test with sample data:**
   - Use the examples in `tests/test_data.py`
   - Try the "Try it out" feature in the docs

4. **Run automated tests:**
   ```bash
   pytest tests/ -v
   ```

## Example Test Request

Using curl:
```bash
curl -X POST "http://localhost:8000/recalculate" \
  -H "Content-Type: application/json" \
  -d @tests/sample_request.json
```

Or use the interactive docs at `/docs` - much easier!

## Deployment

Deploy to Fly.io:
```bash
fly deploy
```

## Notes

- All algorithms should respect the `exclusions` field in user preferences
- Utility is calculated from the **receiver's perspective**
- White Elephant runs 1000+ simulations with randomized play orders
- Use `seed` parameter for reproducible results (optional)

## Questions?

Refer to:
- `API_DESIGN.md` - Full API specification
- `IMPLEMENTATION_PLAN.md` - Detailed implementation plan
- `/docs` endpoint - Interactive API documentation
