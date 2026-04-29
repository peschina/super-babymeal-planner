# Product Requirements Document (PRD)

## Product Name (Working Title): BabyMeal Planner

## 1. Overview

BabyMeal Planner is a progressive web app (PWA) designed to help parents of babies aged 6-12 months plan and prepare balanced daily meals. The app generates a structured weekly calendar with lunch and dinner suggestions, ensuring nutritional variety, age-appropriate portion sizes, seasonal Italian ingredients, and adherence to Italian weaning practices (_svezzamento_).

The app is purely client-side — no backend, no accounts, no network requests after install. It provides parents with a reliable, ready-to-follow plan to reduce decision fatigue and ensure consistency during the weaning phase.

---

## 2. Problem Statement

Parents introducing solid foods often struggle with:

- Knowing what foods to introduce and when
- Ensuring a balanced and varied diet
- Planning meals consistently day-to-day
- Understanding correct portion sizes for their baby's age
- Avoiding repetition or nutritional gaps
- Choosing seasonally appropriate ingredients

This leads to stress, uncertainty, and inconsistent feeding practices.

---

## 3. Goals & Objectives

### Primary Goals

- Provide a ready-to-follow weekly meal calendar
- Ensure nutritionally balanced and varied meals across weeks
- Simplify daily decision-making

### Secondary Goals

- Save time on meal planning
- Build trust as a reliable parenting tool
- Support multiple languages (Italian and English)

---

## 4. Target Users

### Primary Users

- Parents of babies aged 6-12 months
- First-time parents

### Secondary Users

- Caregivers (grandparents, babysitters)

### Context

- Italian families following Italian weaning practices

---

## 5. Key Features

### 5.1 Onboarding Wizard (First Launch)

- 3-step light wizard:
  1. Welcome screen — brief app introduction
  2. Baby profile — age bracket selection (6-7mo, 8-9mo, 10-12mo) + texture preference
  3. Allergens — toggle common allergens to exclude (eggs, fish, dairy, gluten, legumes)

### 5.2 Meal Calendar (Core Feature)

- Day-focused view with circular day-of-week navigation (L M M G V S D)
- Week starts on Monday (Italian convention)
- Each day includes lunch and dinner
- Meals are generated using a combinatorial engine optimized for:
  - Nutritional balance (protein group weekly frequency targets)
  - Variety across and between weeks
  - Age appropriateness (adjusts by age bracket)
  - Italian seasonal vegetable availability

### 5.3 Meal Composition Logic

Each meal includes:

- Cereal cream (carbohydrates)
- Protein source
- 2-4 vegetables (seasonal)
- Extra virgin olive oil (always included)
- Vegetable broth (always included)

#### Protein Groups and Weekly Targets:

| Group | Variants | Target |
|-------|----------|--------|
| White meat | Chicken, turkey, rabbit | 3x/week |
| Red meat | Lamb, beef, veal | 1x/week |
| Fish | Sea bass, sea bream, cod, hake, sole, grey mullet, monkfish, trout, perch | 4x/week |
| Legumes | Red lentils, green lentils, chickpeas, peas, green beans, black beans, borlotti beans, cannellini beans | 2-3x/week |
| Cheese | Parmigiano, mozzarella, ricotta, crescenza, stracchino, robiola, gruyère, casera, provola, primosale | 2-3x/week |
| Egg | Egg yolk (from 6mo), whole egg (from 7mo) | 1x/week max |

#### Constraints:

- No same protein in lunch and dinner of the same day
- No same cereal in lunch and dinner of the same day
- Rotate variants within each protein group
- Cross-week variety: check previous week to avoid repetition at week boundaries

### 5.4 Age Brackets & Portion Guidance

| Bracket  | Cereal | Protein | Vegetables | Broth | Oil |
|----------|--------|---------|------------|-------|-----|
| 6-7 mo   | 20g    | 20-25g  | 40g        | 150ml | 5g  |
| 8-9 mo   | 25g    | 30g     | 50g        | 160ml | 5g  |
| 10-12 mo | 30g    | 35-40g  | 60g        | 170ml | 7g  |

*Note: Portions are preliminary and subject to refinement.*

### 5.5 Texture Options

Decoupled from age (user can override the suggested default):

- **Smooth** (purée/cream) — suggested for 6-7 mo
- **Slightly textured** (mashed, small soft pieces) — suggested for 8-9 mo
- **Soft pieces** (diced, finger food compatible) — suggested for 10-12 mo

### 5.6 Seasonal Vegetables

Vegetables are filtered by Italian seasonal availability:

- **Year-round:** carrot, potato, zucchini, celery, shallot, leek, onion
- **Spring/Summer:** tomato (from 8mo)
- **Fall/Winter:** pumpkin, broccoli, cauliflower, fennel, savoy cabbage
- **From 12mo only:** spinach, beetroot (year-round)

Season auto-detected from device date with manual override in settings.

### 5.7 Allergen Handling

- Users flag common allergens: eggs, fish, dairy, gluten, legumes
- All ingredients with matching allergen tags are excluded from generation
- Allergen changes mid-week auto-regenerate affected meals

### 5.8 Single Meal Swap

- Users can swap individual meals (regenerate one slot)
- Respects same-day constraints and rest-of-week variety
- No "regenerate entire week" feature

### 5.9 Meal Detail View

Each meal includes:

- Ingredients list with quantities (adjusted to age bracket and texture)
- Texture description

### 5.10 Settings

Accessible at any time:

- Change baby age bracket
- Change texture preference
- Update allergens
- Language toggle (Italian/English)
- Season override

---

## 6. User Flow

### Onboarding (First Launch)

1. User opens app
2. Welcome screen explains the app
3. User selects baby age bracket and texture preference
4. User toggles allergens to exclude (or skips)
5. App generates first weekly plan
6. Calendar view is presented

### Daily Use

1. User opens app
2. Sees current day with lunch and dinner
3. Taps a meal for details
4. Sees ingredients and quantities
5. Optionally swaps a meal for an alternative
6. Prepares meal

---

## 7. Functional Requirements

### FR1: Combinatorial Meal Generation Engine

- Generate weekly plans using combinatorial ingredient selection
- Apply nutritional rules (protein group frequency targets)
- Enforce variety constraints within and across weeks
- Filter by age bracket, allergens, and season
- Support single meal swap with constraint compliance

### FR2: Calendar Interface

- Day-focused view with dot navigation
- Allow navigation between weeks
- Current day auto-highlighted

### FR3: Meal Detail Page

- Show structured breakdown of ingredients and quantities
- Adjust for age bracket and texture setting

### FR4: Onboarding Wizard

- 3-step first-launch wizard for baby profile setup

### FR5: Settings

- Allow modification of all preferences at any time
- Trigger regeneration of affected meals on changes

### FR6: Data Storage

- Store user profile and meal plans in LocalStorage
- Retain at least 2 weeks for cross-week variety context
- All data client-side, no backend

### FR7: Internationalization

- Support Italian (default) and English
- Extensible to additional languages

---

## 8. Non-Functional Requirements

- **Usability:** Extremely simple UI, mobile-first, one-handed use (sleep-deprived parent friendly)
- **Performance:** Instant load of weekly plan
- **Offline access:** Fully functional without internet after first load (PWA with service worker)
- **Visual style:** Warm and friendly — playful illustrations, rounded shapes, soft colors
- **Installable:** "Add to Home Screen" support via PWA manifest

---

## 9. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Svelte 5 (with runes) |
| Routing | SvelteKit (static adapter) |
| Build | Vite |
| PWA | vite-plugin-pwa |
| i18n | svelte-i18n |
| Language | TypeScript |
| Testing | Vitest |

---

## 10. Out of Scope (v1)

- Shopping list generation
- User accounts or cloud sync
- Backend/API integration
- AI-powered meal suggestions
- Multiple children profiles
- Breakfast or snack planning
- Nutritional value display (calories, macros)

