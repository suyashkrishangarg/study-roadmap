# 🎯 THE MASTER PLAN — Suyash's Dual-Track Roadmap

> One file to rule them all. This replaces `dsa.md`, `classical ml.md`, `reinforcement learning.md`,
> `LLM Systems Engineering.md`, `llm engineering resources.md`, and `MASTER_ROADMAP.md`.
> Everything from those files is preserved here (see the **Lossless Appendices** at the bottom),
> re-sequenced for a **complete beginner** and split into **two parallel tracks**.
> All resources are tagged like `[#45]` — look them up in `resources.json` by `source_index`
> (there is a full **Resource Key** table at the very end).

---

## 👤 Who this is for

- **Starting level:** absolute zero in maths *and* programming. We build both from the ground up.
- **Daily commitment:** 4 hours, split into **two 2-hour tracks** run in parallel.
- **Context:** CS 1st year at Scaler School of Technology (SST). SST coursework is managed
  separately and is *not* in this plan — but note the original DSA plan was written to flex around
  SST, so treat sprint targets as flexible, never skip a topic twice in a row.

---

## 🧭 The Two Tracks (run these in parallel every day)

| | **TRACK A — "The Math Brain"** | **TRACK B — "The Builder"** |
|---|---|---|
| **Covers** | Maths → Quant → CS Fundamentals | Programming → DSA → Projects (ML/RL/LLM) |
| **Daily time** | 2 hours | 2 hours |
| **Why** | Builds the mathematical maturity that ML/AI/RL/LLM all rest on | Builds the ability to *implement* everything |
| **Feeds** | Later stages of Classical ML, RL, LLM Systems | Everything you will ever build |
| **Resource groups in `resources.json`** | `Mathematics & Quantitative Finance`, `CS Fundamentals` | `Programming`, `Data Structures & Algorithms`, then `Classical ML` → `Deep Learning` → `RL` → `LLM Systems` |

**The golden rule:** never let Track A run more than ~2 weeks ahead of Track B's maths needs, and
never let Track B's coding run dry. They are two legs of one body. If life gets busy, protect
*continuity* (a little every day) over *intensity* (a marathon once a week).

---

## 🔁 The Weekly Rhythm (repeat every week)

Each track runs **Mon–Sat** (new material + practice) and **Sun** (light revision / re-solve / rest-day catch-up).
This mirrors the daily-session structure from the original DSA plan and the 10-hour study week
from the Classical ML plan, scaled to a beginner.

**A typical Track A day (2h):**
| Time | Activity |
|---|---|
| 15 min | Recall yesterday without notes (say it out loud) |
| 55 min | Learn new concept (lecture / reading / worked examples) |
| 40 min | Do problems or re-derive examples by hand |
| 10 min | Log mistakes + one-line summary in your notes |

**A typical Track B day (2h):**
| Time | Activity |
|---|---|
| 15 min | Re-solve or recall an older problem/idea |
| 50 min | Learn the concept (course / doc / video) |
| 45 min | Implement + solve the assigned problem |
| 10 min | Record complexity + update mistake log |

**Sunday (both tracks, ~1h each, lighter):**
- Re-solve 1–2 older items from a blank editor / blank page.
- Update your mistake log and weak-topic list.
- Skim next week's plan.

---

## 🗺️ How the whole journey is phased

### ⏱️ Time-budget & feasibility audit (read this — it changes the numbers)

Your budget is **2 h/day per track = 14 h/week per track**. But you do **not** absorb 14 h of *raw
video* per week. As a complete beginner you will pause constantly, **re-do every worked example on
paper**, take notes, attempt drills, and revise. A realistic sustainable rate is **~6–7 h of raw
video per track-week** (the other ~7–8 h goes to active re-derivation, problem sets, and review).

I audited **every** video/playlist length in `resources.json` against this budget. Two problems
surfaced in the first draft, both now fixed:

1. **Stacked duplicates (fixed by de-duplication).** The first draft listed *multiple* courses for the
   same topic (4 Python intros, 3 DSA courses, 3 discrete-math courses, 3 probability courses). You now
   follow **ONE primary resource per topic**; the rest are demoted to **backup/reference** (still listed,
   still in `resources.json` — just don't watch them all). This alone cut Track A from ~450 h to ~308 h.
2. **Under-budgeted weeks (fixed by re-pacing below).** The first draft crammed e.g. "Class 11 Maths"
   `[#4]` (29.7 h) + "Class 12 Maths" `[#5]` (32.8 h) into 8 weeks. At ~7 raw-h/week those two alone are
   ~9 weeks. The phase table below reflects the **audited** week counts.

**Honest bottom line:** covering *everything* losslessly is a **~4–5 year** journey at 4 h/day — not
18–30 months. That's fine; you're in CS year 1. A **core path** (maths spine + DSA + Classical ML +
Deep Learning + the essential LLM/RL core) gets you to a strong, employable ML/LLM-engineer level in
roughly **2–2.5 years**. Phases below; the week ranges are now audited, not aspirational.

| Phase | Audited weeks | Track A focus (primary resource) | Track B focus (primary resource) |
|---|---|---|---|
| **P0 — Ignition** | 1–14 | Class 11 `[#4]` → Class 12 `[#5]` maths; calculus/LA *intuition* `[#1]/[#2]/[#13]`; think-like-a-mathematician `[#12]` | Python `[#45]` CS50P → DSA Month 1 `[#68]` + LeetCode `[#73]` |
| **P1 — Core Math + Core DSA** | 15–33 | Discrete math `[#17]`→`[#26]`; probability intuition `[#16]/[#28]`; calculus `[#20]`; linear algebra `[#21]`; diff-eq `[#19]` | DSA Months 2–3 `[#68]` + LeetCode; projects #1–#2 |
| **P2 — Stats + Systems + DP** | 34–47 | Probability formal `[#29]`; stats-for-AI `[#18]`; CS fundamentals `[#80]/[#81]/[#82]`→`[#83]` | DSA Month 4 (DP) + project #3 |
| **P3 — Quant + Advanced DSA + ML ignition** | 48–65 | Quant math `[#38]`; financial theory `[#281]`; trading `[#271]/[#276]` | DSA Months 5–6; **Classical ML Stage 0–2** `[#88]/[#33]/[#119]`; projects #4–#5 |
| **P4 — ML Engine** | 66–120 | Just-in-time maths support only | **Classical ML Stages 3–13** + **Deep Learning** (≈450–650 h) |
| **P5 — RL + LLM** | 121–230 | Just-in-time maths support only | **Reinforcement Learning** (54 rows) → **LLM Systems** (12 stages, ≈293–475 h) |

> **How to read the week numbers:** they are a *cadence*, not a deadline. Track A is the long pole
> (huge one-shot maths playlists). If Track A runs ahead, bank the extra time into Track B problem
> practice; if it falls behind, let Track B's DSA practice absorb the slack. **Never skip a topic
> twice in a row.** Detailed day/week tasks are in Parts 1–5; full topic depth is in the Appendices.

### 🎯 One primary resource per topic (de-duplication rule)

| Topic | **Primary (watch this)** | Backup / reference (don't watch all) |
|---|---|---|
| Python intro | `[#45]` CS50P | `[#44]`, `[#48]`, `[#49]`, `[#57]`, `[#65]` |
| DSA concepts | `[#68]` Easy→Advanced | `[#67]`, `[#70]` Striver (114 h — use as problem-list reference only) |
| Discrete math (intro) | `[#17]` Beginners | `[#25]` Discrete Math I |
| Discrete math (CS depth) | `[#26]` MIT 6.1200J | `[#27]` 18.200, `[#24]` CS70 |
| Probability (intuition) | `[#16]` + `[#28]` | — |
| Probability (formal) | `[#29]` Stat 110 | `[#30]` CS109, `[#31]` MIT 6.041 |
| Calculus | `[#20]` MIT 18.01 | `[#1]` for intuition |
| Linear algebra | `[#21]` MIT 18.06 | `[#2]` for intuition |
| C++ / Java / Web | *(optional electives — pick at most one, late)* | `[#51]/[#52]` Java, `[#53]/[#55]` C++, `[#43]` Web |

---

## 🔑 Resource tagging convention

- `[#N]` = the resource with `source_index = N` in `resources.json`. Example: `[#45]` = CS50P.
- `[#N · Group]` is used the first time a resource appears so you know its group/level too.
- Practice platforms referenced by name (LeetCode, CSES, USACO, etc.) are also in `resources.json`:
  LeetCode 75 = `[#73]`, CSES = `[#74]`, USACO Guide = `[#78]`, CP-Algorithms = `[#77]`,
  NeetCode = `[#72]`, Striver = `[#69]/[#70]`, VisuAlgo = `[#66]`.
- A full lookup table (index → title → group → level) is in **Appendix Z**.

---
# 📅 PART 1 — PHASE 0: IGNITION (Weeks 1–14)

**Goal of Phase 0:** get you from *zero* to "I can write basic Python, do a little data work, and I've
seen the big ideas of algebra, calculus, and linear algebra, and I've started real DSA." Nothing here
needs to be perfect — it needs to be *done and understood at a basic level*.

> **Pacing note (audited):** Track A here is ~62 h of raw video (Class 11 `[#4]` 29.7 h + Class 12
> `[#5]` 32.8 h + intuition `[#1]/[#2]/[#13]` ~8 h). At ~5–6 raw-h/week that's ~12 weeks — hence the
> 14-week block. The week labels below are *milestones within the block*, not strict 7-day deadlines;
> if a one-shot takes 2 weeks, let it. Track B is lighter on video and will finish early — bank that
> time into DSA practice.

**Track A Phase-0 spine (in order, ONE primary each):**
`[#4]` Class 11 → `[#5]` Class 12 → `[#1]` calc intuition → `[#2]` LA intuition → `[#13]` complex numbers → `[#12]` think-like-a-mathematician (partial).

**Track B Phase-0 spine (in order, ONE primary each):**
`[#45]` CS50P → `[#68]` DSA Easy→Advanced (concepts) + LeetCode `[#73]` practice → `[#58]` NumPy → `[#59]` pandas.

---

## 🅰️ TRACK A — Phase 0 · Maths on-ramp (Steps 1–8)

> Pace guide: school/JEE maths is dense. Watch at 1.25–1.5×, pause on every worked example, and
> **re-do every example on paper yourself**. If a topic is totally new, it's fine to take 2 weeks.

### Step 1 — Number sense & basic algebra
- **Watch:** `[#3]` JEE Basic Maths & ADV Manipulations — Ep-1 (algebraic manipulation, number
  properties, basic identities). `[#3 · Mathematics]`
- **Do on paper:** 20 arithmetic/algebra drill problems (BODMAS, fractions, factorisation,
  expanding brackets). Use any Class 8–9 exercise book or Khan Academy `[#15]` for drills.
- **Milestone:** you can expand/factorise simple expressions and manipulate fractions confidently.

### Step 2 — Algebra foundations
- **Watch:** `[#4]` Class 11th Maths Super One Shot — focus on the algebra chapters (sets, relations,
  functions intro, quadratics, sequences & series, permutations/combinations basics).
- **Do on paper:** solve 15 quadratic-equation problems and 10 sequence/series problems.
- **Milestone:** solve a quadratic by formula *and* by factoring; explain what a function is.

### Step 3 — Algebra + functions
- **Watch:** continue `[#4]` — functions, graphs of basic functions, inequalities, complex-number intro.
- **Cross-watch (light):** `[#13]` Imaginary Numbers are Real (first ~4 videos) — builds intuition for
  why complex numbers exist. `[#13 · Mathematics]`
- **Do on paper:** sketch 10 basic function graphs by hand (linear, quadratic, cubic, |x|, 1/x, √x).
- **Milestone:** you can read a function's graph and say where it's increasing/zero/undefined.

### Step 4 — Trigonometry & coordinate geometry
- **Watch:** `[#4]` trig chapters (ratios, identities, graphs of sin/cos) + basic coordinate geometry.
- **Do on paper:** memorise the unit circle; plot sin/cos; solve 10 right-triangle problems.
- **Milestone:** you know sin/cos/tan on the unit circle and can use the Pythagorean identity.

### Step 5 — Calculus intuition (the big idea)
- **Watch:** `[#1]` Essence of calculus (3Blue1Brown) — all 12 videos. This is intuition-first and
  perfect for a beginner. `[#1 · Mathematics]`
- **Do on paper:** for 5 functions, estimate the slope at a point using tiny Δx; estimate area under
  the curve with rectangles (Riemann sum).
- **Milestone:** explain in your own words what a derivative and an integral *mean* (rate of change
  vs accumulated area) and how the Fundamental Theorem links them.

### Step 6 — Linear-algebra intuition (the other big idea)
- **Watch:** `[#2]` Essence of linear algebra (3Blue1Brown) — all 16 videos. `[#2 · Mathematics]`
- **Do on paper:** do vector addition/scalar multiply by hand; compute a 2×2 determinant; multiply a
  2×2 matrix by a vector; find the visual meaning of "what does this matrix do to space."
- **Milestone:** explain what a matrix *does* (a linear transformation of space), what determinant
  means (area/volume scaling), and what eigenvectors are (axes that don't rotate).

### Step 7 — Consolidation & Class 12 calculus preview
- **Watch:** `[#5]` Class 12th Maths Super One Shot — limits, derivatives, and basic integrals chapters
  (now that `[#1]` gave you the intuition).
- **Re-watch (pick 3):** your weakest 3 videos from `[#1]`/`[#2]`.
- **Milestone:** differentiate xⁿ, sin, cos, eˣ, ln x from a table; integrate xⁿ.

### Step 8 — Phase-0 checkpoint & "think like a mathematician"
- **Watch:** `[#12]` Think like a Mathematician! Series — 3–4 videos on proof habits & problem-solving
  mindset. `[#12 · Mathematics]`
- **Checkpoint (do all without notes):**
  - [ ] Expand/factorise a quadratic.
  - [ ] Differentiate a polynomial and a trig function.
  - [ ] Compute a 2×2 determinant and say what it means.
  - [ ] Explain derivative & integral in one sentence each.
  - [ ] Multiply a matrix by a vector by hand.
- **If any box fails:** spend the weekend re-watching the relevant `[#1]/[#2]/[#4]` section. Do not
  move to Phase 1 until boxes 1, 3, 4 hold.

---
## 🅱️ TRACK B — Phase 0 · Python from zero → DSA Month 1 (Steps 1–8)

> You cannot do DSA before you can code. So Weeks 1–3 build Python; from Week 3 onward you begin the
> DSA "Month 1" problem sequence (the full day-by-day list is preserved in **Appendix A** — this is
> the beginner-paced version). Practice platform: LeetCode `[#73]`.

### Step 1 — Your first Python (setup + basics)
- **Watch:** `[#45]` CS50's Introduction to Programming with Python (CS50P) — Lectures 0–3
  (functions, variables, conditionals). `[#45 · Programming]`
- **Also watch (Hindi, if CS50P feels fast):** `[#44]` Python Tutorial for Beginners — first ~10 videos.
- **Do:** install Python + VS Code. Write 10 tiny programs (hello, arithmetic, if/else, a loop).
- **Milestone:** write a function that takes a number and returns whether it's prime.

### Step 2 — Loops, lists, and logic
- **Watch:** `[#45]` CS50P Lectures 4–6 (loops, exceptions, libraries) + `[#48]` Python for Beginners
  (loops/lists sections). `[#48 · Programming]`
- **Do:** 15 small problems — FizzBuzz, reverse a string, count vowels, max of a list, sum of digits,
  palindrome check, etc. Keep them in a GitHub repo.
- **Milestone:** solve "print all primes below N" using a loop, without looking anything up.

### Step 3 — Dictionaries, sets, files + NumPy preview
- **Watch:** `[#45]` CS50P Lectures 7–9 (dicts, unit tests, file I/O) + `[#49]` MIT 6.100L Lectures 1–2.
  `[#49 · Programming]`
- **Start DSA concepts:** `[#66]` VisuAlgo — open the "Array" and "Recursion" pages and just *watch the
  animations*. `[#66 · DSA]`
- **Do:** a program that reads a text file and counts word frequencies with a dictionary.
- **Milestone:** you can explain when to use a `list` vs `dict` vs `set`.

### Step 4 — DSA Month 1 begins: complexity + arrays/strings
- **Learn:** Big-O (O(1), O(log n), O(n), O(n log n), O(n²)) — from `[#67]` DSA Course in Hindi (complexity
  section) or `[#68]` DSA Easy→Advanced (first complexity videos). `[#67 · DSA]`
- **Solve on LeetCode `[#73]`:** 1929 Concatenation of Array, 1480 Running Sum, 121 Best Time to Buy
  and Sell Stock (or 485 Max Consecutive Ones), 125 Valid Palindrome.
- **Implement by hand:** find max, sum, and membership in an array.
- **Milestone:** explain why array traversal is O(n) and dict lookup is ~O(1).

### Step 5 — Hashing (sets & maps) — the workhorse
- **Learn:** hash sets & hash maps from `[#68]`.
- **Solve on LeetCode:** 217 Contains Duplicate (do *two* ways: sort + hash set), 1 Two Sum,
  242 Valid Anagram, 383 Ransom Note (stretch).
- **Milestone:** explain set vs frequency-map vs value-to-index map.

### Step 6 — Sorting + two-pointer foundations
- **Learn:** why sorting helps; insertion sort; two-pointer idea — `[#68]`.
- **Implement:** insertion sort from scratch.
- **Solve on LeetCode:** 905 Sort Array By Parity, 88 Merge Sorted Array, 344 Reverse String,
  977 Squares of a Sorted Array (stretch).
- **Milestone:** recognise when sorting turns an O(n²) brute force into O(n log n) + one pass.

### Step 7 — Binary search + recursion
- **Learn:** binary search boundaries (`left <= right`), and recursion base cases — `[#68]`.
- **Implement:** iterative *and* recursive binary search; factorial & string-reverse recursively.
- **Solve on LeetCode:** 704 Binary Search (both forms), 35 Search Insert Position, 509 Fibonacci
  (naive + iterative, compare).
- **Milestone:** write binary search from memory; explain a base case.

### Step 8 — Linked lists, stacks, queues + Month-1 checkpoint
- **Learn:** linked-list nodes/pointers, LIFO/FIFO — `[#68]` + `[#66]` (LinkedList, Stack, Queue pages).
- **Implement:** a singly linked list (insert front/end, print, search), a stack with a list, a queue
  with `collections.deque`.
- **Solve on LeetCode:** 876 Middle of Linked List, 206 Reverse Linked List, 141 Linked List Cycle,
  20 Valid Parentheses, 232 Implement Queue using Stacks.
- **Phase-0 Track-B checkpoint (do without notes):**
  - [ ] Reverse a linked list.
  - [ ] Write binary search.
  - [ ] Solve Two Sum with a hash map.
  - [ ] Implement a stack and a queue.
  - [ ] State time & space complexity of everything above.

---
# 📅 PART 2 — PHASE 1: CORE MATH + CORE DSA (Weeks 15–33)

**Goal:** Track A moves to *discrete math + probability + formal linear algebra & calculus* — the exact
maths that CS, algorithms, and ML need. Track B moves into *real DSA patterns* (two pointers, sliding
window, prefix sums, trees, graphs) and starts **building small projects**.

> **Pacing note (audited):** this is the heaviest Track-A video block — ~102 h raw
> (discrete `[#17]` 9 h + `[#26]` 32 h; calculus `[#20]` 28.5 h; linear algebra `[#21]` 28 h; diff-eq `[#19]`
> 3 h). At ~6 raw-h/week that's ~17 weeks — hence the 15–33 range. **ONE primary per topic** (see the
> de-dup table): do NOT also watch `[#25]`/`[#27]`/`[#24]`/`[#30]`/`[#31]` — they are backups.

**Track A spine (ONE primary each):** `[#17]` → `[#26]` → `[#16]/[#28]` → `[#20]` → `[#21]` → `[#19]`.
**Track B spine:** DSA Month 2 → Month 3 with `[#68]` + LeetCode `[#73]`, plus `[#59]` pandas and
your **first two projects**. *(Use Striver `[#70]` only as a topic→problem reference, not to watch.)*

---

## 🅰️ TRACK A — Phase 1 · Core maths (Steps 9–20)

### Step 9 — Discrete math for beginners (logic & proof)
- **Watch:** `[#17]` Discrete Mathematics Course for Beginners — logic, propositions, proof techniques,
  sets. `[#17 · Mathematics]`
- **Do on paper:** prove 5 simple statements (direct, contrapositive); do 10 set-operation problems.
- **Milestone:** state the contrapositive of a claim; explain proof by contradiction with an example.

### Step 10 — Discrete math: counting, relations, functions
- **Watch:** continue `[#17]` (counting, relations, functions) — and peek `[#25]` Discrete Math I
  (Rosen-based) for the same topics at college depth. `[#25 · Mathematics]`
- **Do on paper:** 15 counting problems (product rule, permutations, combinations).
- **Milestone:** solve "how many ways to arrange/choose" problems; explain injective/surjective.

### Step 11 — Discrete math for CS (proofs & structures)
- **Watch:** `[#26]` MIT 6.1200J Mathematics for Computer Science — Lectures 1–6 (proofs, induction,
  number theory basics). `[#26 · Mathematics]`
- **Do on paper:** 3 proofs by induction; 10 modular-arithmetic problems.
- **Milestone:** write a proof by induction; compute with modular arithmetic.

### Step 12 — Applied discrete math
- **Watch:** `[#27]` MIT 18.200 Principles of Discrete Applied Mathematics — first ~6 lectures
  (counting, probability, graphs). `[#27 · Mathematics]`
- **Milestone:** you've now seen how discrete math powers graphs & algorithms (feeds Track B Month 3).

### Step 13 — Probability intuition
- **Watch:** `[#16]` "Give Me 1 Hour, I'll Make Probability Click Forever" — intuition-first. `[#16 · Mathematics]`
- **Do on paper:** 15 basic probability problems (coins, dice, conditional).
- **Milestone:** explain sample space, event, conditional probability, and Bayes in plain words.

### Step 14 — Probability depth
- **Watch:** `[#28]` Probabilities of probabilities (binomial → PDFs). `[#28 · Mathematics]`
- **Do on paper:** compute binomial probabilities; sketch a normal distribution.
- **Milestone:** explain expected value and variance; why a point can have probability 0 but non-zero density.

### Step 15 — Formal single-variable calculus
- **Watch:** `[#20]` MIT 18.01 Single Variable Calculus — Lectures 1–8 (limits, derivatives, chain rule).
  `[#20 · Mathematics]` (Re-watch matching `[#1]` videos if intuition is shaky.)
- **Do on paper:** 20 differentiation problems; 10 related-rates/optimisation problems.
- **Milestone:** differentiate products/quotients/compositions fluently; solve a max/min word problem.

### Step 16 — Integration (formal)
- **Watch:** `[#20]` Lectures 18–26 (integration techniques, FTC).
- **Do on paper:** 20 integration problems (substitution, by parts).
- **Milestone:** integrate common functions; use FTC to evaluate a definite integral.

### Step 17 — Formal linear algebra
- **Watch:** `[#21]` MIT 18.06 Linear Algebra — Lectures 1–10 (elimination, vector spaces, determinants,
  eigenvalues). `[#21 · Mathematics]`
- **Do on paper:** solve a 3×3 linear system by elimination; compute eigenvalues of a 2×2.
- **Milestone:** explain rank, null space, determinant, eigenvector — and *why* they matter.

### Step 18 — Linear algebra: orthogonality & projections
- **Watch:** `[#21]` Lectures 11–20 (projections, least squares, orthogonal bases).
- **Milestone:** project a vector onto a subspace; explain least-squares (this is the seed of linear regression).

### Step 19 — Differential equations (light, for physics/ML later)
- **Watch:** `[#19]` Differential equations playlist — first ~6 videos (what an ODE is, separable, first-order).
  `[#19 · Mathematics]`
- **Milestone:** solve a separable ODE; explain why dy/dx = ky gives exponentials.

### Step 20 — Phase-1 checkpoint
- **Without notes, do all:**
  - [ ] Prove something by induction.
  - [ ] Compute a conditional probability + apply Bayes once.
  - [ ] Differentiate and integrate a moderate expression.
  - [ ] Find eigenvalues of a 2×2 matrix and say what they mean.
  - [ ] Solve a counting problem (permutation/combination).
- **Stretch (optional):** start `[#18]` "All the Statistics You Need for AI Engineering" to bridge into
  Phase 2 stats. `[#18 · Mathematics]`

---
## 🅱️ TRACK B — Phase 1 · DSA patterns + first projects (Steps 9–20)

> Now you're coding. Track B follows the DSA "Month 2" and "Month 3" topic lists (full lists preserved
> in **Appendix A**). Main source: `[#68]` DSA Easy→Advanced and `[#70]` Striver A2Z playlist. Practice
> on LeetCode `[#73]`; stretch on CSES `[#74]`.

### Step 9 — Two pointers in depth
- **Learn:** opposite & same-direction two pointers — `[#68]`.
- **Solve:** 167 Two Sum II, 125 Valid Palindrome (redo), 15 3Sum (intro), 11 Container With Most Water.
- **Milestone:** recognise sorted-array + pair problems → two pointers.

### Step 10 — Sliding window
- **Learn:** fixed vs variable sliding window — `[#68]`.
- **Solve:** 121 Best Time… (redo), 3 Longest Substring Without Repeating Characters, 424 Longest
  Repeating Character Replacement, 567 Permutation in String.
- **Milestone:** explain the window-invariant and when to shrink.

### Step 11 — Prefix sums + difference arrays
- **Learn:** prefix sums, range-sum queries, Kadane's — `[#68]`.
- **Solve:** 303 Range Sum Query, 53 Maximum Subarray, 1248 Count Number of Nice Subarrays.
- **Milestone:** turn an O(n²) range-sum into O(1) with prefix sums.

### Step 12 — Intervals + matrices + project #1
- **Learn:** interval merging/sorting — `[#68]`.
- **Solve:** 56 Merge Intervals, 57 Insert Interval, 73 Set Matrix Zeroes.
- **🚀 PROJECT #1 — "Python Toolkit":** a GitHub repo with reusable functions (your linked list, stack,
  queue, binary search, two-pointer templates) + a `pytest` `[#61]` test file for each. Make the README
  explain each structure. `[#61 · Programming]`
- **Milestone:** someone can `pip install`-style clone your repo and run your tests green.

### Step 13 — Advanced binary search + binary search on answer
- **Learn:** binary search on the answer, rotated arrays — `[#68]`.
- **Solve:** 33 Search in Rotated Sorted Array, 153 Find Minimum in Rotated Sorted Array,
  875 Koko Eating Bananas.
- **Milestone:** explain how to binary-search a *non-array* answer space.

### Step 14 — Monotonic stack + intro greedy
- **Learn:** monotonic stack/queue — `[#68]`.
- **Solve:** 739 Daily Temperatures, 496 Next Greater Element I, 84 Largest Rectangle in Histogram.
- **Milestone:** recognise "next greater/smaller" → monotonic stack.

### Step 15 — Trees: binary trees + DFS
- **Learn:** binary trees, recursion on trees, DFS (pre/in/post) — `[#68]` + visualise on `[#66]`.
- **Solve:** 104 Maximum Depth, 226 Invert Binary Tree, 100 Same Tree, 572 Subtree of Another Tree.
- **Milestone:** write recursive tree traversals from memory.

### Step 16 — Trees: BST + path problems
- **Learn:** BST property, validation, LCA — `[#68]`.
- **Solve:** 98 Validate BST, 235 LCA of a BST, 110 Balanced Binary Tree, 543 Diameter of Binary Tree.
- **Milestone:** explain the BST invariant and use it to prune search.

### Step 17 — Heaps + top-k
- **Learn:** heaps/priority queue — `[#68]`.
- **Solve:** 215 Kth Largest Element, 347 Top K Frequent Elements, 23 Merge k Sorted Lists.
- **Milestone:** know when a heap beats sorting (top-k, streaming).

### Step 18 — Tries + graph representation + BFS
- **Learn:** tries; graph as adjacency list; BFS — `[#68]`.
- **Solve:** 208 Implement Trie, 200 Number of Islands, 133 Clone Graph, 102 Binary Tree Level Order.
- **Milestone:** BFS gives shortest path in an unweighted graph — explain why.

### Step 19 — DFS on graphs + cycle detection + topological sort
- **Learn:** DFS, cycle detection, topo sort, union-find — `[#68]`.
- **Solve:** 207 Course Schedule, 210 Course Schedule II, 547 Number of Provinces,
  684 Redundant Connection.
- **Milestone:** detect a cycle and produce a topological order.

### Step 20 — Phase-1 checkpoint + project #2 + pandas
- **Learn (light):** `[#59]` pandas getting-started (Series, DataFrame, groupby). `[#59 · Programming]`
- **🚀 PROJECT #2 — "Data Playground":** load a CSV (any dataset, e.g. from `[#113]` UCI ML Repository),
  clean it with pandas, compute group statistics, and plot 3 charts. `[#113 · Classical ML]`
- **Checkpoint (no notes):**
  - [ ] Solve a sliding-window medium from scratch.
  - [ ] Invert a binary tree + compute its max depth.
  - [ ] BFS shortest path on a grid (Number of Islands).
  - [ ] Detect a cycle in a directed graph.
  - [ ] Load + groupby + plot a dataset in pandas.

---
# 📅 PART 3 — PHASE 2: STATS + SYSTEMS + DP (Weeks 34–47)

**Goal:** Track A finishes the *statistics* spine (the maths Classical ML needs) and starts *CS
Fundamentals*. Track B tackles the hardest DSA month (recursion, backtracking, **dynamic programming**)
and builds its **first real data/ML-adjacent project**.

> **Pacing note (audited):** ~76 h raw Track A (Stat 110 `[#29]` 27 h; stats-for-AI `[#18]` 3.7 h;
> CS-fundamentals videos `[#80]` 11.9 h + `[#81]` 2.1 h + `[#82]` 11.5 h + `[#83]` 19.3 h). At ~6
> raw-h/week ≈ 13 weeks — hence 34–47. **ONE primary per topic:** probability = `[#29]` only (NOT
> `[#30]`/`[#31]`); the statsmodels/scipy/PyMC sites `[#34]/[#35]/[#36]/[#37]` are *reference while
> coding*, not watch-time.

**Track A spine (ONE primary each):** `[#29]` → `[#18]` → CS-fundamentals `[#80]→[#81]→[#82]→[#83]`.
**Track B spine:** DSA Month 4 (DP) with `[#68]` + LeetCode `[#73]`, plus project #3.

---

## 🅰️ TRACK A — Phase 2 · Stats + CS fundamentals (Steps 21–28)

### Step 21 — Formal probability (Harvard Stat 110 style)
- **Watch:** `[#29]` Statistics 110: Probability — Lectures 1–8 (counting, conditional, distributions).
  `[#29 · Mathematics]`
- **Do:** 15 problems on random variables, expectation, variance.
- **Milestone:** compute expectation/variance of a random variable; explain independence.

### Step 22 — Probability for CS (or MIT 6.041)
- **Watch:** `[#30]` Stanford CS109 (or `[#31]` MIT 6.041) — Lectures on distributions, CLT, Bayes
  networks. `[#30 · Mathematics]`
- **Milestone:** explain the Law of Large Numbers and the Central Limit Theorem.

### Step 23 — Statistics for AI (applied bridge)
- **Watch:** `[#18]` "All the Statistics You Need for AI Engineering" — full video. `[#18 · Mathematics]`
- **Do:** 10 problems on mean/median/mode, std, correlation, basic hypothesis testing.
- **Milestone:** explain bias-variance intuition, p-value (what it is *and* isn't), correlation vs causation.

### Step 24 — Statistical tooling in Python
- **Read/skim:** `[#34]` scipy.stats, `[#35]` statsmodels, `[#36]` statsmodels time-series.
  `[#34 · Mathematics]`
- **Do (in your Data Playground repo):** compute mean/std/percentiles with NumPy; run a t-test and a
  linear regression with statsmodels; interpret the output.
- **Milestone:** fit a line to data and read the coefficients + R².

### Step 25 — CS Fundamentals: how computers work
- **Watch:** `[#79]` The AMAZING History of Computers, then `[#80]` How do computers work? (from scratch).
  `[#79 · CS Fundamentals]`
- **Milestone:** explain, at a high level, how transistors → logic gates → CPU → memory → programs.

### Step 26 — CS Fundamentals: compilers & abstraction
- **Watch:** `[#82]` How do compilers work? (build a tiny language to find out). `[#82 · CS Fundamentals]`
- **Milestone:** explain what a compiler does (source → tokens → parse → codegen) and why abstractions stack.

### Step 27 — CS Fundamentals: computation structures
- **Watch:** `[#83]` MIT 6.004 Computation Structures — Lectures 1–6 (digital logic, finite state machines,
  basic ISA). `[#83 · CS Fundamentals]`
- **Milestone:** explain how a finite-state machine works and how instructions are encoded.

### Step 28 — Phase-2 checkpoint
- **Without notes:**
  - [ ] Compute expectation + variance of a simple random variable.
  - [ ] Explain CLT and a p-value in plain words.
  - [ ] Fit a linear regression in statsmodels and interpret it.
  - [ ] Explain how a compiler turns code into execution.
  - [ ] Explain what a finite-state machine is.
- **Peek ahead:** `[#38]` MIT 18.642 (maths for finance) — just the syllabus, to preview Phase 3 quant.

---
## 🅱️ TRACK B — Phase 2 · Recursion, Backtracking, DP + Project #3 (Steps 21–28)

> DSA Month 4 is the hardest. **Slow down.** The goal is to *derive recurrences*, not memorise solutions.
> Source: `[#68]` + `[#70]`. Practice on LeetCode `[#73]`; DP stretch on CSES `[#74]`.

### Step 21 — Recursion deep-dive + subsets
- **Learn:** recursion trees, subsets/combinations generation — `[#68]`.
- **Solve:** 78 Subsets, 90 Subsets II, 46 Permutations.
- **Milestone:** draw the recursion tree for "generate all subsets."

### Step 22 — Backtracking
- **Learn:** backtracking template (choose → explore → un-choose) — `[#68]`.
- **Solve:** 39 Combination Sum, 79 Word Search, 17 Letter Combinations of a Phone Number.
- **Milestone:** explain pruning and why backtracking = DFS + undo.

### Step 23 — 1D dynamic programming
- **Learn:** memoisation → tabulation; Climbing Stairs recurrence — `[#68]`.
- **Solve:** 70 Climbing Stairs, 198 House Robber, 322 Coin Change, 746 Min Cost Climbing Stairs.
- **Milestone:** define the DP state + recurrence in words *before* coding.

### Step 24 — 2D DP + grid
- **Learn:** 2D DP tables, grid paths — `[#68]`.
- **Solve:** 62 Unique Paths, 64 Minimum Path Sum, 1143 Longest Common Subsequence.
- **Milestone:** fill a 2D DP table by hand for LCS.

### Step 25 — Knapsack family
- **Learn:** 0/1 knapsack, subset-sum, unbounded — `[#68]`.
- **Solve:** 416 Partition Equal Subset Sum, 474 Ones and Zeroes, 518 Coin Change II.
- **Milestone:** explain the difference between combination vs permutation counting in DP.

### Step 26 — Greedy reasoning + intervals revisit
- **Learn:** greedy-choice property; when greedy works — `[#68]`.
- **Solve:** 55 Jump Game, 435 Non-overlapping Intervals, 763 Partition Labels.
- **Milestone:** justify a greedy choice with an exchange argument.

### Step 27 — 🚀 PROJECT #3 — "Algorithm Visualizer + Notebook"
- Combine your DP/backtracking knowledge into a repo that (a) implements + unit-tests `[#61]` your
  top-10 algorithms, and (b) contains a short write-up per algorithm (idea, complexity, when to use).
  Visualise at least one (e.g. binary search or a tree traversal) — text/ASCII is fine.
- **Milestone:** a clean, tested, documented algorithms repo — your DSA portfolio centerpiece.

### Step 28 — Phase-2 checkpoint + interview habits
- **Without notes:**
  - [ ] Generate all subsets and permutations.
  - [ ] Solve Word Search with backtracking.
  - [ ] Solve Coin Change with 1D DP, stating the recurrence.
  - [ ] Solve LCS with a 2D table.
  - [ ] Explain 0/1 knapsack recurrence.
- **Habit:** start timing yourself (Easy 10–20 min, Medium 25–40 min) and keep the mistake log.

---
# 📅 PART 4 — PHASE 3: QUANT + ADVANCED DSA + ML IGNITION (Weeks 48–65)

**Goal:** Track A completes the *quant/finance* branch (why you collected all those quant resources) and
finishes CS systems depth. Track B finishes the DSA curriculum (Months 5–6: advanced graphs, DP,
design) **and ignites Classical ML** (Stages 0–2: numerical foundations, probability/stats in ML, linear
models). This is where the two tracks start to *fuse* — the maths you learned now pays off in ML.

> **Pacing note (audited):** Track A here is ~50 h raw (quant math `[#38]` 26 h; financial theory
> `[#281]` — watch ~first third ≈12 h; trading `[#271]` 2 h + `[#276]` 8 h). At ~6 raw-h/week ≈ 9 weeks;
> CS-systems depth (`[#84]`/`[#86]`/`[#87]`) is *selective* (first ~4 lectures each, not full courses).
> **ONE primary per topic:** do NOT also watch `[#273]` (35 h), `[#275]`, `[#277]–[#279]` — backups.
> Track B's DSA Months 5–6 is practice-driven (problem-count, not video), so it stretches comfortably.

**Track A spine (ONE primary each):** quant puzzles `[#39]/[#40]/[#41]` → `[#38]` → `[#281]` (partial) →
trading `[#271]/[#276]` → CS systems `[#84]/[#86]/[#87]` (selective).
**Track B spine:** DSA Months 5–6 with `[#77]`/`[#78]` as references + LeetCode `[#73]` → **Classical ML
Stage 0–2** with `[#88]`/`[#33]`/`[#119]`.

---

## 🅰️ TRACK A — Phase 3 · Quant + CS systems (Steps 29–40)

### Step 29 — Quant interview maths (puzzles)
- **Practice:** `[#39]` Brainstellar Puzzles from Quant Interviews — do ~10 puzzles/week. `[#39 · Mathematics]`
- **Milestone:** get comfortable with estimation, probability puzzles, and "think out loud" style.

### Step 30 — Quant question platforms
- **Practice:** `[#40]` Quant Questions + `[#41]` QuantGuide — a few questions each, focus on the
  *reasoning patterns* (market making, expected value, game theory). `[#40 · Mathematics]`
- **Milestone:** recognise common quant puzzle archetypes.

### Step 31 — Maths for finance
- **Watch:** `[#38]` MIT 18.642 Topics in Mathematics with Applications in Finance — first ~8 lectures
  (linear algebra, probability, stochastic processes for finance). `[#38 · Mathematics]`
- **Milestone:** explain what a stochastic process is and where it shows up in finance.

### Step 32 — Financial theory
- **Watch:** `[#281]` Financial Theory with John Geanakoplos — first ~6 lectures. `[#281 · Mathematics]`
- **Milestone:** explain present value, risk/return, and market equilibrium at a high level.

### Step 33 — Market making intuition
- **Watch:** `[#271]` How Citadel Makes Money (market making explained) + `[#280]` Kent Daniel: Price Momentum.
  `[#271 · Mathematics]`
- **Milestone:** explain what a market maker does and where their edge comes from.

### Step 34 — Algorithmic trading foundations
- **Watch:** `[#272]` How to Build a Trading Bot in Python (setup + basics). `[#272 · Mathematics]`
- **Milestone:** explain the anatomy of a simple backtest.

### Step 35 — Quant strategies course
- **Watch:** `[#276]` Quantitative trading strategies playlist — first third. `[#276 · Mathematics]`
- **Milestone:** describe 2–3 quant strategy families (momentum, mean-reversion, stat-arb).

### Step 36 — CS systems: programming paradigms + OS
- **Watch:** `[#84]` Programming Paradigms (Stanford) first 3 lectures + `[#86]` CS162 Operating Systems
  first 3 lectures. `[#84 · CS Fundamentals]`
- **Milestone:** explain processes, memory, and the OS's role.

### Step 37 — CS systems: performance engineering
- **Watch:** `[#87]` MIT 6.172 Performance Engineering — first ~4 lectures. `[#87 · CS Fundamentals]`
- **Milestone:** explain caching/locality and why constant factors matter.

### Step 38 — Quant channels (breadth)
- **Watch:** 3–4 videos each from `[#282]` Surbhi Verma (Quant) and `[#298]` Roman Paolucci (QuantGuild)
  for industry perspective. `[#282 · Mathematics]`
- **Milestone:** you can describe a day in the life of a quant and the skills they hire for.

### Step 39 — Consolidation (quant + CS systems)
- Re-do 5 Brainstellar puzzles you failed. Re-watch your weakest systems lecture.
- **Milestone:** solid recall across the whole quant + systems branch.

### Step 40 — Phase-3 checkpoint
- **Without notes:**
  - [ ] Solve a fresh Brainstellar-style probability puzzle.
  - [ ] Explain market making + one quant strategy.
  - [ ] Explain processes/memory and the OS.
  - [ ] Explain why caching/locality matters for performance.

---
## 🅱️ TRACK B — Phase 3 · Advanced DSA → Classical ML ignition (Steps 29–40)

### Step 29 — Advanced graphs: shortest paths
- **Learn:** Dijkstra, Bellman-Ford — `[#77]` CP-Algorithms (shortest paths) + `[#68]`.
- **Solve:** 743 Network Delay Time, 1514 Path with Maximum Probability, 787 Cheapest Flights K Stops.
- **Milestone:** explain when Dijkstra fails (negative weights) and what to use instead.

### Step 30 — Minimum spanning trees + advanced union-find
- **Learn:** Kruskal/Prim, union-find by rank + path compression — `[#77]`.
- **Solve:** 1584 Min Cost to Connect All Points, 1135 Connecting Cities, 721 Accounts Merge.
- **Milestone:** implement union-find from memory.

### Step 31 — Bit manipulation + advanced heaps
- **Learn:** bit ops, two-heaps pattern — `[#77]` + `[#68]`.
- **Solve:** 136 Single Number, 191 Number of 1 Bits, 295 Find Median from Data Stream, 480 Sliding Window Median.
- **Milestone:** use XOR tricks; maintain a running median with two heaps.

### Step 32 — Advanced DP + string algorithms
- **Learn:** DP on strings, bitmask DP intro, KMP (awareness) — `[#77]`.
- **Solve:** 5 Longest Palindromic Substring, 97 Interleaving String, 312 Burst Balloons.
- **Milestone:** recognise interval-DP and string-DP patterns.

### Step 33 — Trees advanced: segment / Fenwick (awareness) + tries
- **Learn:** segment tree & Fenwick tree fundamentals — `[#77]`.
- **Solve:** 307 Range Sum Query Mutable, 212 Word Search II, 336 Palindrome Pairs.
- **Milestone:** explain what a Fenwick tree does and its complexity.

### Step 34 — Design problems + LeetCode 75 push
- **Solve (design):** 146 LRU Cache, 355 Design Twitter, 380 Insert Delete GetRandom O(1).
- **Push:** work through `[#73]` LeetCode 75 study plan — knock out remaining Easy/Medium.
- **Milestone:** design an LRU cache (hash map + doubly linked list) from scratch.

### Step 35 — 🚀 PROJECT #4 + Classical ML Stage 0 begins
- **🚀 PROJECT #4 — "ML Foundations Toolkit":** start your Classical ML Stage-0 repo. Implement NumPy
  `[#58]` matrix ops, gradient of a function, a tiny autograd, with `pytest` tests `[#61]`.
- **Watch:** `[#88]` Google Machine Learning Crash Course — first half. `[#88 · Classical ML]`
- **Milestone:** numerical-gradient matches analytic gradient on a test function.

### Step 36 — Classical ML Stage 1 (probability/stats for ML)
- **Read:** `[#32]` An Introduction to Statistical Learning (ISLP) — Chapters 1–2. `[#32 · Classical ML]`
- **Watch:** `[#33]` Statistical Learning with Python — early lectures. `[#33 · Classical ML]`
- **Do:** simulation lab — simulate distributions, Monte-Carlo estimate π and an expectation.
- **Milestone:** you can frame a prediction problem statistically.

### Step 37 — Classical ML Stage 2 (linear models)
- **Read:** `[#32]` ISLP Chapters 3–4 (linear regression, classification). `[#32 · Classical ML]`
- **Watch:** `[#119]` Stanford CS229 — Lectures 1–3 (linear regression, LMS, normal equations).
  `[#119 · Classical ML]`
- **Implement:** linear regression from scratch (normal equations + gradient descent); compare to sklearn.
- **Milestone:** fit + interpret a linear regression and compare GD vs closed-form.

### Step 38 — Logistic regression + sklearn workflow
- **Read:** `[#32]` ISLP Ch 4 (classification). **Watch:** `[#119]` CS229 Lectures 4–5 (logistic regression).
- **Implement:** logistic regression from scratch; then with sklearn on a real dataset `[#113]`.
- **Milestone:** compute + plot a decision boundary; interpret coefficients.

### Step 39 — 🚀 PROJECT #5 — "Linear Models from Scratch"
- A repo implementing linear + logistic regression from scratch (NumPy), with a train/test split,
  a baseline comparison, and a written report. Follow the Classical ML "learning philosophy"
  (implement → use library → test on synthetic → test on real → compare to baseline → document).
- **Milestone:** reproducible repo; someone else can clone and reproduce your numbers.

### Step 40 — Phase-3 checkpoint (Track B)
- **Without notes:**
  - [ ] Implement Dijkstra + union-find.
  - [ ] Solve a 2D-DP and an interval-DP problem.
  - [ ] Design an LRU cache.
  - [ ] Implement linear + logistic regression from scratch and interpret them.
  - [ ] Fit a model with sklearn and compare to a baseline.

---
# 📅 PART 5 — PHASES 4 & 5: THE ML / RL / LLM ENGINE (Weeks 66 → end)

From here, **Track B becomes the main engine** (Classical ML → Deep Learning → RL → LLM Systems), and
**Track A becomes supporting** — you dip back into maths/stats topics *as each ML stage needs them*
(reinforcement, not front-loading). Each row below = a multi-week block.

> **Re-basing note (audited):** the week numbers in the three tables below were written for the *old*
> schedule. **Add ~25 weeks to every Track-B week number** (old "41–43" → now ≈66–68), or — simpler —
> **ignore the absolute week and read each row's block as "N weeks of Track B starting when the previous
> block ends."** The Classical-ML curriculum alone is ~300–430 focused hours ≈ 30–50 weeks at 14 h/week;
> RL (54 rows) and LLM Systems (12 stages, ~293–475 h) each add another ~6–12 months. **This is the
> multi-year tail of the plan — that is expected and fine.** Track A in parallel is just-in-time maths
> support (20–30 min/week) plus optional depth.

Full topic lists, project
requirements, and completion criteria for every stage are preserved verbatim in **Appendices C, D, E** —
this table tells you *what to do each week and which resource to open*.

**Cadence:** each block ≈ 2–4 weeks of Track B (2 h/day). Track A in parallel = revisit the specific
maths the block needs (noted per row) + continue any unfinished quant/CS-fundamentals depth.

---

## 🅱️ TRACK B — Classical ML (follows `classical ml.md` Stages 3–13)

| Weeks | Stage | Do this | Open these resources | Track A support |
|---|---|---|---|---|
| 41–43 | **S3 Regularization** | Bias-variance, ridge/lasso, coefficient paths; build "Regularization & Complexity-Control Lab" | `[#32]` ISLP Ch 6; sklearn `[#107]` feature-selection/`[#103]` linear-models docs | Revisit variance from `[#29]` |
| 44–47 | **S4 Feature Engineering** | Leak-free mixed-data pipeline; encoders, scaling, imputation; "Leak-Free Feature Pipeline" | sklearn `[#101]` preprocessing, `[#102]` pipelines | Revisit distributions `[#30]` |
| 48–51 | **S5 Model Selection** | CV strategies, nested CV, hyperparameter search; "Validation & Selection Benchmark" | sklearn `[#108]` model-selection; `[#112]` OpenML | Hypothesis testing `[#18]` |
| 52–56 | **S6 Trees & Ensembles** | Decision trees, random forests, boosting; "Tree & Ensemble Comparison System" | sklearn `[#105]` trees, `[#106]` ensembles | — |
| 57–60 | **S7 SVMs** | Margins, kernels; "Margin & Kernel Lab" | sklearn `[#104]` SVM | Linear algebra `[#21]` recap |
| 61–64 | **S8 Clustering** | k-means, hierarchical, DBSCAN; "Clustering Benchmark" | sklearn `[#109]` clustering | — |
| 65–68 | **S9 Dimensionality Reduction** | PCA, t-SNE, UMAP; "Representation & Compression Study" | sklearn `[#110]` manifold, `[#111]` matrix-factorization | Eigenvectors `[#21]` |
| 69–72 | **S10 Optimisation** | SGD, momentum, Adam; "Optimiser Behaviour Lab" | `[#98]` PyTorch optim docs | Calculus `[#20]` recap |
| 73–80 | **S11 Deep-Learning Foundations** | Build a reproducible neural-network training system (MLP from scratch + PyTorch) | `[#94]` 3B1b neural nets, `[#285]` Karpathy Zero-to-Hero, `[#283]` PyTorch basics, `[#123]` DL book, `[#124]` D2L | Full calculus + linear algebra |
| 81–88 | **S12 Electives (pick 2)** | e.g. Computer Vision `[#117]/[#118]` CS231n, or Time-series `[#36]`, or Causality `[#115]` DoWhy, or Fairness `[#114]` Fairlearn | stage-specific | stage-specific |
| 89–96 | **S13 Production Capstone** | End-to-end production ML system (train → serve → monitor → test) | combine all above + `[#126]` 22 ML Projects for ideas | — |

> **Deep Learning depth track (optional, after S11):** `[#116]` CS230, `[#121]` MIT 6.7960,
> `[#120]` MIT 15.773 hands-on, `[#122]` DeepMind x UCL, `[#125]` Hinton evolution, `[#95]`/`[#96]`
> applied DL, `[#248]` ViT, `[#135]` HF CV course, `[#136]` HF diffusion, `[#134]` HF audio,
> `[#250]`/`[#251]` CLIP. These feed the LLM Multimodal stage later.

---
## 🅱️ TRACK B — Reinforcement Learning (follows `reinforcement learning.md` 54-row table)

| Weeks | Block (table rows) | Do this | Open these resources | Track A support |
|---|---|---|---|---|
| 97–100 | **Foundations** (rows 1–5) | Python/NumPy/PyTorch refresh, linear algebra, probability, calculus/optim, ML fundamentals — mostly done already | `[#285]`, `[#32]`, `[#1]`/`[#2]` | — |
| 101–112 | **Tabular RL core** (rows 6–14) | MDPs, bandits, dynamic programming, Monte-Carlo, TD, SARSA, Q-learning, eligibility traces — build tiny custom envs | `[#196]` Sutton playlist, `[#197]` Sutton & Barto book, `[#198]` David Silver, `[#195]` HF Deep RL, `[#201]` Gymnasium | Probability `[#29]` |
| 113–120 | **Deep RL value-based** (rows 15–18, 32–34) | Function approximation, DQN, advanced DQN, distributional RL | `[#220]` DQN, `[#224]` Double-Q, `[#225]` PER, `[#226]` Dueling, `[#232]` Rainbow, `[#231]` C51, `[#233]` QR-DQN, `[#202]` Spinning Up, `[#203]` CleanRL | Linear algebra `[#21]` |
| 121–130 | **Deep RL policy-based** (rows 19–25) | Policy gradients, actor-critic, GAE, TRPO, PPO, continuous control | `[#222]` GAE, `[#230]` PPO, `[#221]` TRPO, `[#223]` DDPG, `[#240]` SAC, `[#236]` TD3, `[#199]` CS234, `[#207]` CS185/285 | Calculus `[#20]` |
| 131–138 | **Cross-cutting** (rows 26–29, 37–40) | Exploration, reward design, model-based RL, optimal control, world models | `[#239]` RND, `[#206]` Reward Hacking, `[#237]` World Models, `[#243]` Dreamer, `[#242]` MuZero, `[#210]` Underactuated | — |
| 139–146 | **Imitation, offline, multi-agent** (rows 30–31, 35–36) | Imitation learning, offline RL, MARL, self-play | `[#227]` GAIL, `[#247]` CQL, `[#255]` IQL, `[#270]` D4RL, `[#205]` PettingZoo, `[#234]` AlphaZero, `[#228]` MAML, `[#235]` DIAYN | Probability `[#29]` |
| 147–152 | **RL systems & experimentation** (rows 41–44) | Vectorized envs, parallel rollouts, reproducibility, custom envs | `[#203]` CleanRL, `[#204]` Stable-Baselines3, `[#201]` Gymnasium, `[#205]` PettingZoo | — |
| 153–165 | **LLM-era RL** (rows 45–54) | RLHF, preference learning, RLVR, GRPO, modern LLM RL, reward hacking, agent RL, safe RL | `[#256]` InstructGPT, `[#261]` DPO, `[#267]` back-to-basics, `[#268]` DAPO, `[#290]` GRPO | Probability `[#29]` |

---
## 🅱️ TRACK B — LLM Systems Engineering (follows `LLM Systems Engineering.md` Stages 1–12)

| Weeks | Stage | Project output | Open these resources | Track A support |
|---|---|---|---|---|
| 166–172 | **S1 How LLMs Work** | Tiny Transformer Lab (tokenizer → attention → train on Tiny Shakespeare → decoding) | `[#131]` HF LLM Course, `[#229]` Attention, `[#128]` Illustrated Transformer, `[#151]` CS336, `[#286]` build-nanogpt, `[#246]` GPT-3, `[#244]`/`[#257]` scaling laws | Linear algebra `[#21]` |
| 173–175 | **S2 Prompt Engineering** | Prompt Reliability Lab (100-case structured-extraction benchmark) | `[#141]`/`[#142]` Anthropic, `[#139]` Gemini, `[#138]` DeepLearning.AI, `[#174]` Promptfoo | — |
| 176–179 | **S3 Context Engineering** | Context Manager (4 conversation-state strategies) | `[#294]` Anthropic context eng, `[#262]` Lost in the Middle, `[#265]` MemGPT | — |
| 180–183 | **S4 Model Types & Selection** | Model Selection Benchmark (encoder vs decoder vs enc-dec) | `[#156]` Transformers docs, `[#238]` BERT, `[#241]` T5, `[#249]` Switch, `[#266]` Mamba, `[#253]` LoRA, `[#260]` QLoRA, `[#136]` diffusion | — |
| 184–188 | **S5 Embeddings & Vector Search** | Semantic Search Engine (keyword vs dense vs hybrid vs rerank) | `[#166]` SBert, `[#165]` FAISS, `[#162]` Qdrant, `[#163]` Pinecone | Linear algebra `[#21]` |
| 189–194 | **S6 RAG** | Evaluated RAG Assistant (ingest→chunk→embed→retrieve→rerank→generate→cite→abstain) | `[#245]` RAG paper, `[#161]` LlamaIndex, `[#164]` pgvector, `[#264]`/`[#177]` Ragas | — |
| 195–201 | **S7 AI Agents** | Tool-Using Agent (typed tools, validation, safety, evaluation) | `[#293]` Anthropic agents, `[#291]` HF Agents Course, `[#258]` ReAct, `[#259]` Toolformer, `[#170]` smolagents, `[#169]` LangGraph, `[#295]` PydanticAI | — |
| 202–208 | **S8 MCP & Production** | MCP Server + Client (auth, timeouts, Docker, integration tests) | `[#171]` HF MCP, `[#172]` MCP spec, `[#212]` FastAPI, `[#296]`/`[#297]` Pydantic, `[#211]` Docker, `[#218]` Redis | CS systems `[#86]` |
| 209–213 | **S9 LLM Observability** | Instrumented application (spans, dashboards, seeded failures) | `[#182]` OTel, `[#184]` gen-ai conventions, `[#183]` OpenInference, `[#186]` openllmetry, `[#185]` Phoenix, `[#191]` Langfuse, `[#188]` LangSmith, `[#189]`/`[#190]` MLflow | — |
| 214–219 | **S10 Evaluation Frameworks** | 150-Case Evaluation Suite (all categories, human vs automated) | `[#175]` DeepEval, `[#179]` HELM, `[#181]` lm-eval-harness, `[#180]` Inspect, `[#254]` TruthfulQA | Statistics `[#18]` |
| 220–223 | **S11 Regression Testing** | LLM CI Quality Gates (reject ≥4 bad changes, accept 1 improvement) | `[#174]` Promptfoo, `[#175]` DeepEval, `[#61]` pytest, `[#214]`/`[#215]` GitHub Actions, `[#216]`/`[#217]` DVC, `[#213]` Git LFS | — |
| 224–230 | **S12 Multimodal AI** | Multimodal Search System (text/image retrieval, VQA) | `[#135]` HF CV course, `[#250]` CLIP, `[#248]` ViT, `[#136]` diffusion, `[#134]` audio, `[#251]` OpenCLIP | — |
| 231–240 | **Final Capstone** | Production-Grade LLM System (retrieval + tools + MCP + observability + eval + CI + deploy) | combine everything; see Appendix E | — |

> **Local inference & serving (sprinkle into S4/S8):** `[#157]` Ollama, `[#158]` llama.cpp,
> `[#160]` vLLM, `[#159]` Text Generation Inference, `[#146]` BitsAndBytes quantization.

---

## 🅰️ TRACK A — supporting role from Phase 4 (Week ~66) on

You've covered the core spine by Week 40. From here, Track A is **just-in-time**: each week, spend the
first 20–30 min revisiting the exact maths the current Track B stage needs (the "Track A support"
column above), then use the rest of Track A time to:
- Deepen anything weak (re-do `[#21]`, `[#29]`, `[#20]` sections),
- Finish any quant/CS-fundamentals depth you skipped,
- Work Brainstellar `[#39]` puzzles to keep quant interview skills warm,
- Read research blogs `[#42]` 3Blue1Brown, `[#130]` intro-to-LLMs, Lil'Log-style deep dives.

---
# 🧰 PART 6 — OPERATING SYSTEM (rules that make the plan work)

These are preserved from `dsa.md`, `classical ml.md`, and `reinforcement learning.md` — they are the
habits that turn "watching videos" into actual skill.

## The Problem Review System (after EVERY DSA problem)

Record these fields for each problem (a spreadsheet or Notion DB works):

| Field | What to write |
|---|---|
| Problem | Name + link |
| Topic | Main data structure / pattern |
| Difficulty | Easy / Medium / Hard |
| Result | Independent / Hint / Guided / Copied |
| First Idea | Your initial approach |
| Mistake | What went wrong |
| Key Insight | One reusable lesson |
| Complexity | Time + space |
| Review 1 | Next day |
| Review 2 | After three days |
| Review 3 | After seven days |

**Status ladder (only Independent, Recovered, Mastered count toward your real total):**
- **Independent** — solved without algorithmic help.
- **Hint** — needed a small directional hint.
- **Guided** — needed the main approach explained.
- **Copied** — followed solution code. *(Never count a copy as done.)*
- **Recovered** — previously guided/copied, later solved independently.
- **Mastered** — solved independently twice, including one delayed attempt.

## What To Do When Stuck (the ladder — never skip steps)

| Time spent | Action |
|---|---|
| 5 min | Restate the problem, write examples |
| 10 min | Write the brute-force solution |
| 15 min | Identify the bottleneck |
| 20 min | View ONE small hint |
| 25–30 min | Read the high-level approach |
| After learning | Close the solution and code it yourself |
| Next day | Re-solve from a blank editor |
| Within a week | Attempt again under a timer |

## The 7 Consistency Rules (during busy SST weeks)

1. **Do not** compensate for a missed day by doing four new problems the next day.
2. Use the next available session to continue the sequence.
3. On brutal days, do a 10-minute maintenance session: re-read one mistake, state one algorithm aloud, dry-run one old solution.
4. Reserve weekends for re-solving weak problems, longer Mediums, and from-scratch implementations.
5. Do not add random problems outside the current topic.
6. SST assignments take priority when they directly overlap (e.g. an SST DSA assignment can count toward this plan if you re-solve it independently and document it).
7. Problems solved for SST count only when documented + independently re-solved.

## The ML Learning Philosophy (for every Classical-ML / LLM concept)

1. Learn the underlying idea.
2. Implement a small version yourself.
3. Use the production implementation (scikit-learn / PyTorch / HF).
4. Test on controlled synthetic data.
5. Test on a real dataset.
6. Compare against a simple baseline.
7. Document assumptions and failure cases.
8. Convert the experiment into a reproducible repository.

> **A project is complete** when another person can clone the repo, install deps, reproduce the result,
> and understand the conclusions — *not* when the notebook runs.

## The LLM Learning Philosophy (7 laws)

1. Understand the abstraction before learning the framework.
2. Implement a small version of every important mechanism.
3. Evaluate systems using explicit datasets and metrics.
4. Version prompts, models, retrieval settings, tools, and context code.
5. Treat LLM applications as software systems, not isolated prompts.
6. Build reproducible repositories instead of disconnected notebooks.
7. Document failures, limitations, and negative results.

## Monthly Consolidation (every 4th week, ~2 h)

- [ ] Reimplement one algorithm without following a tutorial.
- [ ] Rerun one project from a clean environment.
- [ ] Review older notes.
- [ ] Fix repository documentation.
- [ ] Revisit failed experiments.
- [ ] Add tests.
- [ ] Publish one technical explanation.
- [ ] Compare current skills with the phase checkpoints.

## Weekly Review (Sunday, 15 min per track)

- What I learned / implemented / broke this week.
- The single most important mistake and its lesson.
- Next week's #1 objective.

---
# 🗂️ PART 7 — MASTER PROJECT REGISTRY

Every project from every source file, in one place, with the week it appears in this plan. Build these
in a public GitHub portfolio (the Classical-ML and LLM files both recommend publishing a repo series).

## Track B — DSA / Python projects
| # | Project | When | What it proves |
|---|---|---|---|
| P1 | **Python Toolkit** (linked list, stack, queue, binary search, two-pointer templates + pytest tests) | Week 12 | You can implement core structures cleanly and test them |
| P2 | **Data Playground** (pandas clean + groupby + plots on a UCI `[#113]` dataset) | Week 20 | You can wrangle real data |
| P3 | **Algorithm Visualizer + Notebook** (top-10 algorithms, tested + documented, 1 visualised) | Week 27 | DSA depth + communication |
| P4 | **ML Foundations Toolkit** (NumPy matrix ops, gradient, tiny autograd, tests) | Week 35 | Numerical + autodiff foundations |
| P5 | **Linear Models from Scratch** (linear + logistic regression, baseline comparison, report) | Week 39 | Classical ML core |

## Track B — Classical ML projects (Stages 0–13, from `classical ml.md`)
| Stage | Project | Est. hours |
|---|---|---|
| 0 | Numerical Foundations Toolkit | 45–60 |
| 1 | Statistical Simulation Laboratory | 40–55 |
| 2 | Linear Models from Scratch | 25–35 |
| 3 | Regularization and Complexity-Control Lab | 14–20 |
| 4 | Leak-Free Feature Pipeline | 18–26 |
| 5 | Validation and Selection Benchmark | 22–30 |
| 6 | Tree and Ensemble Comparison System | 25–35 |
| 7 | Margin and Kernel Lab | 16–24 |
| 8 | Clustering Benchmark | 16–24 |
| 9 | Representation and Compression Study (PCA) | 16–24 |
| 10 | Optimiser Behaviour Lab | 20–30 |
| 11 | Reproducible Neural Training System | 45–65 |
| 12 | Two specialised ML electives | 40–90 |
| 13 | Production Capstone (end-to-end ML system) | 60–100 |

**Suggested public repo sequence:** `ml-foundations-toolkit` → `statistics-simulation-lab` →
`linear-models-from-scratch` → `regularization-lab` → `leak-free-ml-pipelines` →
`cross-validation-benchmark` → (continue per stage).

## Track B — RL projects (from `reinforcement learning.md`)
GridWorld MDP · Epsilon-greedy vs UCB vs Thompson Sampling · policy/value iteration · MC on
Blackjack/FrozenLake · TD(λ) · SARSA on CliffWalking · Q-learning on FrozenLake · linear value-function
approx · DQN on CartPole/LunarLander · Double/Dueling DQN · REINFORCE · A2C · GAE comparison ·
simplified TRPO · PPO · DDPG vs TD3 vs SAC on MuJoCo · SAC + entropy · exploration comparison ·
reward-design exploit demo · model-based Dyna/World-Models · LQR+MPC · imitation (BC/DAgger/GAIL) ·
offline RL (CQL/IQL) · trajectory Transformer · C51/QR-DQN · simplified Rainbow · 2-agent competitive
game · self-play Tic-Tac-Toe · hierarchical navigation · MAML meta-RL · POMDP with LSTM policy ·
latent world model · Bellman/convergence proofs · vectorized envs + parallel rollouts · custom env ·
tiny RLHF pipeline · preference model + DPO · RLVR verifier task · GRPO · multi-algorithm LLM-RL
comparison · reward-hacking exploits · multi-step tool-use agent · safe/constrained RL · full paper
reproduction · novel RL paper.

## Track B — LLM Systems projects (Stages 1–12 + capstone, from `LLM Systems Engineering.md`)
| Stage | Project | Priority | Difficulty | Est. hours | Dependency |
|---|---|---|---|---|---|
| 1 | Tiny Transformer Lab | Core | Advanced | 25–35 | Python + PyTorch |
| 2 | Prompt Reliability Lab | Core | Beg–Int | 12–18 | Basic model inference |
| 3 | Context Manager | Core | Intermediate | 15–22 | Prompt Reliability Lab |
| 4 | Model Selection Benchmark | Important | Intermediate | 12–18 | LLM fundamentals |
| 5 | Semantic Search Engine | Core | Intermediate | 18–25 | Embeddings |
| 6 | Evaluated RAG Assistant | Core | Advanced | 25–40 | Semantic Search Engine |
| 7 | Tool-Using Agent | Core | Advanced | 25–40 | RAG + context eng |
| 8 | MCP Server and Client | Core | Advanced | 25–40 | Tool-Using Agent |
| 9 | Instrumented LLM Application | Core | Advanced | 18–28 | RAG or agent app |
| 10 | 150-Case Evaluation Suite | Core | Advanced | 20–30 | Instrumented app |
| 11 | LLM CI Quality Gates | Core | Advanced | 15–22 | Evaluation suite |
| 12 | Multimodal Search System | Important | Advanced | 25–40 | Transformer fundamentals |
| — | **Production LLM Capstone** | Core | Advanced | 50–80 | Stages 1–11 |

**Capstone direction (recommended):** an infrastructure/security-operations assistant (SRE incident
investigation, security-alert triage, infra remediation) that fuses retrieval + tool use + MCP +
context management + observability + evaluation + regression testing + deployment.

---
# 📚 PART 8 — LOSSLESS APPENDICES (everything from the old `.md` files)

These appendices preserve the **full depth** of every source file so nothing is lost when you delete
them. Use them as reference while you work the week-by-week plan in Parts 1–5.

---

# Appendix A — DSA (the complete `dsa.md`, condensed but complete)

## A.1 Six-Month Phase Overview
| Month | Phase | Main Topics | ~Problems |
|---|---|---|---|
| 1 | Programming & DSA Foundations | Complexity, arrays, strings, hashing, sorting, binary search, recursion, linked lists, stacks, queues | 25–30 |
| 2 | Core Problem-Solving Patterns | Two pointers, sliding window, prefix sums, intervals, matrices, advanced binary search, monotonic stack | 35–45 |
| 3 | Trees, Heaps, Graph Foundations | Binary trees, BSTs, heaps, tries, graph representation, DFS, BFS, topological sort, union-find | 35–45 |
| 4 | Recursion, Backtracking, Greedy, DP | Subsets, permutations, backtracking, greedy, 1D DP, 2D DP, knapsack | 35–45 |
| 5 | Advanced Interview DSA | Advanced graphs, shortest paths, advanced DP, bit manipulation, range structures, design | 35–45 |
| 6 | Consolidation & Interview Readiness | Mixed sets, timed practice, LeetCode 75, weak-topic revision, mocks, contests | 40–50 |

**Six-month target:** ~200 carefully selected problems; ≥120 independently solved; ≥50 Mediums; all
major interview DSA topics covered; LeetCode 75 substantially/fully done; familiar Easy in 10–20 min;
familiar Medium patterns in 25–40 min; a personal revision sheet + mistake database; weekly timed practice.

## A.2 Recommended Resources (one main + one backup; never watch multiple tutorials before a problem)
- **Main:** NeetCode `[#72]` (patterns, selected problems, clean implementations), Striver A2Z `[#69]/[#70]`
  (structured progression, topic-wise lists), VisuAlgo `[#66]` (visualise sorting, LL, stacks/queues,
  trees, heaps, graph traversal).
- **Reference:** MIT 6.006 `[#75]/[#76]` (use selectively), USACO Guide `[#78]`, CP-Algorithms `[#77]`,
  CSES Problem Set `[#74]`, LeetCode 75 `[#73]`.

## A.3 Language Choice
Use Python for Month 1 (focus on problem-solving, not boilerplate). Know: `list`, `dict`, `set`,
`tuple`, `collections.deque`, `collections.Counter`, `defaultdict`, `heapq`. **Do not switch languages
in Month 1.**

---
## A.4 Month 1 — Day-by-Day (the exact problem list from `dsa.md`)
**Day 1 — Setup & Big-O.** Study O(1)/O(log n)/O(n)/O(n log n)/O(n²), time vs auxiliary space. Create a
DSA repo + LeetCode progress sheet. Implement: find max, sum, membership check.
**Day 2 — Array Traversal.** LC **1929** Concatenation of Array. Stretch: **1480** Running Sum.
**Day 3 — Searching & Running State.** LC **121** Best Time to Buy and Sell Stock. Alt: **485** Max Consecutive Ones.
**Day 4 — Strings.** LC **125** Valid Palindrome.
**Day 5 — Hash Sets.** LC **217** Contains Duplicate (write sort + hash-set, compare).
**Day 6 (Sat) — Hash Maps.** LC **1** Two Sum, **242** Valid Anagram. Stretch: **383** Ransom Note.
**Day 7 (Sun) — Week 1 Revision.** Re-solve two of {217, 1, 125, 242}. Optional: **169** Majority Element.
**Day 8 — Sorting Fundamentals.** Implement insertion sort. LC **905** Sort Array By Parity.
**Day 9 — Merge Sorted Sequences.** LC **88** Merge Sorted Array.
**Day 10 — Two-Pointer Foundation.** LC **344** Reverse String. Stretch: **977** Squares of a Sorted Array.
**Day 11 — Binary Search Concept.** LC **704** Binary Search (iterative + recursive).
**Day 12 — Binary-Search Boundaries.** LC **35** Search Insert Position.
**Day 13 (Sat) — Sorting Practice.** LC **349**, **350** Intersection of Two Arrays (hashing vs sort+2ptr).
Stretch: **75** Sort Colors.
**Day 14 (Sun) — Week 2 Revision.** From scratch: insertion sort, binary search, merge two arrays.
Timed: **27** Remove Element.
**Day 15 — Recursion Foundations.** Implement factorial, sum 1..n, array sum, recursive string reverse.
**Day 16 — Recursive Thinking.** LC **509** Fibonacci (naive + iterative, compare).
**Day 17 — Linked-List Fundamentals.** Implement singly LL (insert front/end, print, search). LC **876** Middle of LL.
**Day 18 — Reversing a Linked List.** LC **206** Reverse Linked List.
**Day 19 — Fast & Slow Pointers.** LC **141** Linked List Cycle.
**Day 20 (Sat) — LL Composition.** LC **21** Merge Two Sorted Lists, **203** Remove LL Elements. Stretch: **83**.
**Day 21 (Sun) — Week 3 Review.** Re-solve **206**, **876** from blank. Optional: **19** Remove Nth Node From End.
**Day 22 — Stack Fundamentals.** Implement stack with a list. LC **20** Valid Parentheses.
**Day 23 — Stack String Processing.** LC **1047** Remove All Adjacent Duplicates in String.
**Day 24 — Queue Fundamentals.** Implement queue with `deque`. LC **933** Number of Recent Calls.
**Day 25 — Stack & Queue Design.** LC **232** Implement Queue using Stacks.
**Day 26 — Data-Structure Selection.** LC **387** First Unique Character in a String.
**Day 27 (Sat) — Mixed Foundation Practice.** Timed: **268** Missing Number, **283** Move Zeroes. Stretch: **155** Min Stack.
**Day 28 (Sun) — Full Month Revision.** Re-solve one per category (array/string/hashing/sorting/binsearch/recursion/LL/stack/queue).
**Day 29 — Mixed Assessment.** Timed **49** Group Anagrams (35–45 min).
**Day 30 — Consolidation & Month-2 Prep.** Re-solve 3 hardest; create a weakness ranking; final deliverables checklist.

**Month-1 deliverables:** ≥24 core attempted, ≥18 independent, ≥6 delayed re-solves, binary search +
LL reversal from memory, stack+queue implemented, complexity recorded everywhere, dated mistake log,
Month-2 weak-topic list.

## A.5 Months 2–6 — Topic Lists (in encounter order)
- **Month 2 (35–40, mostly Easy + selected Medium):** two pointers in depth; fixed/variable sliding
  windows; prefix sums; difference arrays; Kadane's; matrix traversal; intervals; advanced binary
  search; binary search on answer; monotonic stacks; intro greedy.
- **Month 3 (35–45):** binary trees; DFS; BFS; tree recursion; BSTs; tree diameter/path problems; heaps;
  top-k; tries; graph representations; connected components; cycle detection; topological sorting; union-find.
- **Month 4 (35–45):** subsets; permutations; combination search; backtracking pruning; greedy-choice
  reasoning; 1D DP; 2D DP; grid DP; knapsack; LCS; LIS.
- **Month 5 (35–45):** Dijkstra; MSTs; advanced union-find; stronger graphs; bit manipulation; advanced
  heaps; tries/string search; advanced DP; segment trees; Fenwick trees; design structures.
- **Month 6 (40–50):** finish/revisit LeetCode 75; mixed-topic sets; timed Easy+Medium; weekly contests;
  weak-topic revision; implementation questions; complexity drills; verbal explanation practice; mock
  interviews; selected CSES problems.

---
# Appendix B — Maths, Quant & CS Fundamentals (topic → resource map)

Track A's full content. Resources are ranked basic → advanced in `resources.json` under
`Mathematics & Quantitative Finance` and `CS Fundamentals`; this is the topical index.

## B.1 Algebra & school maths
- `[#3]` Basic Maths & ADV Manipulations · `[#4]` Class 11 Maths · `[#5]` Class 12 Maths ·
  `[#12]` Think like a Mathematician · `[#15]`/`[#14]` Khan Academy (general + stats-probability).

## B.2 Calculus
- Intuition: `[#1]` Essence of calculus. Formal: `[#20]` MIT 18.01. (Differential equations: `[#19]`.)

## B.3 Linear algebra
- Intuition: `[#2]` Essence of linear algebra, `[#13]` Imaginary Numbers are Real, `[#127]` vectors intro.
- Formal: `[#21]` MIT 18.06, `[#23]` MIT OCW Linear Algebra.

## B.4 Discrete mathematics
- `[#17]` Discrete Math for Beginners · `[#25]` Discrete Math I (Rosen) · `[#26]` MIT 6.1200J ·
  `[#27]` MIT 18.200 · `[#24]` CS70 Discrete Math & Probability.

## B.5 Probability & statistics
- Intuition: `[#16]` Make Probability Click, `[#28]` Probabilities of probabilities, `[#18]` Stats for AI.
- Formal: `[#29]` Stat 110, `[#30]` Stanford CS109, `[#31]` MIT 6.041, `[#22]` MIT OCW Prob & Stats.
- Tooling: `[#34]` scipy.stats, `[#35]` statsmodels, `[#36]` statsmodels time-series, `[#37]` PyMC.
- Statistical learning (ML bridge): `[#32]` ISLP, `[#33]` Statistical Learning with Python.
- Channel: `[#42]` 3Blue1Brown.

## B.6 Quantitative finance & interview prep
- Quant math: `[#38]` MIT 18.642 (maths for finance).
- Interview prep: `[#39]` Brainstellar puzzles, `[#40]` Quant Questions, `[#41]` QuantGuide.
- Finance theory: `[#281]` Financial Theory (Geanakoplos), `[#280]` Price Momentum (Kent Daniel),
  `[#271]` How Citadel Makes Money (market making).
- Algo trading: `[#272]` Build a Trading Bot, `[#273]` 100 Days Algo Trading, `[#276]` Quant Strategies,
  `[#274]` Python Trading w/ ML, `[#275]` Algo Trading & Quant Strategies, `[#277]` RL Trading Bot,
  `[#278]` AI Trading Bot $3000, `[#279]` AI Stock Trading Bot (IB).
- Channels: `[#282]` Surbhi Verma (Quant), `[#298]` Roman Paolucci (QuantGuild).

## B.7 CS Fundamentals
- `[#79]` History of Computers · `[#80]` How computers work · `[#81]` Computational Thinking ·
  `[#82]` How compilers work · `[#83]` MIT 6.004 Computation Structures · `[#84]` Programming Paradigms ·
  `[#85]`/`[#86]` CS162 Operating Systems · `[#87]` MIT 6.172 Performance Engineering.

---
# Appendix C — Classical ML (full stage topics from `classical ml.md`)

**Main objective:** understand the math/stat foundations of ML; build important algorithms from
scratch; create leak-free pipelines; select appropriate models/metrics; compare linear, tree, kernel,
ensemble, and neural models; design reproducible experiments; deploy tested+monitored systems; apply
classical ML to infra-reliability and cybersecurity problems.

**Core curriculum ≈ 300–430 h; with foundations/electives/capstone ≈ 450–650 h.**

| Stage | Topic | Topics to learn | Core resources |
|---|---|---|---|
| 0 | Python & Math Foundations | Python syntax/functions; NumPy vectorisation; pandas; visualisation; linear algebra; gradients/derivatives; Git/GitHub; virtual envs; unit testing; reproducible structure | `[#50]` Python Tutorial, `[#58]` NumPy, `[#59]` pandas, `[#23]` MIT OCW LA, `[#88]` Google MLCC, `[#124]` D2L |
| 1 | Probability & Statistics | Sample spaces; conditional prob & Bayes; random variables; expectation/variance; discrete & continuous distributions; LLN & CLT; estimation, bias/variance; confidence intervals; hypothesis tests, p-values, power; correlation vs causation; base rates; multiple comparisons; bootstrap; Bayesian vs frequentist; multivariate Gaussian; mixtures; HMMs; Markov chains | `[#29]` Stat 110, `[#30]` CS109, `[#31]` MIT 6.041, `[#34]`/`[#35]` statsmodels |
| 2 | Linear Models | Simple/multiple linear regression; assumptions & diagnostics; logistic regression; decision boundaries; regularization intro; gradient descent vs closed form | `[#32]` ISLP Ch 1–4, `[#88]` MLCC, `[#33]` Stat Learning, `[#119]` CS229, sklearn `[#100]`/`[#103]` |
| 3 | Regularization | Ridge, Lasso, Elastic Net; bias-variance decomposition; coefficient paths; complexity control | sklearn `[#103]` linear models, `[#107]` feature selection |
| 4 | Feature Engineering | Missing data; encoders (one-hot, target); scaling; transformations; interactions; leakage; temporal/grouped features | sklearn `[#101]` preprocessing, `[#102]` pipelines |
| 5 | Model Selection | K-fold/stratified/group/time-series CV; nested CV; hyperparameter search (grid/random/Bayesian); selection bias; baselines; metric selection; statistical comparison; compute budgets | sklearn `[#108]` model selection, `[#112]` OpenML |
| 6 | Trees & Ensembles | Decision trees; bagging; random forests; boosting (GBM/XGBoost/LightGBM); feature importance; calibration | sklearn `[#105]` trees, `[#106]` ensembles |
| 7 | SVMs | Maximum margin; soft margins; kernels (linear/poly/RBF); hinge loss; SVM vs logistic | sklearn `[#104]` SVM |
| 8 | Clustering | k-means; hierarchical; DBSCAN; Gaussian mixtures; cluster validation; elbow/silhouette | sklearn `[#109]` clustering |
| 9 | Dimensionality Reduction | PCA; SVD; t-SNE; UMAP; explained variance; representation/compression | sklearn `[#110]` manifold, `[#111]` matrix factorization |
| 10 | Optimisation | Gradient descent variants; SGD; momentum; AdaGrad/RMSProp/Adam; learning-rate schedules; convex vs non-convex | `[#98]` PyTorch optim docs |
| 11 | Deep-Learning Foundations | Perceptrons; MLPs; activation functions; backprop; initialization; normalization; regularization (dropout/early stop); optimizers; overfitting; reproducible training | `[#94]` 3B1b, `[#285]` Karpathy, `[#283]` PyTorch, `[#123]` DL book, `[#124]` D2L |
| 12 | Electives (choose 2) | e.g. Computer Vision `[#117]/[#118]`; Time-series `[#36]`; Causality `[#115]` DoWhy; Fairness `[#114]` Fairlearn; Recsys; Bayesian `[#37]` PyMC | stage-specific |
| 13 | Production Capstone | End-to-end system: data → features → model → serve → monitor → test → document | combine all + `[#126]` 22 ML Projects |

**Stage-0 completion (pass when you can, without docs):** write Python functions & classes; vectorise
with NumPy; manipulate DataFrames with pandas; compute a gradient; explain a matrix transformation;
use Git + virtual envs + pytest; structure a reproducible project.

---
# Appendix D — Reinforcement Learning (the full 54-row curriculum from `reinforcement learning.md`)

Resources to do **in order** per row; each row has a project. Core texts: Sutton & Barto `[#197]`,
David Silver `[#198]`, CS234 `[#199]`, CS285 `[#207]`. Tools: Gymnasium `[#201]`, CleanRL `[#203]`,
Stable-Baselines3 `[#204]`, PettingZoo `[#205]`.

| # | Topic | Resources (in order) | Project |
|---|---|---|---|
| 1 | Python + NumPy + PyTorch | CS50P `[#45]` → NumPy `[#58]` → PyTorch basics `[#283]` → Karpathy Zero-to-Hero `[#285]` | Small NN from scratch + PyTorch |
| 2 | Linear Algebra | 3B1b Essence of LA `[#2]` → MIT 18.06 `[#21]` | Matrix ops, projections, PCA |
| 3 | Probability & Statistics | Khan `[#15]` → Harvard Stat 110 `[#29]` | Simulate distributions, Monte Carlo |
| 4 | Calculus & Optimization | 3B1b calculus `[#1]` → MIT 18.01 `[#20]` → CS231n optimization | Gradient descent, SGD, Adam |
| 5 | ML Fundamentals | Google MLCC `[#88]` → ISLP `[#32]` → Karpathy `[#285]` | Regression/classification models |
| 6 | RL Fundamentals | David Silver Lec 1 → DeepMind/UCL `[#198]` → Sutton Ch 1–3 `[#197]` | Tiny custom env, manual episodes |
| 7 | MDPs | Sutton Ch 3 → Silver MDP → CS234 `[#199]` | GridWorld MDP |
| 8 | Multi-Armed Bandits | Sutton Ch 2 → Silver bandit | ε-greedy vs UCB vs Thompson |
| 9 | Dynamic Programming | Sutton Ch 4 → Silver DP → CS234 | GridWorld: policy eval/iter, value iter |
| 10 | Monte Carlo RL | Sutton Ch 5 → Silver MC | MC prediction + control (Blackjack/FrozenLake) |
| 11 | Temporal-Difference | Sutton Ch 6 → Silver TD | TD(0) vs Monte Carlo |
| 12 | SARSA | Sutton Ch 6 → CS234 control | SARSA on CliffWalking |
| 13 | Q-Learning | Sutton Ch 6 → Silver model-free control | Q-learning on FrozenLake/CliffWalking |
| 14 | Eligibility Traces | Sutton Ch 12 → Silver TD | TD(λ) implementation |
| 15 | Function Approximation | Sutton Ch 9 → DeepMind/UCL → CS285 `[#207]` | Linear value-function approx |
| 16 | Deep RL Foundations | HF Deep RL `[#195]` → CS285 intro | Neural-network value function |
| 17 | DQN | DQN paper `[#220]` → HF DQN → Spinning Up `[#202]` / CleanRL `[#203]` | DQN on CartPole/LunarLander |
| 18 | Advanced DQN | Double DQN `[#224]` → Dueling `[#226]` → PER `[#225]` | Double/Dueling DQN, compare |
| 19 | Policy Gradients | Silver PG → HF PG → CS285 | REINFORCE from scratch |
| 20 | Actor-Critic | Silver A-C → HF A-C → CS285 | A2C on CartPole |
| 21 | Advantage & GAE | GAE paper `[#222]` → CS285 PG lectures → CleanRL | Compare MC vs TD advantage vs GAE |
| 22 | TRPO | TRPO paper `[#221]` → CS285 → Spinning Up | Simplified TRPO |
| 23 | PPO | PPO paper `[#230]` → HF PPO → Spinning Up → CleanRL | PPO on CartPole/LunarLander |
| 24 | Continuous Control | DDPG `[#223]` → TD3 `[#236]` → SAC `[#240]` → Spinning Up | DDPG vs TD3 vs SAC on MuJoCo |
| 25 | Maximum-Entropy RL | SAC `[#240]` → Spinning Up SAC → CS285 | SAC + entropy coefficient |
| 26 | Exploration | Sutton exploration → Lil'Log exploration → RND `[#239]` | ε-greedy vs entropy vs intrinsic reward |
| 27 | Reward Design | Sutton reward → Lil'Log Reward Hacking `[#206]` → spec-gaming examples | Design an exploitable reward |
| 28 | Model-Based RL | CS285 model-based → Dyna → World Models `[#237]`/Dreamer `[#243]` | Learn dynamics + plan |
| 29 | Optimal Control | CS285 optimal control → MIT Underactuated `[#210]` | LQR + MPC controller |
| 30 | Imitation Learning | CS285 IL → Behavior Cloning → DAgger → GAIL `[#227]` | Teach agent from demos |
| 31 | Offline RL | CS285 offline → D4RL `[#270]` → CQL `[#247]` → IQL `[#255]` | Offline CartPole/control (CQL/IQL) |
| 32 | Decision Transformers | Decision Transformer `[#252]` → CS285 sequence-model | Train a tiny trajectory Transformer |
| 33 | Distributional RL | C51 `[#231]` → QR-DQN `[#233]` → CleanRL | Implement C51/QR-DQN |
| 34 | Advanced Value-Based RL | Rainbow `[#232]` → component papers → CleanRL | Simplified Rainbow |
| 35 | Multi-Agent RL | HF MARL → CS285 MARL → PettingZoo `[#205]` | 2-agent competitive game |
| 36 | Self-Play | AlphaGo/AlphaZero `[#234]` → CS285 MARL | Self-play Tic-Tac-Toe/Connect Four |
| 37 | Hierarchical RL | Silver hierarchical → Options framework → DIAYN `[#235]` | Hierarchical navigation agent |
| 38 | Meta-RL | CS285 meta-learning → MAML `[#228]` → Meta-RL papers | Train across task distributions |
| 39 | POMDPs & Memory | CS234 POMDP → recurrent-policy papers → CS285 | Partially-observable GridWorld + LSTM |
| 40 | World Models / Representation | World Models `[#237]` → Dreamer `[#243]` → MuZero `[#242]` → CS285 | Latent-world-model env |
| 41 | RL Theory | Sutton & Barto → Szepesvári (Algorithms for RL) → CS285 theory | Prove Bellman/convergence + reproduce |
| 42 | RL Systems | Gymnasium `[#201]` → CleanRL `[#203]` → Stable-Baselines3 `[#204]` → JAX/RLax | Vectorized envs + parallel rollouts |
| 43 | RL Experimentation | CleanRL → reproducibility literature → benchmark papers | 5–10 seeds, CIs, ablations |
| 44 | RL Environments | Gymnasium custom-env → PettingZoo if multi-agent → benchmark design | Fully documented custom env |
| 45 | RLHF | InstructGPT `[#256]` → preference modeling → PPO for LLMs | Tiny LM RLHF pipeline |
| 46 | Preference Learning | Bradley-Terry → DPO `[#261]` → IPO/KTO | Preference model + DPO baseline |
| 47 | RLVR | RLVR papers → verifier-based reasoning → DeepSeek/open research | Small LM task + programmatic verifier |
| 48 | GRPO | DeepSeekMath → GRPO implementations `[#290]` → compare PPO | Train a small model with GRPO |
| 49 | Modern LLM RL | PPO → GRPO → RLOO → REINFORCE variants → DAPO `[#268]`/back-to-basics `[#267]` | Compare LLM-RL algorithms |
| 50 | Reward Hacking in LLMs | Lil'Log Reward Hacking → spec gaming → LLM reward-hacking papers | Adversarial reward/verifier exploits |
| 51 | Agent RL | POMDPs → tool-use agents → RL for agents → verifier envs | Multi-step tool-use task agent |
| 52 | Safe RL | Constrained MDPs → Safe RL literature → CVaR/risk-sensitive | Agent under safety constraints |
| 53 | RL Research Methodology | Read benchmark papers → reproduce → ablate → hypothesize | Full paper reproduction |
| 54 | Research-Level RL | CS285 `[#207]` → latest arXiv → reproduce → modify → propose | Novel RL algorithm/env paper |

---
# Appendix E — LLM Systems Engineering (full stage topics from `LLM Systems Engineering.md`)

**Objective (all must hold at the end):** explain how transformer LMs work; select appropriate models;
design reliable prompts & context pipelines; build semantic-search and RAG systems; build tool-using
agents and MCP integrations; trace/debug complete LLM apps; design evaluation datasets & metrics;
prevent regressions with automated testing; build basic multimodal systems; present reproducible
LLM-engineering projects. **Full curriculum ≈ 293–475 h; integrated project path ≈ 260–380 h; at 10 h/week ≈ 6–9 months.**

| Stage | Topics | Core resources | Project output |
|---|---|---|---|
| 1 How LLMs Work | Tokenization (char/word/subword/byte); embeddings; positional info; Q/K/V; scaled dot-product attention; multi-head; causal masking; FFN; residual; normalization; pretraining objectives; train vs inference; autoregressive decoding; temperature/top-k/nucleus; scaling laws; compute-optimal training | `[#131]` HF LLM Course, `[#129]` How Transformers Work, `[#229]` Attention, `[#151]` CS336, `[#286]` build-nanogpt, `[#246]` GPT-3, `[#244]`/`[#257]` scaling laws | Tiny Transformer Lab (char tokenizer, BPE study, attention, causal mask, multi-head, train on Tiny Shakespeare, loss plots, greedy/temp/top-k/nucleus decoding, 3-way comparison, 1 ablation) |
| 2 Prompt Engineering | Success criteria; representative test sets; instruction hierarchy; zero/few/role-shot; structured prompts; output schemas; decomposition; model params; injection awareness; adversarial; error taxonomies; versioning | `[#141]`/`[#142]` Anthropic, `[#139]` Gemini, `[#138]` DeepLearning.AI, `[#174]` Promptfoo | Prompt Reliability Lab (100 examples: clear/ambiguous/missing/conflicting/irrelevant/adversarial/unexpected/long; 6 prompt experiments; schema-validity, field P/R/F1, latency, tokens, cost) |
| 3 Context Engineering | Context budgets; system instructions; history; retrieved docs; tool defs/results; working/episodic/durable memory; ordering; isolation; compaction; summarization; salience; superseded info; long-context limits; trust boundaries | `[#294]` Anthropic context eng, `[#262]` Lost in the Middle, `[#265]` MemGPT | Context Manager (4 strategies: full transcript, rolling window, recursive summary, structured memory; 30-turn conversations; fact-recall, contradiction rate, tokens, latency, cost) |
| 4 Model Types & Selection | Encoder/decoder/enc-dec; base/instruct/preference-tuned; embedding models; rerankers; MoE; state-space; vision-language; speech; diffusion; quantization; LoRA/QLoRA; open weights vs open-source; active params; context length; inference constraints | `[#156]` Transformers docs, `[#238]` BERT, `[#241]` T5, `[#249]` Switch, `[#266]` Mamba, `[#253]` LoRA, `[#260]` QLoRA, `[#136]` diffusion | Model Selection Benchmark (1 encoder + 1 decoder + 1 enc-dec across classification/generation/summarization; quality, memory, latency, format, adaptability, deployment; model-selection memo) |
| 5 Embeddings & Vector Search | Dense/sparse; semantic similarity; cosine/dot; normalization; exact & ANN; chunking; metadata filtering; hybrid; reranking; bi/cross-encoders; Recall@k, MRR, NDCG | `[#166]` SBert, `[#165]` FAISS, `[#162]` Qdrant, `[#163]` Pinecone | Semantic Search Engine (keyword vs dense vs hybrid vs dense+rerank; 2 embedding models, 2 chunking strategies; Recall@k, MRR, NDCG, latency, index size) |
| 6 RAG | Pipelines; ingestion; parsing; chunking; indexing; query transformation; dense/hybrid retrieval; reranking; context construction; grounded generation; citations; abstention; unanswerable; conflicting/stale sources; retrieval & generation eval | `[#245]` RAG paper, `[#161]` LlamaIndex, `[#264]`/`[#177]` Ragas, `[#164]` pgvector | Evaluated RAG Assistant (full pipeline; ablations on chunk size/overlap/embedding/top-k/hybrid weight/rerank/ordering/model; eval categories: answerable/unanswerable/conflicting/stale/citation/injection/long-context) |
| 7 AI Agents | Workflows vs agents; tool calling; ReAct loops; planning; state machines; tool schemas; validation; retries; timeouts; idempotency; human approval; memory; delegation; multi-agent; termination; sandboxing; permissions | `[#293]` Anthropic agents, `[#291]` HF Agents, `[#258]` ReAct, `[#259]` Toolformer, `[#170]` smolagents, `[#169]` LangGraph, `[#295]` PydanticAI | Tool-Using Agent (typed tools: doc search, file reader, DB query, calculator, test runner, sandboxed exec; safety: validation, untrusted output, approval for destructive, max steps, timeouts, dup detection, logging; compare vs single call + deterministic workflow) |
| 8 MCP & Production | MCP hosts/clients/servers; resources/tools/prompts; capability negotiation; transport; lifecycle; auth; authorization; secrets; service boundaries; queues; backpressure; retries; caching; rate limits; model serving; GPU autoscaling; canary; failure isolation | `[#171]` HF MCP, `[#172]` MCP spec, `[#212]` FastAPI, `[#296]`/`[#297]` Pydantic, `[#211]` Docker, `[#218]` Redis, `[#160]` vLLM | MCP Server + Client (server: doc search, project data, safe utility; client: discover, call, read, validate, handle failure, trace; production: auth, secrets, limits, timeouts, retries, structured errors, health, Docker, integration tests) |
| 9 LLM Observability | Distributed tracing; traces/spans; metrics; logs; context propagation; OpenTelemetry; OpenInference; prompt/model versions; retrieval events; tool calls; token usage; cost; latency; error rates; feedback; redaction; drift | `[#182]` OTel, `[#184]` gen-ai conventions, `[#183]` OpenInference, `[#186]` openllmetry, `[#185]` Phoenix, `[#191]` Langfuse, `[#188]` LangSmith, `[#189]`/`[#190]` MLflow, `[#178]` Evidently | Instrumented Application (spans for preprocess/embed/retrieve/rerank/context/generate/parse/tools/validate; dashboard: rate, errors, p50/p95, tokens, cost, empty-retrieval, tool-failure, abstention, eval score; seed 7 failures, diagnose via traces) |
| 10 Evaluation Frameworks | Eval datasets; deterministic assertions; exact-match; schema validation; retrieval/semantic metrics; faithfulness; factuality; task completion; safety; human eval; model-based judges; calibration; inter-rater agreement; CIs; contamination; scenario reporting | `[#175]` DeepEval, `[#174]` Promptfoo, `[#181]` lm-eval-harness, `[#179]` HELM, `[#254]` TruthfulQA, `[#180]` Inspect | 150-Case Evaluation Suite (all 12 categories; eval order: deterministic → programmatic → retrieval → model-grading → human review; human labels, agreement, FP/FN inspection, scenario reporting, CIs) |
| 11 Regression Testing | Golden datasets; smoke/full suites; baseline comparison; thresholds; tolerances; flaky tests; model/prompt/dependency pinning; release gates; scheduled evals; canary cases; reproducible artifacts | `[#174]` Promptfoo, `[#175]` DeepEval, `[#61]` pytest, `[#214]`/`[#215]` GitHub Actions, `[#216]`/`[#217]` DVC, `[#213]` Git LFS | LLM CI Quality Gates (version prompts/model/retrieval/dataset/thresholds; per-commit: unit+schema+security+smoke; scheduled: full eval, multi-model, retrieval, judge calibration, perf; reject ≥4 deliberate regressions, accept 1 improvement) |
| 12 Multimodal AI | Image representations; ViTs; contrastive learning; CLIP alignment; modality encoders; projection spaces; cross-attention; VLMs; audio; speech; diffusion; multimodal retrieval; VQA; eval; dataset bias | `[#135]` HF CV course, `[#250]` CLIP, `[#248]` ViT, `[#136]` diffusion, `[#134]` audio, `[#251]` OpenCLIP | Multimodal Search System (text→image, image→image, image→doc, captioning/VQA; 50 labelled queries; Recall@k, MRR, latency, failure-by-scenario; document bias/OCR/spatial/fine-grained/near-dup failures) |

**LLM completion criteria (EVERY box before done):** implemented attention without a prebuilt layer;
trained a tiny transformer; built a prompt benchmark; built+evaluated a context-management system;
compared multiple model families; built keyword/dense/hybrid search; built an evaluated RAG app; built a
tool-using agent; built an MCP server+client; added distributed tracing; created a 150-case eval suite;
added automated regression gates; built a multimodal retrieval system; completed one production capstone;
published ≥3 polished repos; wrote architecture diagrams + experiment reports; documented limitations.

---
# Appendix F — LLM topic → resource map (from `llm engineering resources.md`)

Quick lookup: for each LLM sub-topic, which `resources.json` entries to open.

- **How LLMs Work:** `[#130]`/`[#269]` intro-to-LLMs, `[#131]` HF LLM Course, `[#229]` Attention, `[#151]` CS336
- **Tokenization:** `[#155]` HF Tokenizers docs
- **Transformer Architecture:** `[#128]` Illustrated Transformer, `[#229]` Attention, `[#129]` How Transformers Work
- **Training LMs:** `[#151]` CS336, `[#286]` build-nanogpt, `[#246]` GPT-3, `[#147]` train-your-own LLM, `[#284]` LLM from scratch
- **Scaling Laws:** `[#244]` Kaplan, `[#257]` Chinchilla
- **Model families / architectures:** `[#156]` Transformers docs, `[#238]` BERT, `[#241]` T5, `[#249]` Switch (MoE), `[#266]` Mamba (SSM), `[#148]` transformer evolution, `[#154]` CME295
- **Prompt Engineering:** `[#141]`/`[#142]` Anthropic, `[#139]` Gemini, `[#138]` DeepLearning.AI, `[#140]` Prompt Engineering Guide
- **Prompt Testing:** `[#174]` Promptfoo, `[#175]` DeepEval
- **Structured Outputs:** `[#296]`/`[#297]` Pydantic, `[#60]` JSON Schema
- **Context Engineering:** `[#294]` Anthropic context eng, `[#141]` Anthropic prompting, `[#291]` HF Agents Course
- **Long-Context Behaviour:** `[#262]` Lost in the Middle, `[#265]` MemGPT
- **Fine-Tuning:** `[#131]` HF LLM Course, `[#156]` Transformers fine-tuning, `[#144]`/`[#288]` fine-tuning courses, `[#289]` LLMs from Scratch
- **Parameter-Efficient Fine-Tuning:** `[#253]` LoRA, `[#260]` QLoRA, `[#145]` PEFT
- **Quantization:** `[#146]` BitsAndBytes, `[#158]` llama.cpp/GGUF
- **Embeddings:** `[#166]` Sentence Transformers, `[#163]` Pinecone Learn, `[#167]` HF embedding models
- **Vector Search:** `[#165]` FAISS, `[#162]` Qdrant, `[#164]` pgvector
- **Sparse/Hybrid Search:** `[#162]` Qdrant hybrid, `[#219]` Elasticsearch
- **Reranking:** `[#166]` SBert cross-encoders
- **RAG:** `[#245]` RAG paper, `[#161]` LlamaIndex, `[#162]` Qdrant tutorials
- **Retrieval/RAG Evaluation:** `[#168]` BEIR, `[#264]`/`[#177]` Ragas, `[#166]` SBert evaluation
- **AI Agents:** `[#293]` Anthropic agents, `[#291]` HF Agents Course, `[#258]` ReAct
- **Tool Use:** `[#259]` Toolformer, `[#291]` HF Agents Course
- **Agent Orchestration:** build plain Python state machines first, then `[#169]` LangGraph, `[#295]` PydanticAI, `[#170]` smolagents
- **Agent Memory:** `[#294]` context eng, `[#265]` MemGPT
- **Model Context Protocol:** `[#172]` MCP spec, `[#171]` HF MCP Course
- **LLM APIs:** `[#212]` FastAPI, `[#296]`/`[#297]` Pydantic
- **Local Model Inference:** `[#158]` llama.cpp, `[#157]` Ollama, `[#160]` vLLM
- **Model Serving:** `[#160]` vLLM, `[#159]` Text Generation Inference, `[#211]` Docker
- **Caching and State:** `[#218]` Redis
- **LLM Observability:** `[#182]` OTel gen-ai, `[#185]` Phoenix, `[#191]` Langfuse, `[#189]` MLflow Tracing
- **App-Level LLM Evaluation:** `[#175]` DeepEval, `[#174]` Promptfoo
- **Foundation-Model Evaluation:** `[#181]` lm-evaluation-harness, `[#179]` HELM
- **Truthfulness Evaluation:** `[#254]` TruthfulQA
- **Agent Evaluation:** `[#180]` Inspect, `[#175]` DeepEval agent eval, custom trajectory test suites
- **LLM Regression Testing:** `[#174]` Promptfoo, `[#175]` DeepEval, `[#61]` pytest, `[#214]`/`[#215]` GitHub Actions
- **Experiment Tracking:** `[#189]`/`[#190]` MLflow, `[#191]` Langfuse, `[#185]` Phoenix
- **Dataset/Eval Versioning:** `[#216]`/`[#217]` DVC, `[#213]` Git LFS
- **Multimodal AI:** `[#135]` HF CV Course, `[#250]` CLIP, `[#248]` ViT
- **Image Generation / Diffusion:** `[#136]` HF Diffusion Course
- **Audio & Speech:** `[#134]` HF Audio Course
- **Multimodal Embeddings:** `[#250]` CLIP, `[#251]` OpenCLIP

---
# Appendix Z — Full Resource Key (all 298 resources in `resources.json`)

Look up any `[#N]` tag here. `Level` is the beginner→advanced rank *within its group* from
`resources.json`. For full summaries/URLs/durations, open `resources.json` (search `source_index`).

| # | Title | Group | Level | Type |
|---|---|---|---|---|
| 1 | Essence of calculus | Mathematics & Quantitative Finance | Beginner | playlist |
| 2 | Essence of linear algebra | Mathematics & Quantitative Finance | Beginner | playlist |
| 3 | JEE 2025: Basic Maths & ADV Manipulations / JEE Advanced & Mains / JEE… | Mathematics & Quantitative Finance | Beginner | video |
| 4 | Class 11th Maths Super One Shot 2025-26 | Mathematics & Quantitative Finance | Beginner | playlist |
| 5 | Class 12th Maths Super One Shot Complete Syllabus | Mathematics & Quantitative Finance | Beginner | playlist |
| 6 | JEE 2024: Number Theory & SETS / JEE Advanced & Mains / JEE 2024 Unbea… | Mathematics & Quantitative Finance | Beginner | video |
| 7 | JEE Mains 2024: Number Theory / 2002-2023 Each & Every PYQ Solved with… | Mathematics & Quantitative Finance | Beginner | video |
| 8 | JEE 2024: Permutations & Combinations / Binomial Theorem / JEE Adv & M… | Mathematics & Quantitative Finance | Beginner | video |
| 9 | JEE Mains 2024: Permutations & Combinations / 2002-2023 Each & Every P… | Mathematics & Quantitative Finance | Beginner | video |
| 10 | JEE Mains 2024: Binomial Theorem / 2002-2023 Each & Every PYQ Solved w… | Mathematics & Quantitative Finance | Beginner | video |
| 11 | IDEA SERIES for JEE Advanced , Olympiads ,ISI, CMI, Mains | Mathematics & Quantitative Finance | Beginner | playlist |
| 12 | Think like a Mathematician! Series | Mathematics & Quantitative Finance | Beginner | playlist |
| 13 | Imaginary Numbers are Real | Mathematics & Quantitative Finance | Beginner | playlist |
| 14 | Client Challenge | Mathematics & Quantitative Finance | Beginner | website |
| 15 | Client Challenge | Mathematics & Quantitative Finance | Beginner | website |
| 16 | Give Me 1 Hour, I'll Make Probability Click Forever | Mathematics & Quantitative Finance | Beginner | video |
| 17 | Discrete Mathematics Course for Beginners | Mathematics & Quantitative Finance | Beginner | video |
| 18 | All the Statistics You Need for AI Engineering - In 4 Hrs! | Mathematics & Quantitative Finance | Intermediate | video |
| 19 | Differential equations | Mathematics & Quantitative Finance | Intermediate | playlist |
| 20 | MIT 18.01 Single Variable Calculus, Fall 2006 | Mathematics & Quantitative Finance | Intermediate | playlist |
| 21 | MIT 18.06 Linear Algebra, Spring 2005 | Mathematics & Quantitative Finance | Intermediate | playlist |
| 22 | Introduction to Probability and Statistics / Mathematics / MIT OpenCou… | Mathematics & Quantitative Finance | Intermediate | website |
| 23 | Linear Algebra / Mathematics / MIT OpenCourseWare | Mathematics & Quantitative Finance | Intermediate | website |
| 24 | CS70 Discrete Mathematics and Probability Theory | Mathematics & Quantitative Finance | Intermediate | playlist |
| 25 | Discrete Math I (Entire Course) | Mathematics & Quantitative Finance | Intermediate | playlist |
| 26 | MIT 6.1200J Mathematics for Computer Science, Spring 2024 | Mathematics & Quantitative Finance | Intermediate | playlist |
| 27 | MIT 18.200 Principles of Discrete Applied Mathematics, Spring 2024 | Mathematics & Quantitative Finance | Intermediate | playlist |
| 28 | Probabilities of probabilities | Mathematics & Quantitative Finance | Intermediate | playlist |
| 29 | Statistics 110: Probability | Mathematics & Quantitative Finance | Intermediate | playlist |
| 30 | Stanford CS109 Introduction to Probability for Computer Scientists I 2… | Mathematics & Quantitative Finance | Intermediate | playlist |
| 31 | Probability and statistics-MIT | Mathematics & Quantitative Finance | Intermediate | playlist |
| 32 | An Introduction to Statistical Learning | Classical Machine Learning | Beginner | website |
| 33 | Statistical Learning with Python | Classical Machine Learning | Beginner | playlist |
| 34 | Statistical functions (scipy.stats) — SciPy v1.18.0 Manual | Mathematics & Quantitative Finance | Intermediate | website |
| 35 | statsmodels.org | Mathematics & Quantitative Finance | Intermediate | website |
| 36 | Time Series analysis tsa — statsmodels 0.15.0 | Mathematics & Quantitative Finance | Intermediate | website |
| 37 | docs.pymc.io | Mathematics & Quantitative Finance | Intermediate | website |
| 38 | MIT 18.642 Topics in Mathematics with Applications in Finance, Fall 20… | Mathematics & Quantitative Finance | Advanced | playlist |
| 39 | Brainstellar Puzzles from Quant Interviews | Mathematics & Quantitative Finance | Advanced | website |
| 40 | Quant Questions - The Leading Quant Question Platform | Mathematics & Quantitative Finance | Advanced | website |
| 41 | QuantGuide - Interview Prep Platform for Quants | Mathematics & Quantitative Finance | Advanced | website |
| 42 | 3Blue1Brown | Mathematics & Quantitative Finance | Advanced | channel |
| 43 | Sigma Web Development Course - Web Development Tutorials in Hindi 🗿 | Programming | Intermediate | playlist |
| 44 | Python Tutorial For Beginners in Hindi / Complete Python Course 🔥 | Programming | Beginner | video |
| 45 | CS50's Introduction to Programming with Python (CS50P) 2022 | Programming | Beginner | playlist |
| 46 | CS50x Lectures | Programming | Beginner | playlist |
| 47 | Harvard CS50: Introduction to Computer Science Problem Set (Solutions)… | Programming | Beginner | playlist |
| 48 | Python for Beginners (Full Course) / #100DaysOfCode Programming Tutori… | Programming | Beginner | playlist |
| 49 | MIT 6.100L Introduction to CS and Programming using Python, Fall 2022 | Programming | Beginner | playlist |
| 50 | The Python Tutorial — Python 3.14.7 documentation | Programming | Beginner | website |
| 51 | Java Tutorials For Beginners In Hindi | Programming | Intermediate | playlist |
| 52 | Stanford - Java course | Programming | Intermediate | playlist |
| 53 | C++ Programming Course - Beginner to Advanced | Programming | Intermediate | video |
| 54 | Learn C++ – Skill up with our free tutorials | Programming | Intermediate | website |
| 55 | The C++ Programming Language | Programming | Intermediate | playlist |
| 56 | cplusplus.com | Programming | Intermediate | website |
| 57 | Intermediate Python Programming Course | Programming | Beginner | video |
| 58 | NumPy: the absolute basics for beginners — NumPy v2.5 Manual | Programming | Advanced | website |
| 59 | Getting started tutorials — pandas 3.0.6 documentation | Programming | Advanced | website |
| 60 | Creating your first schema | Programming | Advanced | website |
| 61 | pytest documentation | Programming | Advanced | website |
| 62 | Syllabus / Introduction to Computational Thinking and Data Science / E… | Programming | Advanced | website |
| 63 | MIT 6.0002 Introduction to Computational Thinking and Data Science, Fa… | Programming | Advanced | playlist |
| 64 | JAX: High performance array computing — JAX documentation | Programming | Advanced | website |
| 65 | Python for AI & Agents - Full Beginner Course | Programming | Intermediate | playlist |
| 66 | visualising data structures and algorithms through animation - VisuAlg… | Data Structures & Algorithms | Beginner | website |
| 67 | Data Structures and Algorithms Course in Hindi | Data Structures & Algorithms | Beginner | playlist |
| 68 | Data Structures Easy to Advanced Course - Full Tutorial from a Google … | Data Structures & Algorithms | Beginner | video |
| 69 | Striver's A2Z DSA Sheet & Course / takeUforward | Data Structures & Algorithms | Beginner | website |
| 70 | Strivers A2Z-DSA Course / DSA Playlist / Placements | Data Structures & Algorithms | Beginner | playlist |
| 71 | Data Structures and Algorithms Mega Course – Master Technical Interv… | Data Structures & Algorithms | Intermediate | video |
| 72 | NeetCode / Coding Interview Prep, Courses, Versus Mode | Data Structures & Algorithms | Intermediate | website |
| 73 | (link) https://leetcode.com/studyplan/leetcode-75/ | Data Structures & Algorithms | Intermediate | link |
| 74 | CSES - CSES Problem Set - Tasks | Data Structures & Algorithms | Intermediate | website |
| 75 | Introduction to Algorithms / Electrical Engineering and Computer Scien… | Data Structures & Algorithms | Advanced | website |
| 76 | MIT 6.006 Introduction to Algorithms, Spring 2020 | Data Structures & Algorithms | Advanced | playlist |
| 77 | Main Page - Algorithms for Competitive Programming | Data Structures & Algorithms | Advanced | website |
| 78 | USACO Guide | Data Structures & Algorithms | Advanced | website |
| 79 | The AMAZING History of Computers, Programming, and Coding | CS Fundamentals | Beginner | video |
| 80 | How do computers work? (from scratch, no prior knowledge needed) | CS Fundamentals | Beginner | video |
| 81 | Programming Thinking | CS Fundamentals | Beginner | video |
| 82 | How do compilers work? Let’s invent a programming language to find o… | CS Fundamentals | Intermediate | video |
| 83 | MIT 6.004 Computation Structures, Spring 2017 | CS Fundamentals | Intermediate | playlist |
| 84 | Lecture Collection / Programming Paradigms | CS Fundamentals | Intermediate | playlist |
| 85 | CS 162 — Fall 2026 | CS Fundamentals | Advanced | website |
| 86 | CS 162: Operating Systems and Systems Programming - Berkeley | CS Fundamentals | Advanced | playlist |
| 87 | MIT 6.172 Performance Engineering of Software Systems, Fall 2018 | CS Fundamentals | Advanced | playlist |
| 88 | Machine Learning Crash Course | Classical Machine Learning | Beginner | playlist |
| 89 | Machine Learning / Google for Developers | Classical Machine Learning | Beginner | website |
| 90 | AI Engineering Full Course (PyTorch) 2026 UPDATED / Beginner to Advanc… | Classical Machine Learning | Beginner | video |
| 91 | The Most Important Algorithm in Machine Learning | Deep Learning | Beginner | video |
| 92 | PyTorch for Deep Learning & Machine Learning – Full Course | Deep Learning | Beginner | video |
| 93 | PyTorch in 1 Hour | Deep Learning | Beginner | video |
| 94 | Neural networks | Deep Learning | Beginner | playlist |
| 95 | Deep learning in English | Deep Learning | Beginner | playlist |
| 96 | Practical Deep Learning using PyTorch / CampusX | Deep Learning | Intermediate | playlist |
| 97 | PyTorch documentation — PyTorch 2.14 documentation | Deep Learning | Beginner | website |
| 98 | Redirecting… | Deep Learning | Beginner | website |
| 99 | scikit-learn: machine learning in Python — scikit-learn 0.16.1 docum… | Classical Machine Learning | Intermediate | website |
| 100 | 1. Supervised learning — scikit-learn 1.9.1 documentation | Classical Machine Learning | Intermediate | website |
| 101 | 8.3. Preprocessing data — scikit-learn 1.9.1 documentation | Classical Machine Learning | Intermediate | website |
| 102 | 8.1. Pipelines and composite estimators — scikit-learn 1.9.1 documen… | Classical Machine Learning | Intermediate | website |
| 103 | 1.1. Linear Models — scikit-learn 1.9.1 documentation | Classical Machine Learning | Intermediate | website |
| 104 | 1.4. Support Vector Machines — scikit-learn 1.9.1 documentation | Classical Machine Learning | Intermediate | website |
| 105 | 1.10. Decision Trees — scikit-learn 1.9.1 documentation | Classical Machine Learning | Intermediate | website |
| 106 | 1.11. Ensembles: Gradient boosting, random forests, bagging, voting, s… | Classical Machine Learning | Intermediate | website |
| 107 | 1.13. Feature selection — scikit-learn 1.9.1 documentation | Classical Machine Learning | Advanced | website |
| 108 | 3. Model selection and evaluation — scikit-learn 1.9.1 documentation | Classical Machine Learning | Advanced | website |
| 109 | 2.3. Clustering — scikit-learn 1.9.1 documentation | Classical Machine Learning | Advanced | website |
| 110 | 2.2. Manifold learning — scikit-learn 1.9.1 documentation | Classical Machine Learning | Advanced | website |
| 111 | 2.5. Decomposing signals in components (matrix factorization problems)… | Classical Machine Learning | Advanced | website |
| 112 | OpenML | Classical Machine Learning | Beginner | website |
| 113 | UCI Machine Learning Repository | Classical Machine Learning | Beginner | website |
| 114 | Fairlearn | Classical Machine Learning | Advanced | website |
| 115 | GitHub - py-why/dowhy: DoWhy is a Python library for causal inference … | Classical Machine Learning | Advanced | website |
| 116 | Stanford CS230: Deep Learning I Autumn 2025 | Deep Learning | Intermediate | playlist |
| 117 | Stanford CS231N Deep Learning for Computer Vision I 2025 | Deep Learning | Advanced | playlist |
| 118 | Stanford University CS231n: Deep Learning for Computer Vision | Deep Learning | Advanced | website |
| 119 | Stanford CS229: Machine Learning led by Andrew Ng / Autumn 2018 | Classical Machine Learning | Beginner | playlist |
| 120 | MIT 15.773 Hands-On Deep Learning Spring 2024 | Deep Learning | Intermediate | playlist |
| 121 | MIT 6.7960 Deep Learning, Fall 2024 | Deep Learning | Intermediate | playlist |
| 122 | DeepMind x UCL / Deep Learning Lecture Series 2021 | Deep Learning | Intermediate | playlist |
| 123 | Deep Learning | Deep Learning | Intermediate | website |
| 124 | Dive into Deep Learning — Dive into Deep Learning 1.0.3 documentatio… | Deep Learning | Intermediate | website |
| 125 | Hands-On Evolution of Deep Learning – Geoffrey Hinton’s AI Legacy | Deep Learning | Intermediate | video |
| 126 | 22 Machine Learning Projects That Will Make You A God At Data Science | Classical Machine Learning | Advanced | video |
| 127 | Getting Started With... by Ekaterina Kochmar / PDF / Euclidean Vector … | Mathematics & Quantitative Finance | Beginner | website |
| 128 | The Illustrated Transformer – Jay Alammar – Visualizing machine le… | LLM Systems & AI Agents | Beginner | website |
| 129 | How do Transformers work? · Hugging Face | LLM Systems & AI Agents | Beginner | website |
| 130 | Introduction to Large Language Models / Machine Learning / Google for … | LLM Systems & AI Agents | Beginner | website |
| 131 | Introduction · Hugging Face | LLM Systems & AI Agents | Beginner | website |
| 132 | Introduction · Hugging Face | LLM Systems & AI Agents | Beginner | website |
| 133 | Introduction · Hugging Face | LLM Systems & AI Agents | Beginner | website |
| 134 | Welcome to the Hugging Face Audio course! · Hugging Face | Deep Learning | Advanced | website |
| 135 | Welcome to the Community Computer Vision Course · Hugging Face | Deep Learning | Advanced | website |
| 136 | Hugging Face Diffusion Models Course · Hugging Face | Deep Learning | Advanced | website |
| 137 | Learn the Fundamentals of AI & Basics of Prompting / Google. | LLM Systems & AI Agents | Beginner | website |
| 138 | ChatGPT Prompt Engineering for Developers - DeepLearning.AI | LLM Systems & AI Agents | Beginner | website |
| 139 | Prompt design strategies / Gemini API / Google AI for Developers | LLM Systems & AI Agents | Beginner | website |
| 140 | Prompt Engineering Guide / Prompt Engineering Guide | LLM Systems & AI Agents | Beginner | website |
| 141 | Prompt engineering overview - Claude Platform Docs | LLM Systems & AI Agents | Beginner | website |
| 142 | Prompt engineering overview - Claude Platform Docs | LLM Systems & AI Agents | Beginner | website |
| 143 | Prompting best practices - Claude Platform Docs | LLM Systems & AI Agents | Beginner | website |
| 144 | LLM Fine-Tuning Course – From Supervised FT to RLHF, LoRA, and Multi… | LLM Systems & AI Agents | Intermediate | video |
| 145 | PEFT · Hugging Face | LLM Systems & AI Agents | Intermediate | website |
| 146 | Bitsandbytes · Hugging Face | LLM Systems & AI Agents | Intermediate | website |
| 147 | Train Your Own LLM – Tutorial | LLM Systems & AI Agents | Beginner | video |
| 148 | Evolution of the Transformer Architecture Used in LLMs (2017–2025) â… | LLM Systems & AI Agents | Beginner | video |
| 149 | I trained (one of) the smallest Reasoning Language Models EVER from sc… | LLM Systems & AI Agents | Beginner | video |
| 150 | Implementing Kimi K3 from scratch in PyTorch | LLM Systems & AI Agents | Beginner | video |
| 151 | Stanford CS336: Language Modeling from Scratch / Spring 2026 | LLM Systems & AI Agents | Beginner | playlist |
| 152 | Stanford CS336 / Language Modeling from Scratch | LLM Systems & AI Agents | Beginner | website |
| 153 | Stanford CS336 / Language Modeling from Scratch (2025) | LLM Systems & AI Agents | Beginner | website |
| 154 | Stanford CME295: Transformers and Large Language Models I Autumn 2025 | LLM Systems & AI Agents | Beginner | playlist |
| 155 | Tokenizers · Hugging Face | LLM Systems & AI Agents | Beginner | website |
| 156 | Transformers · Hugging Face | LLM Systems & AI Agents | Advanced | website |
| 157 | Ollama | LLM Systems & AI Agents | Advanced | website |
| 158 | GitHub - ggml-org/llama.cpp: LLM inference in C/C++ · GitHub | LLM Systems & AI Agents | Advanced | website |
| 159 | Text Generation Inference · Hugging Face | LLM Systems & AI Agents | Advanced | website |
| 160 | vLLM | LLM Systems & AI Agents | Advanced | website |
| 161 | Welcome to LlamaIndex 🦙 ! / Developer Documentation | LLM Systems & AI Agents | Intermediate | website |
| 162 | Documentation - Qdrant | LLM Systems & AI Agents | Intermediate | website |
| 163 | Learn / Pinecone | LLM Systems & AI Agents | Intermediate | website |
| 164 | GitHub - pgvector/pgvector: Open-source vector similarity search for P… | LLM Systems & AI Agents | Intermediate | website |
| 165 | GitHub - facebookresearch/faiss: A library for efficient similarity se… | LLM Systems & AI Agents | Intermediate | website |
| 166 | SentenceTransformers Documentation — Sentence Transformers documenta… | LLM Systems & AI Agents | Intermediate | website |
| 167 | Sentence Similarity Models – Hugging Face | LLM Systems & AI Agents | Intermediate | website |
| 168 | GitHub - beir-cellar/beir: A Heterogeneous Benchmark for Information R… | LLM Systems & AI Agents | Intermediate | website |
| 169 | Redirecting to LangGraph Documentation | LLM Systems & AI Agents | Intermediate | website |
| 170 | GitHub - huggingface/smolagents: 🤗 smolagents: a barebones library … | LLM Systems & AI Agents | Intermediate | website |
| 171 | Welcome to the 🤗 Model Context Protocol (MCP) Course · Hugging Fac… | LLM Systems & AI Agents | Intermediate | website |
| 172 | Specification - Model Context Protocol | LLM Systems & AI Agents | Intermediate | website |
| 173 | How Claude Code Works (By Building It) | LLM Systems & AI Agents | Intermediate | video |
| 174 | Intro / Promptfoo | LLM Systems & AI Agents | Advanced | website |
| 175 | DeepEval - The LLM Evaluation Framework | LLM Systems & AI Agents | Advanced | website |
| 176 | GitHub - confident-ai/deepeval: The LLM Evaluation Framework · GitHub | LLM Systems & AI Agents | Advanced | website |
| 177 | Ragas | LLM Systems & AI Agents | Intermediate | website |
| 178 | GitHub - evidentlyai/evidently: Evidently is ​​an open-source ML a… | LLM Systems & AI Agents | Advanced | website |
| 179 | Holistic Evaluation of Language Models (HELM) | LLM Systems & AI Agents | Advanced | website |
| 180 | Inspect | LLM Systems & AI Agents | Advanced | website |
| 181 | GitHub - EleutherAI/lm-evaluation-harness: A framework for few-shot ev… | LLM Systems & AI Agents | Advanced | website |
| 182 | Documentation / OpenTelemetry | LLM Systems & AI Agents | Advanced | website |
| 183 | OpenInference Specification / openinference | LLM Systems & AI Agents | Advanced | website |
| 184 | semantic-conventions/docs/gen-ai at main · open-telemetry/semantic-co… | LLM Systems & AI Agents | Advanced | website |
| 185 | GitHub - Arize-ai/phoenix: AI Observability & Evaluation · GitHub | LLM Systems & AI Agents | Advanced | website |
| 186 | GitHub - traceloop/openllmetry: Open-source observability for your Gen… | LLM Systems & AI Agents | Advanced | website |
| 187 | Helicone / AI Gateway & LLM Observability | LLM Systems & AI Agents | Advanced | website |
| 188 | LangSmith Observability - Docs by LangChain | LLM Systems & AI Agents | Advanced | website |
| 189 | LLM Tracing and Agent Observability / MLflow AI Platform | LLM Systems & AI Agents | Advanced | website |
| 190 | MLflow for Agents and LLMs / MLflow AI Platform | LLM Systems & AI Agents | Advanced | website |
| 191 | Open Source AI Engineering Platform - Langfuse | LLM Systems & AI Agents | Advanced | website |
| 192 | Braintrust - The active observability platform for agents | LLM Systems & AI Agents | Advanced | website |
| 193 | The FASTEST introduction to Reinforcement Learning on the internet | Reinforcement Learning | Beginner | video |
| 194 | A (Long) Peek into Reinforcement Learning / Lil'Log | Reinforcement Learning | Beginner | website |
| 195 | Welcome to the 🤗 Deep Reinforcement Learning Course · Hugging Face | Reinforcement Learning | Beginner | website |
| 196 | Reinforcement Learning | Reinforcement Learning | Beginner | playlist |
| 197 | Sutton & Barto Book: Reinforcement Learning: An Introduction | Reinforcement Learning | Beginner | website |
| 198 | DeepMind x UCL / Introduction to Reinforcement Learning 2015 | Reinforcement Learning | Beginner | playlist |
| 199 | Stanford CS234 I Reinforcement Learning I Spring 2024 I Emma Brunskill | Reinforcement Learning | Beginner | playlist |
| 200 | Algorithms of Reinforcement Learning | Reinforcement Learning | Beginner | website |
| 201 | Gymnasium Documentation | Reinforcement Learning | Beginner | website |
| 202 | Welcome to Spinning Up in Deep RL! — Spinning Up documentation | Reinforcement Learning | Beginner | website |
| 203 | CleanRL | Reinforcement Learning | Advanced | website |
| 204 | Stable-Baselines3 Docs - Reliable Reinforcement Learning Implementatio… | Reinforcement Learning | Advanced | website |
| 205 | PettingZoo Documentation | Reinforcement Learning | Advanced | website |
| 206 | Reward Hacking in Reinforcement Learning / Lil'Log | Reinforcement Learning | Advanced | website |
| 207 | CS 185/285: Deep Reinforcement Learning (Spring 2026) | Reinforcement Learning | Advanced | playlist |
| 208 | CS 185/285 | Reinforcement Learning | Advanced | website |
| 209 | Stanford CS224R Deep Reinforcement Learning | Reinforcement Learning | Advanced | playlist |
| 210 | Underactuated Robotics | Reinforcement Learning | Advanced | website |
| 211 | Docker Docs | LLM Systems & AI Agents | Advanced | website |
| 212 | FastAPI - FastAPI | LLM Systems & AI Agents | Advanced | website |
| 213 | Git Large File Storage / Git Large File Storage (LFS) replaces large f… | LLM Systems & AI Agents | Advanced | website |
| 214 | GitHub Actions documentation - GitHub Docs | LLM Systems & AI Agents | Advanced | website |
| 215 | GitHub Actions · GitHub | LLM Systems & AI Agents | Advanced | website |
| 216 | Home / Data Version Control · DVC | LLM Systems & AI Agents | Advanced | website |
| 217 | Home – DVC | LLM Systems & AI Agents | Advanced | website |
| 218 | Docs | LLM Systems & AI Agents | Advanced | website |
| 219 | Elasticsearch / Elasticsearch Reference | LLM Systems & AI Agents | Intermediate | website |
| 220 | [1312.5602] Playing Atari with Deep Reinforcement Learning | Reinforcement Learning | Beginner | website |
| 221 | [1502.05477] Trust Region Policy Optimization | Reinforcement Learning | Intermediate | website |
| 222 | [1506.02438] High-Dimensional Continuous Control Using Generalized Adv… | Reinforcement Learning | Intermediate | website |
| 223 | [1509.02971] Continuous control with deep reinforcement learning | Reinforcement Learning | Intermediate | website |
| 224 | [1509.06461] Deep Reinforcement Learning with Double Q-learning | Reinforcement Learning | Beginner | website |
| 225 | [1511.05952] Prioritized Experience Replay | Reinforcement Learning | Beginner | website |
| 226 | [1511.06581] Dueling Network Architectures for Deep Reinforcement Lear… | Reinforcement Learning | Beginner | website |
| 227 | [1606.03476] Generative Adversarial Imitation Learning | Reinforcement Learning | Intermediate | website |
| 228 | [1703.03400] Model-Agnostic Meta-Learning for Fast Adaptation of Deep … | Reinforcement Learning | Intermediate | website |
| 229 | [1706.03762] Attention Is All You Need | LLM Systems & AI Agents | Beginner | website |
| 230 | [1707.06347] Proximal Policy Optimization Algorithms | Reinforcement Learning | Intermediate | website |
| 231 | [1707.06887] A Distributional Perspective on Reinforcement Learning | Reinforcement Learning | Intermediate | website |
| 232 | [1710.02298] Rainbow: Combining Improvements in Deep Reinforcement Lea… | Reinforcement Learning | Beginner | website |
| 233 | [1710.10044] Distributional Reinforcement Learning with Quantile Regre… | Reinforcement Learning | Intermediate | website |
| 234 | [1712.01815] Mastering Chess and Shogi by Self-Play with a General Rei… | Reinforcement Learning | Advanced | website |
| 235 | [1802.06070] Diversity is All You Need: Learning Skills without a Rewa… | Reinforcement Learning | Intermediate | website |
| 236 | [1802.09477] Addressing Function Approximation Error in Actor-Critic M… | Reinforcement Learning | Intermediate | website |
| 237 | [1803.10122] World Models | Reinforcement Learning | Intermediate | website |
| 238 | [1810.04805] BERT: Pre-training of Deep Bidirectional Transformers for… | LLM Systems & AI Agents | Beginner | website |
| 239 | [1810.12894] Exploration by Random Network Distillation | Reinforcement Learning | Advanced | website |
| 240 | [1812.05905] Soft Actor-Critic Algorithms and Applications | Reinforcement Learning | Intermediate | website |
| 241 | [1910.10683] Exploring the Limits of Transfer Learning with a Unified … | LLM Systems & AI Agents | Beginner | website |
| 242 | [1911.08265] Mastering Atari, Go, Chess and Shogi by Planning with a L… | Reinforcement Learning | Intermediate | website |
| 243 | [1912.01603] Dream to Control: Learning Behaviors by Latent Imaginatio… | Reinforcement Learning | Intermediate | website |
| 244 | [2001.08361] Scaling Laws for Neural Language Models | LLM Systems & AI Agents | Beginner | website |
| 245 | [2005.11401] Retrieval-Augmented Generation for Knowledge-Intensive NL… | LLM Systems & AI Agents | Intermediate | website |
| 246 | [2005.14165] Language Models are Few-Shot Learners | LLM Systems & AI Agents | Beginner | website |
| 247 | [2006.04779] Conservative Q-Learning for Offline Reinforcement Learnin… | Reinforcement Learning | Advanced | website |
| 248 | [2010.11929] An Image is Worth 16x16 Words: Transformers for Image Rec… | Deep Learning | Advanced | website |
| 249 | [2101.03961] Switch Transformers: Scaling to Trillion Parameter Models… | LLM Systems & AI Agents | Beginner | website |
| 250 | [2103.00020] Learning Transferable Visual Models From Natural Language… | Deep Learning | Advanced | website |
| 251 | GitHub - mlfoundations/open_clip: An open source implementation of CLI… | Deep Learning | Advanced | website |
| 252 | [2106.01345] Decision Transformer: Reinforcement Learning via Sequence… | Reinforcement Learning | Advanced | website |
| 253 | [2106.09685] LoRA: Low-Rank Adaptation of Large Language Models | LLM Systems & AI Agents | Intermediate | website |
| 254 | [2109.07958] TruthfulQA: Measuring How Models Mimic Human Falsehoods | LLM Systems & AI Agents | Advanced | website |
| 255 | [2110.06169] Offline Reinforcement Learning with Implicit Q-Learning | Reinforcement Learning | Advanced | website |
| 256 | [2203.02155] Training language models to follow instructions with huma… | LLM Systems & AI Agents | Intermediate | website |
| 257 | [2203.15556] Training Compute-Optimal Large Language Models | LLM Systems & AI Agents | Beginner | website |
| 258 | [2210.03629] ReAct: Synergizing Reasoning and Acting in Language Model… | LLM Systems & AI Agents | Intermediate | website |
| 259 | [2302.04761] Toolformer: Language Models Can Teach Themselves to Use T… | LLM Systems & AI Agents | Intermediate | website |
| 260 | [2305.14314] QLoRA: Efficient Finetuning of Quantized LLMs | LLM Systems & AI Agents | Intermediate | website |
| 261 | [2305.18290] Direct Preference Optimization: Your Language Model is Se… | LLM Systems & AI Agents | Intermediate | website |
| 262 | [2307.03172] Lost in the Middle: How Language Models Use Long Contexts | LLM Systems & AI Agents | Advanced | website |
| 263 | GitHub - nelson-liu/lost-in-the-middle: Code and data for "Lost in the… | LLM Systems & AI Agents | Advanced | website |
| 264 | [2309.15217] Ragas: Automated Evaluation of Retrieval Augmented Genera… | LLM Systems & AI Agents | Intermediate | website |
| 265 | [2310.08560] MemGPT: Towards LLMs as Operating Systems | LLM Systems & AI Agents | Intermediate | website |
| 266 | [2312.00752] Mamba: Linear-Time Sequence Modeling with Selective State… | LLM Systems & AI Agents | Beginner | website |
| 267 | [2402.14740] Back to Basics: Revisiting REINFORCE Style Optimization f… | LLM Systems & AI Agents | Intermediate | website |
| 268 | [2503.14476] DAPO: An Open-Source LLM Reinforcement Learning System at… | LLM Systems & AI Agents | Intermediate | website |
| 269 | What are Large Language Models? / Google Cloud | LLM Systems & AI Agents | Beginner | website |
| 270 | sites.google.com | Reinforcement Learning | Advanced | website |
| 271 | How Citadel Makes Money, Explained with Car Lots and CS skins | Mathematics & Quantitative Finance | Advanced | video |
| 272 | How to Build a Trading Bot in Python / Full Algorithmic Trading Tutori… | Mathematics & Quantitative Finance | Advanced | video |
| 273 | 100 Days of Hell with Python Algo Trading? | Mathematics & Quantitative Finance | Advanced | playlist |
| 274 | Python Trading With Machine Learning Predictions | Mathematics & Quantitative Finance | Advanced | video |
| 275 | Algorithmic Trading – Machine Learning & Quant Strategies Course wit… | Mathematics & Quantitative Finance | Advanced | video |
| 276 | Quantitative trading strategies | Mathematics & Quantitative Finance | Advanced | playlist |
| 277 | Reinforcement Learning Trading Bot in Python / Train an AI Agent on Fo… | Mathematics & Quantitative Finance | Advanced | video |
| 278 | I Gave My AI Trading Bot $3000 / Building an AI trading bot from scrat… | Mathematics & Quantitative Finance | Advanced | video |
| 279 | How to Build an AI Stock Trading Bot with Interactive Brokers | Mathematics & Quantitative Finance | Advanced | video |
| 280 | Kent Daniel: Price Momentum | Mathematics & Quantitative Finance | Advanced | video |
| 281 | Financial Theory with John Geanakoplos | Mathematics & Quantitative Finance | Advanced | playlist |
| 282 | Surbhi Verma / IIT PhD / Quant Trading India | Mathematics & Quantitative Finance | Advanced | channel |
| 283 | Learn the Basics — PyTorch Tutorials 2.14.0+cu130 documentation | Deep Learning | Beginner | website |
| 284 | Create a Large Language Model from Scratch with Python – Tutorial | LLM Systems & AI Agents | Beginner | video |
| 285 | Neural Networks: Zero to Hero | Deep Learning | Beginner | playlist |
| 286 | GitHub - karpathy/build-nanogpt: Video+code lecture on building nanoGP… | LLM Systems & AI Agents | Beginner | website |
| 287 | Building a gpt2 124M Inference Engine From Scratch / Super30 livestrea… | LLM Systems & AI Agents | Beginner | video |
| 288 | LLM Fine-Tuning from Scratch to Advance | LLM Systems & AI Agents | Intermediate | playlist |
| 289 | LLMs from Scratch – Practical Engineering from Base Model to PPO RLH… | LLM Systems & AI Agents | Intermediate | video |
| 290 | How to finetune LLMs to THINK with Reinforcement Learning (GRPO from s… | LLM Systems & AI Agents | Advanced | video |
| 291 | Welcome to the 🤗 AI Agents Course · Hugging Face | LLM Systems & AI Agents | Intermediate | website |
| 292 | Welcome to the 🤗 AI Agents Course · Hugging Face | LLM Systems & AI Agents | Intermediate | website |
| 293 | Building Effective AI Agents / Anthropic | LLM Systems & AI Agents | Beginner | website |
| 294 | Effective context engineering for AI agents / Anthropic | LLM Systems & AI Agents | Beginner | website |
| 295 | GitHub - pydantic/pydantic-ai: How Python does AI. Agents, realtime vo… | LLM Systems & AI Agents | Intermediate | website |
| 296 | Pydantic Docs - Validation, AI Agents, Logfire Observability | LLM Systems & AI Agents | Intermediate | website |
| 297 | Pydantic AI / Pydantic Docs | LLM Systems & AI Agents | Intermediate | website |
| 298 | Roman Paolucci | Mathematics & Quantitative Finance | Advanced | channel |
