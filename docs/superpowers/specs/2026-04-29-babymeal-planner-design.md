# BabyMeal Planner — Design Specification

**Date:** 2026-04-29  
**Status:** Approved  
**Author:** Sara Zanellato + Copilot  

## 1. Overview

BabyMeal Planner is a progressive web app (PWA) that generates daily meal plans for babies aged 6-12 months. It helps Italian parents reduce decision fatigue during the weaning phase by providing nutritionally balanced, age-appropriate lunch and dinner suggestions with seasonal Italian ingredients.

The app is purely client-side — no backend, no accounts, no network requests after install. All meal generation logic and ingredient data are baked into the app.

## 2. Problem Statement

Parents introducing solid foods struggle with: knowing what to introduce and when, ensuring balanced and varied diets, planning meals consistently, understanding correct portions, and avoiding repetition or nutritional gaps. This leads to stress and inconsistent feeding practices.

## 3. Target Users

- **Primary:** Parents of babies aged 6-12 months, especially first-time parents
- **Secondary:** Caregivers (grandparents, babysitters)
- **Context:** Italian families following Italian weaning practices (_svezzamento_)

## 4. Core Architecture

### 4.1 Approach: Combinatorial Meal Generation

Each meal is composed of: `cereal + protein + vegetables + olive oil + broth`. The engine combines ingredients from separate databases rather than selecting from pre-built meal templates. This maximizes variety from a small ingredient dataset.

### 4.2 Ingredient Database

Static JSON data baked into the app. Each ingredient is tagged with metadata for filtering.

**Cereals:** rice cream, corn cream, oat cream, mixed grain cream, semolina  
Fields: `id`, `name_it`, `name_en`, `age_min` (months)

**Proteins:** chicken, turkey, fish (cod/sole), legumes (lentils, chickpeas), cheese (parmigiano, ricotta), egg yolk  
Fields: `id`, `name_it`, `name_en`, `age_min`, `allergen_tags[]`, `weekly_target` (min/max frequency)

**Vegetables:** zucchini, carrot, potato, pumpkin, spinach, peas, green beans, fennel, broccoli, cauliflower, beet, etc.  
Fields: `id`, `name_it`, `name_en`, `age_min`, `seasons[]`

**Constants:** olive oil (always included), vegetable broth (always included), portions scale by age bracket.

> **Note:** The exact ingredient list and portion sizes will be finalized collaboratively before implementation. The values below are initial estimates and must be validated.

### 4.3 Age Brackets & Portions

Three static age brackets with different portion sizes:

| Bracket  | Cereal | Protein | Vegetables | Broth | Oil |
|----------|--------|---------|------------|-------|-----|
| 6-7 mo   | 20g    | 20-25g  | 40g        | 150ml | 5g  |
| 8-9 mo   | 25g    | 30g     | 50g        | 160ml | 5g  |
| 10-12 mo | 30g    | 35-40g  | 60g        | 170ml | 7g  |

> **Note:** Portions are preliminary and will be refined with the user before implementation.

### 4.4 Texture Options

Decoupled from age (some babies prefer different textures than their age default):

- **Smooth** (purée/cream) — default suggestion for 6-7 mo
- **Slightly textured** (mashed, small soft pieces) — default suggestion for 8-9 mo
- **Soft pieces** (diced, finger food compatible) — default suggestion for 10-12 mo

The app suggests a texture default based on age bracket, but the user can override it.

### 4.5 Seasonal Vegetables

Vegetables are tagged with Italian seasonal availability (spring, summer, fall, winter). The engine filters to season-appropriate vegetables when generating meals.

Season detection: auto-detect from device date, with manual override in settings.

### 4.6 Meal Generation Algorithm

1. **Filter ingredients** by: age bracket, excluded allergens, current season (for vegetables)
2. **For each day**, generate lunch + dinner ensuring:
   - No same protein in lunch and dinner of the same day
   - No same cereal in lunch and dinner of the same day
   - Respect weekly protein frequency targets (e.g., fish 1-2x/week, legumes 2-3x, cheese 2x, egg 1x max)
3. **Select 1-2 vegetables per meal** (e.g., zucchini alone, or carrot + potato); maximize vegetable variety across the week
4. **Cross-week variety**: check the previous week's meals to avoid repeating the same protein/cereal patterns at the boundary
5. Use a seeded random approach for reproducibility

### 4.7 Single Meal Swap

When a user swaps a meal, the engine regenerates just that slot while respecting:
- Same-day constraints (different protein/cereal from the other meal that day)
- Rest-of-week variety targets
- Cross-week variety context

There is no "regenerate entire week" feature — only individual meal swaps.

### 4.8 Allergen Handling

Users flag common allergens during onboarding or in settings: eggs, fish, dairy, gluten, legumes.

Flagged allergens cause all ingredients with matching `allergen_tags` to be excluded from generation. If an allergen setting changes mid-week, any affected meals in the current week are automatically regenerated.

## 5. User Interface

### 5.1 Design Style

Warm and friendly: playful illustrations, rounded shapes, soft colors. Mobile-first design (375px primary viewport). The app must be usable one-handed by a sleep-deprived parent.

### 5.2 Screen Map

#### Onboarding Wizard (first launch, 3 steps)
1. **Welcome** — brief explanation of what the app does, warm tone, single CTA
2. **Baby Profile** — age bracket selection (pill buttons), texture preference (vertical radio list with suggested default based on age)
3. **Allergens** — toggle allergen pills to exclude, skip option for no allergies, final CTA triggers first week generation

#### Main Calendar (day-focused with dot navigation)
- Week starts on Monday (Italian convention)
- Circular day-of-week selector at top (L M M G V S D)
- Current day highlighted in accent color
- Selected day shows: day name + date, then lunch card and dinner card stacked vertically
- Each meal card shows: meal type label (🍽 Pranzo / 🌙 Cena), meal description, "tap for details" hint
- Week navigation arrows (← →) at the top

#### Meal Detail (slide-in panel or modal)
- Full ingredient list with quantities adjusted to age bracket and texture
- Texture description for the current setting
- "Swap this meal" button to regenerate this slot

#### Settings (accessible from header icon)
- Change baby age bracket
- Change texture preference
- Update allergens
- Language toggle (IT/EN)
- Season override (auto-detect or manual)
- Changes to allergens trigger automatic regeneration of affected meals
- Changes to age/texture update portions and regenerate remaining future meals in the current week

## 6. Data Storage

### 6.1 Storage: LocalStorage

Simple key-value storage, no backend needed.

**Profile:**
```json
{
  "ageBracket": "8-9",
  "texture": "slightly-textured",
  "allergens": ["fish"],
  "language": "it",
  "seasonOverride": null
}
```

**Meal Plans:**
```json
{
  "2026-W18": {
    "weekStart": "2026-04-27",
    "meals": [
      {
        "day": 0,
        "lunch": { "cereal": "rice-cream", "protein": "chicken", "vegetables": ["zucchini"] },
        "dinner": { "cereal": "oat-cream", "protein": "lentils", "vegetables": ["carrot", "potato"] }
      }
    ]
  }
}
```

### 6.2 Multi-Week Retention

Store at least the last 2 weeks to provide cross-week variety context. Older weeks can be pruned to save storage space.

### 6.3 Data Flow

1. **First launch** → onboarding wizard → save profile → generate first week → show calendar
2. **Open app** → load profile → check if current week exists → show it or generate
3. **Navigate weeks** → generate on-demand, cache in LocalStorage
4. **Swap meal** → regenerate one slot respecting constraints → save
5. **Change settings** → update profile → regenerate affected meals in current week

## 7. PWA Configuration

- **Vite PWA plugin** (`vite-plugin-pwa`) for service worker generation
- Pre-cache all app assets and ingredient data
- App works fully offline after first load
- App manifest: name "BabyMeal Planner", theme color `#f4a261` (warm orange), display mode `standalone`
- "Add to Home Screen" support for mobile install experience

## 8. Internationalization (i18n)

- **Library:** `svelte-i18n`
- **Default language:** Italian
- **Supported languages:** Italian, English (extensible to more)
- Key-value JSON files per locale (`/locales/it.json`, `/locales/en.json`)
- Ingredient names are bilingual in the data model (`name_it`, `name_en`)
- Language selection stored in LocalStorage, changeable in Settings

## 9. Tech Stack

| Layer          | Choice                                      |
|----------------|---------------------------------------------|
| Framework      | Svelte 5 (with runes)                       |
| Routing        | SvelteKit (static adapter, client-side only) |
| Build          | Vite                                        |
| PWA            | vite-plugin-pwa                             |
| i18n           | svelte-i18n                                 |
| Language       | TypeScript                                  |
| Testing        | Vitest                                      |

## 10. Project Structure

```
src/
  lib/
    engine/          # Meal generation algorithm + constraints
    data/            # Ingredient databases, portions, seasons
    stores/          # Svelte stores (profile, meals, i18n)
    components/      # Reusable UI components
  routes/
    +page.svelte     # Main calendar view
    +layout.svelte   # App shell, settings access
    onboarding/      # Wizard steps
  locales/           # it.json, en.json
static/
  icons/             # PWA icons
```

## 11. Testing Strategy

- **Unit tests (Vitest):** Focus on the meal generation engine — constraint validation, variety rules, allergen filtering, seasonal filtering, cross-week variety, edge cases (e.g., all proteins excluded except one)
- **Component tests:** Key UI components (calendar, meal detail, onboarding wizard)
- **Manual testing:** PWA install flow, offline behavior, responsive design on mobile devices

## 12. Out of Scope (v1)

- Shopping list generation
- User accounts or cloud sync
- Backend/API integration
- AI-powered meal suggestions
- Multiple children profiles
- Breakfast or snack planning
- Nutritional value display (calories, macros)
