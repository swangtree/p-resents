# P-Resents TODO Checklist

## Priority 1: Example/Demo Page (Critical for Recruiters)

- [x] **Create example/demo results page accessible from homepage**
  - Add "View Demo" button on landing page linking to `/demo` route
  - Display sample results for both Secret Santa and White Elephant modes
  - Show algorithm comparison table with pre-calculated statistics
  - Fully public, no login required
  - *Completed: Created `/demo` route with tabbed interface showing both modes*

- [x] **Add demo data with realistic sample preferences and matches**
  - Use the 8 team members as example users with varied preferences
  - Pre-generate match results showing utility scores and fairness metrics
  - Include White Elephant play order with simulation statistics
  - *Completed: Added 8 demo members (Alice, Bob, Carol, David, Emma, Frank, Grace, Henry) with interests and pre-calculated statistics*

## Priority 2: Bug Fixes

- [x] **Fix White Elephant bug in `_choose_best_steal_target`**
  - Location: `apps/api/algorithms/white_elephant_simulation.py:194-195`
  - `_gift_owner != user_id` should be `_gift_owner(gift_id) != user_id`
  - *Completed: Fixed bug in both `_open_new_gift` (line 164) and `_choose_best_steal_target` (line 195)*
  - *Additional fix: Changed `status["opened"] == 0` to `status["opened"] == 1` in steal target selection (can only steal opened gifts)*

## Priority 3: Polish & UX Improvements

- [ ] **Add loading states and better error handling UX**
  - Add loading spinners during API calls (algorithm calculation, form submission)
  - Display user-friendly error messages for edge cases
  - Handle empty groups, missing preferences, and algorithm failures gracefully

- [ ] **Add email notifications when matches are finalized**
  - Send email to group members when admin finalizes results
  - Include direct link to view their personal match
  - Use Supabase email or integrate Resend/SendGrid

## Priority 4: Documentation

- [ ] **Add comprehensive README documentation**
  - Project overview explaining the gift exchange matching concept
  - Tech stack breakdown (Next.js, FastAPI, Supabase, scipy)
  - Local development setup with environment variables
  - Algorithm explanations (Hungarian, Monte Carlo simulation, etc.)
  - Deployment guide for Vercel and Fly.io

## Priority 5: Testing

- [ ] **Add unit tests for matching algorithms**
  - Random matching: valid derangements, exclusion handling, edge cases (2-3 people)
  - Max utility: optimal pairing verification, exclusion constraints respected
  - Max fairness: variance minimization, compare exhaustive vs greedy results
  - White Elephant: simulation consistency, stealing logic, play order validity

- [ ] **Add unit tests for utility calculator**
  - Preference alignment scoring (practicality, novelty, sentimentality)
  - Shared interests bonus calculation
  - Edge cases: no shared interests, identical preferences, extreme values

- [ ] **Add API integration tests**
  - `/recalculate` endpoint with valid/invalid payloads
  - `/finalize_group` endpoint for all 4 rulesets
  - Error responses for malformed requests, empty groups, insufficient members

- [ ] **Add frontend component tests**
  - Preference form validation and submission
  - Results page rendering for admin vs regular user
  - Group join/create flows
  - Authentication state handling

## Priority 6: Feature Enhancements

- [ ] **Add admin ability to manually adjust pairings after finalization**
  - UI for swapping matches between users post-finalization
  - Recalculate and display updated utility scores
  - Maintain audit trail of changes

- [ ] **Improve max fairness algorithm performance for large groups**
  - Current exhaustive search is O(n!) - slow for groups >12
  - Implement edge-based optimization noted in code TODO
  - Add progress indicator for long calculations

- [ ] **Add gift suggestion feature based on preferences/interests**
  - Display curated gift ideas based on matched person's interests
  - Could integrate external API or maintain suggestion database
  - Filter by preference dimensions (practical, novel, sentimental)

## Quick Wins (Optional)

- [ ] Add favicon and OpenGraph meta tags for better SEO/sharing
- [ ] Add "Copy to clipboard" button for group codes
- [ ] Mobile responsiveness polish on dashboard and results pages
- [ ] Dark mode support
- [ ] Social sharing buttons for group invites
