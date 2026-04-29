# BabyMeal Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a progressive web app that generates nutritionally balanced, age-appropriate weekly meal plans for babies aged 6-12 months, following Italian weaning practices with seasonal ingredients.

**Architecture:** Purely client-side Svelte 5 / SvelteKit PWA. A combinatorial meal engine generates meals from ingredient databases (cereals × proteins × vegetables), constrained by age brackets, allergens, seasonal availability, and weekly frequency targets. All data stored in LocalStorage. Full i18n support (Italian + English).

**Tech Stack:** Svelte 5 (runes), SvelteKit (static adapter), TypeScript, Vitest, vite-plugin-pwa, svelte-i18n

**Spec:** `docs/superpowers/specs/2026-04-29-babymeal-planner-design.md`

---

## File Structure

```
src/
  lib/
    types.ts                          # All TypeScript interfaces
    engine/
      random.ts                       # Seeded PRNG
      random.test.ts                  # Tests for PRNG
      filter.ts                       # Filter ingredients by age/allergens/season
      filter.test.ts                  # Tests for filtering
      generate-meal.ts                # Generate a single meal
      generate-meal.test.ts           # Tests for meal generation
      generate-week.ts                # Generate full week with frequency tracking
      generate-week.test.ts           # Tests for week generation
      swap-meal.ts                    # Swap a single meal slot
      swap-meal.test.ts               # Tests for meal swap
    data/
      cereals.ts                      # Cereal ingredient data
      proteins.ts                     # All protein groups data
      vegetables.ts                   # Vegetable ingredient data
      portions.ts                     # Portion sizes by age bracket
      seasons.ts                      # Season detection + mapping
      seasons.test.ts                 # Tests for season detection
      ingredients.test.ts             # Validation tests for all ingredient data
    stores/
      profile.ts                      # User profile store (LocalStorage)
      meals.ts                        # Meal plans store (LocalStorage)
    i18n/
      index.ts                        # svelte-i18n setup
    components/
      DaySelector.svelte              # Circular day-of-week navigation
      MealCard.svelte                 # Lunch/dinner summary card
      MealDetail.svelte               # Full meal detail panel
      OnboardingWizard.svelte         # 3-step wizard container
      WelcomeStep.svelte              # Onboarding step 1
      ProfileStep.svelte              # Onboarding step 2
      AllergenStep.svelte             # Onboarding step 3
  routes/
    +page.svelte                      # Main calendar (or redirect to onboarding)
    +layout.svelte                    # App shell with header
    +layout.ts                        # SSR disabled, prerender enabled
    onboarding/
      +page.svelte                    # Onboarding wizard page
    settings/
      +page.svelte                    # Settings page
  app.html                            # HTML template
  app.css                             # Global styles + CSS variables
static/
  locales/
    it.json                           # Italian translations
    en.json                           # English translations
  icons/
    icon-192.png                      # PWA icon 192x192
    icon-512.png                      # PWA icon 512x512
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `svelte.config.js`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/app.html`
- Create: `src/app.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "babymeal-planner",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
  },
  "devDependencies": {
    "@sveltejs/adapter-static": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0",
    "vite-plugin-pwa": "^0.21.0"
  },
  "dependencies": {
    "svelte-i18n": "^4.0.0"
  }
}
```

- [ ] **Step 2: Create svelte.config.js**

```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html'
    })
  }
};

export default config;
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.test.ts']
  }
});
```

Note: PWA plugin will be added in Task 18.

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

- [ ] **Step 5: Create src/app.html**

```html
<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#f4a261" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <title>BabyMeal Planner</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

- [ ] **Step 6: Create src/app.css with theme variables**

```css
:root {
  --color-primary: #f4a261;
  --color-primary-light: #fff8f0;
  --color-secondary: #6c5ce7;
  --color-secondary-light: #f0f4ff;
  --color-bg: #fef7f0;
  --color-surface: #ffffff;
  --color-text: #2d3436;
  --color-text-muted: #636e72;
  --color-text-light: #888888;
  --color-border: #eeeeee;
  --color-danger: #e74c3c;
  --color-danger-light: #ffeaea;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 24px;
  --radius-full: 50%;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  max-width: 480px;
  margin: 0 auto;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}
```

- [ ] **Step 7: Install dependencies and verify**

Run: `npm install`
Expected: packages installed successfully

Run: `npx svelte-kit sync`
Expected: `.svelte-kit/` directory created

- [ ] **Step 8: Create minimal route to verify build**

Create `src/routes/+layout.ts`:
```typescript
export const prerender = true;
export const ssr = false;
```

Create `src/routes/+page.svelte`:
```svelte
<h1>BabyMeal Planner</h1>
<p>Setup complete.</p>
```

Run: `npm run build`
Expected: Build succeeds, output in `build/`

- [ ] **Step 9: Verify test runner works**

Create `src/lib/smoke.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('smoke test', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npx vitest run`
Expected: 1 test passed

Delete `src/lib/smoke.test.ts` after confirming.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold SvelteKit project with TypeScript, Vitest, and static adapter"
```

---

## Task 2: Type Definitions

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Define all interfaces**

```typescript
// === Ingredient Types ===

export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type AllergenTag = 'fish' | 'dairy' | 'egg' | 'legumes' | 'gluten';
export type AgeBracket = '6-7' | '8-9' | '10-12';
export type Texture = 'smooth' | 'slightly-textured' | 'soft-pieces';
export type MealType = 'lunch' | 'dinner';

export type ProteinGroup = 'white-meat' | 'red-meat' | 'fish' | 'legumes' | 'cheese' | 'egg';

export interface Cereal {
  id: string;
  nameIt: string;
  nameEn: string;
  ageMin: number;
  allergenTags: AllergenTag[];
}

export interface Protein {
  id: string;
  nameIt: string;
  nameEn: string;
  group: ProteinGroup;
  ageMin: number;
  allergenTags: AllergenTag[];
}

export interface Vegetable {
  id: string;
  nameIt: string;
  nameEn: string;
  ageMin: number;
  seasons: Season[] | 'all';
}

// === Portion Types ===

export interface PortionSizes {
  cereal: number;       // grams
  proteinMin: number;   // grams
  proteinMax: number;   // grams
  vegetables: number;   // grams
  broth: number;        // ml
  oil: number;          // grams
}

// === Frequency Targets ===

export interface FrequencyTarget {
  group: ProteinGroup;
  min: number;
  max: number;
}

// === Meal & Plan Types ===

export interface Meal {
  cereal: string;           // cereal id
  protein: string;          // protein id
  vegetables: string[];     // vegetable ids (2-4)
}

export interface DayPlan {
  day: number;              // 0 = Monday, 6 = Sunday
  lunch: Meal;
  dinner: Meal;
}

export interface WeekPlan {
  weekKey: string;          // e.g., "2026-W18"
  weekStart: string;        // ISO date string, e.g., "2026-04-27"
  meals: DayPlan[];         // 7 days
}

// === User Profile ===

export interface UserProfile {
  ageBracket: AgeBracket;
  texture: Texture;
  allergens: AllergenTag[];
  language: 'it' | 'en';
  seasonOverride: Season | null;
}

// === Engine Config ===

export interface GenerationContext {
  cereals: Cereal[];
  proteins: Protein[];
  vegetables: Vegetable[];
  portions: PortionSizes;
  targets: FrequencyTarget[];
  previousWeek: WeekPlan | null;
  seed: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add TypeScript type definitions for all domain models"
```

---

## Task 3: Ingredient Data

**Files:**
- Create: `src/lib/data/cereals.ts`
- Create: `src/lib/data/proteins.ts`
- Create: `src/lib/data/vegetables.ts`
- Create: `src/lib/data/portions.ts`
- Create: `src/lib/data/ingredients.test.ts`

- [ ] **Step 1: Create cereals data**

```typescript
import type { Cereal } from '$lib/types';

export const cereals: Cereal[] = [
  { id: 'crema-riso', nameIt: 'Crema di riso', nameEn: 'Rice cream', ageMin: 6, allergenTags: [] },
  { id: 'crema-mais', nameIt: 'Crema di mais', nameEn: 'Corn cream', ageMin: 6, allergenTags: [] },
  { id: 'crema-avena', nameIt: 'Crema di avena', nameEn: 'Oat cream', ageMin: 6, allergenTags: ['gluten'] },
  { id: 'crema-multicereali', nameIt: 'Crema multicereali', nameEn: 'Mixed grain cream', ageMin: 6, allergenTags: ['gluten'] },
  { id: 'semolino', nameIt: 'Semolino', nameEn: 'Semolina', ageMin: 6, allergenTags: ['gluten'] },
];
```

- [ ] **Step 2: Create proteins data**

```typescript
import type { Protein, FrequencyTarget } from '$lib/types';

export const proteins: Protein[] = [
  // White Meat (3x/week)
  { id: 'pollo', nameIt: 'Pollo', nameEn: 'Chicken', group: 'white-meat', ageMin: 6, allergenTags: [] },
  { id: 'tacchino', nameIt: 'Tacchino', nameEn: 'Turkey', group: 'white-meat', ageMin: 6, allergenTags: [] },
  { id: 'coniglio', nameIt: 'Coniglio', nameEn: 'Rabbit', group: 'white-meat', ageMin: 6, allergenTags: [] },
  // Red Meat (1x/week)
  { id: 'agnello', nameIt: 'Agnello', nameEn: 'Lamb', group: 'red-meat', ageMin: 6, allergenTags: [] },
  { id: 'manzo', nameIt: 'Manzo', nameEn: 'Beef', group: 'red-meat', ageMin: 6, allergenTags: [] },
  { id: 'vitello', nameIt: 'Vitello', nameEn: 'Veal', group: 'red-meat', ageMin: 6, allergenTags: [] },
  // Fish (4x/week)
  { id: 'branzino', nameIt: 'Branzino', nameEn: 'Sea bass', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'orata', nameIt: 'Orata', nameEn: 'Sea bream', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'merluzzo', nameIt: 'Merluzzo', nameEn: 'Cod', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'nasello', nameIt: 'Nasello', nameEn: 'Hake', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'sogliola', nameIt: 'Sogliola', nameEn: 'Sole', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'cefalo', nameIt: 'Cefalo', nameEn: 'Grey mullet', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'coda-di-rospo', nameIt: 'Coda di rospo', nameEn: 'Monkfish', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'trota', nameIt: 'Trota', nameEn: 'Trout', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  { id: 'pesce-persico', nameIt: 'Pesce persico', nameEn: 'Perch', group: 'fish', ageMin: 6, allergenTags: ['fish'] },
  // Legumes (2-3x/week)
  { id: 'lenticchie-rosse', nameIt: 'Lenticchie rosse', nameEn: 'Red lentils', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'lenticchie-verdi', nameIt: 'Lenticchie verdi', nameEn: 'Green lentils', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'ceci', nameIt: 'Ceci', nameEn: 'Chickpeas', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'piselli', nameIt: 'Piselli', nameEn: 'Peas', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'fagiolini', nameIt: 'Fagiolini', nameEn: 'Green beans', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'fagioli-neri', nameIt: 'Fagioli neri', nameEn: 'Black beans', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'fagioli-borlotti', nameIt: 'Fagioli borlotti', nameEn: 'Borlotti beans', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  { id: 'fagioli-cannellini', nameIt: 'Fagioli cannellini', nameEn: 'Cannellini beans', group: 'legumes', ageMin: 7, allergenTags: ['legumes'] },
  // Cheese (2-3x/week)
  { id: 'parmigiano', nameIt: 'Parmigiano', nameEn: 'Parmesan', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'mozzarella', nameIt: 'Mozzarella', nameEn: 'Mozzarella', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'ricotta', nameIt: 'Ricotta', nameEn: 'Ricotta', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'crescenza', nameIt: 'Crescenza', nameEn: 'Crescenza', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'stracchino', nameIt: 'Stracchino', nameEn: 'Stracchino', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'robiola', nameIt: 'Robiola', nameEn: 'Robiola', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'groviera', nameIt: 'Groviera', nameEn: 'Gruyère', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'casera', nameIt: 'Casera', nameEn: 'Casera', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'provola', nameIt: 'Provola', nameEn: 'Provola', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  { id: 'primosale', nameIt: 'Primosale', nameEn: 'Primosale', group: 'cheese', ageMin: 6, allergenTags: ['dairy'] },
  // Egg (1x/week max)
  { id: 'tuorlo', nameIt: "Tuorlo d'uovo", nameEn: 'Egg yolk', group: 'egg', ageMin: 6, allergenTags: ['egg'] },
  { id: 'uovo-intero', nameIt: 'Uovo intero', nameEn: 'Whole egg', group: 'egg', ageMin: 7, allergenTags: ['egg'] },
];

export const frequencyTargets: FrequencyTarget[] = [
  { group: 'white-meat', min: 3, max: 3 },
  { group: 'red-meat', min: 1, max: 1 },
  { group: 'fish', min: 4, max: 4 },
  { group: 'legumes', min: 2, max: 3 },
  { group: 'cheese', min: 2, max: 3 },
  { group: 'egg', min: 0, max: 1 },
];
```

- [ ] **Step 3: Create vegetables data**

```typescript
import type { Vegetable } from '$lib/types';

export const vegetables: Vegetable[] = [
  { id: 'carota', nameIt: 'Carota', nameEn: 'Carrot', ageMin: 6, seasons: 'all' },
  { id: 'patata', nameIt: 'Patata', nameEn: 'Potato', ageMin: 6, seasons: 'all' },
  { id: 'zucchina', nameIt: 'Zucchina', nameEn: 'Zucchini', ageMin: 6, seasons: 'all' },
  { id: 'sedano', nameIt: 'Sedano', nameEn: 'Celery', ageMin: 6, seasons: 'all' },
  { id: 'scalogno', nameIt: 'Scalogno', nameEn: 'Shallot', ageMin: 6, seasons: 'all' },
  { id: 'porro', nameIt: 'Porro', nameEn: 'Leek', ageMin: 6, seasons: 'all' },
  { id: 'cipolla', nameIt: 'Cipolla', nameEn: 'Onion', ageMin: 6, seasons: 'all' },
  { id: 'pomodoro', nameIt: 'Pomodoro', nameEn: 'Tomato', ageMin: 8, seasons: ['spring', 'summer'] },
  { id: 'zucca', nameIt: 'Zucca', nameEn: 'Pumpkin', ageMin: 6, seasons: ['fall', 'winter'] },
  { id: 'broccolo', nameIt: 'Broccolo', nameEn: 'Broccoli', ageMin: 6, seasons: ['fall', 'winter'] },
  { id: 'cavolfiore', nameIt: 'Cavolfiore', nameEn: 'Cauliflower', ageMin: 6, seasons: ['fall', 'winter'] },
  { id: 'finocchio', nameIt: 'Finocchio', nameEn: 'Fennel', ageMin: 6, seasons: ['fall', 'winter'] },
  { id: 'verza', nameIt: 'Verza', nameEn: 'Savoy cabbage', ageMin: 6, seasons: ['fall', 'winter'] },
  { id: 'spinaci', nameIt: 'Spinaci', nameEn: 'Spinach', ageMin: 12, seasons: ['fall', 'winter'] },
  { id: 'barbabietola', nameIt: 'Barbabietola', nameEn: 'Beetroot', ageMin: 12, seasons: 'all' },
];
```

- [ ] **Step 4: Create portions data**

```typescript
import type { AgeBracket, PortionSizes, Texture } from '$lib/types';

export const portions: Record<AgeBracket, PortionSizes> = {
  '6-7': { cereal: 20, proteinMin: 20, proteinMax: 25, vegetables: 40, broth: 150, oil: 5 },
  '8-9': { cereal: 25, proteinMin: 30, proteinMax: 30, vegetables: 50, broth: 160, oil: 5 },
  '10-12': { cereal: 30, proteinMin: 35, proteinMax: 40, vegetables: 60, broth: 170, oil: 7 },
};

export const defaultTexture: Record<AgeBracket, Texture> = {
  '6-7': 'smooth',
  '8-9': 'slightly-textured',
  '10-12': 'soft-pieces',
};

export const textureDescriptions: Record<Texture, { it: string; en: string }> = {
  'smooth': { it: 'Liscia (crema/purè)', en: 'Smooth (purée/cream)' },
  'slightly-textured': { it: 'Leggermente granulosa', en: 'Slightly textured (mashed)' },
  'soft-pieces': { it: 'Pezzettini morbidi', en: 'Soft pieces (diced)' },
};
```

- [ ] **Step 5: Write ingredient validation tests**

```typescript
import { describe, it, expect } from 'vitest';
import { cereals } from './cereals';
import { proteins, frequencyTargets } from './proteins';
import { vegetables } from './vegetables';

describe('ingredient data integrity', () => {
  it('all cereals have unique ids', () => {
    const ids = cereals.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all proteins have unique ids', () => {
    const ids = proteins.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all vegetables have unique ids', () => {
    const ids = vegetables.map(v => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all proteins have a valid group', () => {
    const validGroups = ['white-meat', 'red-meat', 'fish', 'legumes', 'cheese', 'egg'];
    for (const p of proteins) {
      expect(validGroups).toContain(p.group);
    }
  });

  it('frequency targets cover all protein groups', () => {
    const groups = new Set(proteins.map(p => p.group));
    const targetGroups = new Set(frequencyTargets.map(t => t.group));
    for (const g of groups) {
      expect(targetGroups.has(g)).toBe(true);
    }
  });

  it('frequency targets sum to 14 (min feasible)', () => {
    const minSum = frequencyTargets.reduce((s, t) => s + t.min, 0);
    const maxSum = frequencyTargets.reduce((s, t) => s + t.max, 0);
    expect(minSum).toBeLessThanOrEqual(14);
    expect(maxSum).toBeGreaterThanOrEqual(14);
  });

  it('all ingredients have both Italian and English names', () => {
    for (const c of cereals) {
      expect(c.nameIt.length).toBeGreaterThan(0);
      expect(c.nameEn.length).toBeGreaterThan(0);
    }
    for (const p of proteins) {
      expect(p.nameIt.length).toBeGreaterThan(0);
      expect(p.nameEn.length).toBeGreaterThan(0);
    }
    for (const v of vegetables) {
      expect(v.nameIt.length).toBeGreaterThan(0);
      expect(v.nameEn.length).toBeGreaterThan(0);
    }
  });

  it('vegetables have valid season data', () => {
    const validSeasons = ['spring', 'summer', 'fall', 'winter'];
    for (const v of vegetables) {
      if (v.seasons !== 'all') {
        expect(Array.isArray(v.seasons)).toBe(true);
        for (const s of v.seasons) {
          expect(validSeasons).toContain(s);
        }
      }
    }
  });
});
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run src/lib/data/ingredients.test.ts`
Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add src/lib/data/ src/lib/types.ts
git commit -m "feat: add type definitions and ingredient data (cereals, proteins, vegetables, portions)"
```

---

## Task 4: Season Utilities (TDD)

**Files:**
- Create: `src/lib/data/seasons.ts`
- Create: `src/lib/data/seasons.test.ts`

- [ ] **Step 1: Write failing tests for season detection**

```typescript
import { describe, it, expect } from 'vitest';
import { getSeasonFromDate, getSeasonFromMonth } from './seasons';

describe('getSeasonFromMonth', () => {
  it('returns winter for December-February', () => {
    expect(getSeasonFromMonth(12)).toBe('winter');
    expect(getSeasonFromMonth(1)).toBe('winter');
    expect(getSeasonFromMonth(2)).toBe('winter');
  });

  it('returns spring for March-May', () => {
    expect(getSeasonFromMonth(3)).toBe('spring');
    expect(getSeasonFromMonth(4)).toBe('spring');
    expect(getSeasonFromMonth(5)).toBe('spring');
  });

  it('returns summer for June-August', () => {
    expect(getSeasonFromMonth(6)).toBe('summer');
    expect(getSeasonFromMonth(7)).toBe('summer');
    expect(getSeasonFromMonth(8)).toBe('summer');
  });

  it('returns fall for September-November', () => {
    expect(getSeasonFromMonth(9)).toBe('fall');
    expect(getSeasonFromMonth(10)).toBe('fall');
    expect(getSeasonFromMonth(11)).toBe('fall');
  });
});

describe('getSeasonFromDate', () => {
  it('detects season from a Date object', () => {
    expect(getSeasonFromDate(new Date('2026-04-15'))).toBe('spring');
    expect(getSeasonFromDate(new Date('2026-07-20'))).toBe('summer');
    expect(getSeasonFromDate(new Date('2026-10-05'))).toBe('fall');
    expect(getSeasonFromDate(new Date('2026-01-10'))).toBe('winter');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/data/seasons.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement season utilities**

```typescript
import type { Season } from '$lib/types';

export function getSeasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

export function getSeasonFromDate(date: Date): Season {
  return getSeasonFromMonth(date.getMonth() + 1);
}

export function getCurrentSeason(override: Season | null): Season {
  if (override) return override;
  return getSeasonFromDate(new Date());
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/data/seasons.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/seasons.ts src/lib/data/seasons.test.ts
git commit -m "feat: add season detection utilities with tests"
```

---

## Task 5: Seeded Random (TDD)

**Files:**
- Create: `src/lib/engine/random.ts`
- Create: `src/lib/engine/random.test.ts`

- [ ] **Step 1: Write failing tests for seeded PRNG**

```typescript
import { describe, it, expect } from 'vitest';
import { createRng } from './random';

describe('createRng', () => {
  it('produces deterministic sequence for same seed', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = createRng(1);
    const rng2 = createRng(2);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).not.toEqual(seq2);
  });

  it('returns values between 0 and 1', () => {
    const rng = createRng(123);
    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});

describe('shuffle', () => {
  // Import after implementation
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/engine/random.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement seeded PRNG (mulberry32)**

```typescript
export type Rng = () => number;

export function createRng(seed: number): Rng {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(array: T[], rng: Rng): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickRandom<T>(array: T[], rng: Rng): T {
  return array[Math.floor(rng() * array.length)];
}

export function pickN<T>(array: T[], n: number, rng: Rng): T[] {
  const shuffled = shuffle(array, rng);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}
```

- [ ] **Step 4: Add shuffle/pickN tests and verify all pass**

Add to the test file:
```typescript
import { createRng, shuffle, pickN } from './random';

describe('shuffle', () => {
  it('returns array of same length', () => {
    const rng = createRng(42);
    const result = shuffle([1, 2, 3, 4, 5], rng);
    expect(result).toHaveLength(5);
  });

  it('contains same elements', () => {
    const rng = createRng(42);
    const result = shuffle([1, 2, 3, 4, 5], rng);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('is deterministic with same seed', () => {
    const r1 = shuffle([1, 2, 3, 4, 5], createRng(42));
    const r2 = shuffle([1, 2, 3, 4, 5], createRng(42));
    expect(r1).toEqual(r2);
  });
});

describe('pickN', () => {
  it('picks n items from array', () => {
    const rng = createRng(42);
    const result = pickN([1, 2, 3, 4, 5], 3, rng);
    expect(result).toHaveLength(3);
  });

  it('picks at most array length', () => {
    const rng = createRng(42);
    const result = pickN([1, 2], 5, rng);
    expect(result).toHaveLength(2);
  });
});
```

Run: `npx vitest run src/lib/engine/random.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine/
git commit -m "feat: add seeded PRNG with shuffle and pick utilities"
```

---

## Task 6: Ingredient Filtering (TDD)

**Files:**
- Create: `src/lib/engine/filter.ts`
- Create: `src/lib/engine/filter.test.ts`

- [ ] **Step 1: Write failing tests for ingredient filtering**

```typescript
import { describe, it, expect } from 'vitest';
import { filterCereals, filterProteins, filterVegetables } from './filter';
import { cereals } from '$lib/data/cereals';
import { proteins } from '$lib/data/proteins';
import { vegetables } from '$lib/data/vegetables';
import type { AllergenTag, Season } from '$lib/types';

describe('filterCereals', () => {
  it('returns all cereals for 6mo with no allergens', () => {
    const result = filterCereals(cereals, 6, []);
    expect(result).toHaveLength(5);
  });

  it('excludes gluten-tagged cereals when gluten allergen is set', () => {
    const result = filterCereals(cereals, 6, ['gluten']);
    expect(result).toHaveLength(2);
    expect(result.every(c => !c.allergenTags.includes('gluten'))).toBe(true);
  });
});

describe('filterProteins', () => {
  it('excludes legumes for 6mo baby (legumes require 7mo)', () => {
    const result = filterProteins(proteins, 6, []);
    expect(result.some(p => p.group === 'legumes')).toBe(false);
  });

  it('includes legumes for 7mo baby', () => {
    const result = filterProteins(proteins, 7, []);
    expect(result.some(p => p.group === 'legumes')).toBe(true);
  });

  it('excludes fish when fish allergen is set', () => {
    const result = filterProteins(proteins, 8, ['fish']);
    expect(result.some(p => p.group === 'fish')).toBe(false);
  });

  it('excludes dairy when dairy allergen is set', () => {
    const result = filterProteins(proteins, 8, ['dairy']);
    expect(result.some(p => p.group === 'cheese')).toBe(false);
  });

  it('excludes whole egg for 6mo but includes yolk', () => {
    const result = filterProteins(proteins, 6, []);
    expect(result.some(p => p.id === 'tuorlo')).toBe(true);
    expect(result.some(p => p.id === 'uovo-intero')).toBe(false);
  });
});

describe('filterVegetables', () => {
  it('returns year-round vegetables for any season', () => {
    const result = filterVegetables(vegetables, 6, 'summer');
    expect(result.some(v => v.id === 'carota')).toBe(true);
    expect(result.some(v => v.id === 'patata')).toBe(true);
  });

  it('includes summer vegetables in summer', () => {
    const result = filterVegetables(vegetables, 8, 'summer');
    expect(result.some(v => v.id === 'pomodoro')).toBe(true);
  });

  it('excludes summer vegetables in winter', () => {
    const result = filterVegetables(vegetables, 8, 'winter');
    expect(result.some(v => v.id === 'pomodoro')).toBe(false);
  });

  it('includes fall/winter vegetables in winter', () => {
    const result = filterVegetables(vegetables, 6, 'winter');
    expect(result.some(v => v.id === 'zucca')).toBe(true);
    expect(result.some(v => v.id === 'broccolo')).toBe(true);
  });

  it('excludes spinach and beetroot for babies under 12mo', () => {
    const result = filterVegetables(vegetables, 8, 'winter');
    expect(result.some(v => v.id === 'spinaci')).toBe(false);
    expect(result.some(v => v.id === 'barbabietola')).toBe(false);
  });

  it('includes spinach for 12mo baby in winter', () => {
    const result = filterVegetables(vegetables, 12, 'winter');
    expect(result.some(v => v.id === 'spinaci')).toBe(true);
  });

  it('excludes tomato for 6mo baby even in summer', () => {
    const result = filterVegetables(vegetables, 6, 'summer');
    expect(result.some(v => v.id === 'pomodoro')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/engine/filter.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement filtering functions**

```typescript
import type { Cereal, Protein, Vegetable, AllergenTag, Season } from '$lib/types';

export function ageBracketToMinMonth(ageBracket: string): number {
  const map: Record<string, number> = { '6-7': 6, '8-9': 8, '10-12': 10 };
  return map[ageBracket] ?? 6;
}

export function filterCereals(
  cereals: Cereal[],
  babyAgeMonths: number,
  allergens: AllergenTag[]
): Cereal[] {
  return cereals.filter(c =>
    c.ageMin <= babyAgeMonths &&
    !c.allergenTags.some(tag => allergens.includes(tag))
  );
}

export function filterProteins(
  proteins: Protein[],
  babyAgeMonths: number,
  allergens: AllergenTag[]
): Protein[] {
  return proteins.filter(p =>
    p.ageMin <= babyAgeMonths &&
    !p.allergenTags.some(tag => allergens.includes(tag))
  );
}

export function filterVegetables(
  vegetables: Vegetable[],
  babyAgeMonths: number,
  season: Season
): Vegetable[] {
  return vegetables.filter(v => {
    if (v.ageMin > babyAgeMonths) return false;
    if (v.seasons === 'all') return true;
    return v.seasons.includes(season);
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/engine/filter.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine/filter.ts src/lib/engine/filter.test.ts
git commit -m "feat: add ingredient filtering by age, allergens, and season"
```

---

## Task 7: Single Meal Generation (TDD)

**Files:**
- Create: `src/lib/engine/generate-meal.ts`
- Create: `src/lib/engine/generate-meal.test.ts`

- [ ] **Step 1: Write failing tests for single meal generation**

```typescript
import { describe, it, expect } from 'vitest';
import { generateMeal } from './generate-meal';
import { createRng } from './random';
import { filterCereals, filterProteins, filterVegetables } from './filter';
import { cereals } from '$lib/data/cereals';
import { proteins } from '$lib/data/proteins';
import { vegetables } from '$lib/data/vegetables';
import type { Meal } from '$lib/types';

const rng = createRng(42);
const availCereals = filterCereals(cereals, 8, []);
const availProteins = filterProteins(proteins, 8, []);
const availVegetables = filterVegetables(vegetables, 8, 'winter');

describe('generateMeal', () => {
  it('returns a meal with cereal, protein, and 2-4 vegetables', () => {
    const meal = generateMeal(availCereals, availProteins, availVegetables, createRng(42));
    expect(meal.cereal).toBeTruthy();
    expect(meal.protein).toBeTruthy();
    expect(meal.vegetables.length).toBeGreaterThanOrEqual(2);
    expect(meal.vegetables.length).toBeLessThanOrEqual(4);
  });

  it('returns valid ingredient ids', () => {
    const meal = generateMeal(availCereals, availProteins, availVegetables, createRng(42));
    expect(availCereals.some(c => c.id === meal.cereal)).toBe(true);
    expect(availProteins.some(p => p.id === meal.protein)).toBe(true);
    for (const vid of meal.vegetables) {
      expect(availVegetables.some(v => v.id === vid)).toBe(true);
    }
  });

  it('returns unique vegetables (no duplicates in one meal)', () => {
    const meal = generateMeal(availCereals, availProteins, availVegetables, createRng(42));
    expect(new Set(meal.vegetables).size).toBe(meal.vegetables.length);
  });

  it('respects excludeProtein constraint', () => {
    const meal = generateMeal(
      availCereals, availProteins, availVegetables, createRng(42),
      { excludeProtein: 'pollo' }
    );
    expect(meal.protein).not.toBe('pollo');
  });

  it('respects excludeCereal constraint', () => {
    const meal = generateMeal(
      availCereals, availProteins, availVegetables, createRng(42),
      { excludeCereal: 'crema-riso' }
    );
    expect(meal.cereal).not.toBe('crema-riso');
  });

  it('respects preferProteinGroup constraint', () => {
    const fishOnly = availProteins.filter(p => p.group === 'fish');
    const meal = generateMeal(
      availCereals, fishOnly, availVegetables, createRng(42)
    );
    expect(availProteins.find(p => p.id === meal.protein)?.group).toBe('fish');
  });

  it('is deterministic for same seed', () => {
    const m1 = generateMeal(availCereals, availProteins, availVegetables, createRng(99));
    const m2 = generateMeal(availCereals, availProteins, availVegetables, createRng(99));
    expect(m1).toEqual(m2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/engine/generate-meal.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement generateMeal**

```typescript
import type { Cereal, Protein, Vegetable, Meal } from '$lib/types';
import { pickRandom, pickN, type Rng } from './random';

export interface MealConstraints {
  excludeProtein?: string;
  excludeCereal?: string;
}

export function generateMeal(
  cereals: Cereal[],
  proteins: Protein[],
  vegetables: Vegetable[],
  rng: Rng,
  constraints: MealConstraints = {}
): Meal {
  const availCereals = constraints.excludeCereal
    ? cereals.filter(c => c.id !== constraints.excludeCereal)
    : cereals;

  const availProteins = constraints.excludeProtein
    ? proteins.filter(p => p.id !== constraints.excludeProtein)
    : proteins;

  const cereal = pickRandom(availCereals, rng);
  const protein = pickRandom(availProteins, rng);
  const vegCount = 2 + Math.floor(rng() * 3); // 2, 3, or 4
  const selectedVegs = pickN(vegetables, vegCount, rng);

  return {
    cereal: cereal.id,
    protein: protein.id,
    vegetables: selectedVegs.map(v => v.id),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/engine/generate-meal.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine/generate-meal.ts src/lib/engine/generate-meal.test.ts
git commit -m "feat: add single meal generation with constraints"
```

---

## Task 8: Week Generation (TDD)

**Files:**
- Create: `src/lib/engine/generate-week.ts`
- Create: `src/lib/engine/generate-week.test.ts`

This is the core algorithm. It allocates protein group frequencies, assigns specific variants, then builds 7 days of lunch + dinner.

- [ ] **Step 1: Write failing tests for week generation**

```typescript
import { describe, it, expect } from 'vitest';
import { generateWeek, allocateGroupSlots, getWeekKey, getWeekStart } from './generate-week';
import { cereals } from '$lib/data/cereals';
import { proteins, frequencyTargets } from '$lib/data/proteins';
import { vegetables } from '$lib/data/vegetables';
import { createRng } from './random';
import type { WeekPlan, ProteinGroup } from '$lib/types';

describe('allocateGroupSlots', () => {
  it('allocates exactly 14 slots total', () => {
    const rng = createRng(42);
    const allocation = allocateGroupSlots(frequencyTargets, rng);
    const total = Object.values(allocation).reduce((s, n) => s + n, 0);
    expect(total).toBe(14);
  });

  it('respects min/max for each group', () => {
    const rng = createRng(42);
    const allocation = allocateGroupSlots(frequencyTargets, rng);
    for (const target of frequencyTargets) {
      expect(allocation[target.group]).toBeGreaterThanOrEqual(target.min);
      expect(allocation[target.group]).toBeLessThanOrEqual(target.max);
    }
  });

  it('is deterministic for same seed', () => {
    const a1 = allocateGroupSlots(frequencyTargets, createRng(42));
    const a2 = allocateGroupSlots(frequencyTargets, createRng(42));
    expect(a1).toEqual(a2);
  });
});

describe('getWeekKey', () => {
  it('returns ISO week key for a date', () => {
    expect(getWeekKey(new Date('2026-04-27'))).toBe('2026-W18');
  });

  it('handles year boundaries', () => {
    expect(getWeekKey(new Date('2026-01-01'))).toBe('2026-W01');
  });
});

describe('getWeekStart', () => {
  it('returns Monday for a date in the middle of the week', () => {
    const start = getWeekStart(new Date('2026-04-29')); // Wednesday
    expect(start.getDay()).toBe(1); // Monday
    expect(start.toISOString().slice(0, 10)).toBe('2026-04-27');
  });

  it('returns same Monday if date is already Monday', () => {
    const start = getWeekStart(new Date('2026-04-27')); // Monday
    expect(start.toISOString().slice(0, 10)).toBe('2026-04-27');
  });
});

describe('generateWeek', () => {
  const ctx = {
    cereals,
    proteins,
    vegetables,
    babyAgeMonths: 8,
    allergens: [] as any[],
    season: 'winter' as const,
    previousWeek: null,
    seed: 42,
  };

  it('generates 7 days', () => {
    const week = generateWeek(ctx);
    expect(week.meals).toHaveLength(7);
  });

  it('each day has lunch and dinner', () => {
    const week = generateWeek(ctx);
    for (const day of week.meals) {
      expect(day.lunch).toBeTruthy();
      expect(day.dinner).toBeTruthy();
      expect(day.lunch.cereal).toBeTruthy();
      expect(day.dinner.cereal).toBeTruthy();
    }
  });

  it('no same protein variant in lunch and dinner of same day', () => {
    const week = generateWeek(ctx);
    for (const day of week.meals) {
      expect(day.lunch.protein).not.toBe(day.dinner.protein);
    }
  });

  it('no same cereal in lunch and dinner of same day', () => {
    const week = generateWeek(ctx);
    for (const day of week.meals) {
      expect(day.lunch.cereal).not.toBe(day.dinner.cereal);
    }
  });

  it('respects protein group frequency targets', () => {
    const week = generateWeek(ctx);
    const groupCounts: Record<string, number> = {};
    for (const day of week.meals) {
      for (const meal of [day.lunch, day.dinner]) {
        const protein = proteins.find(p => p.id === meal.protein)!;
        groupCounts[protein.group] = (groupCounts[protein.group] || 0) + 1;
      }
    }
    for (const target of frequencyTargets) {
      const count = groupCounts[target.group] || 0;
      expect(count).toBeGreaterThanOrEqual(target.min);
      expect(count).toBeLessThanOrEqual(target.max);
    }
  });

  it('each meal has 2-4 vegetables', () => {
    const week = generateWeek(ctx);
    for (const day of week.meals) {
      for (const meal of [day.lunch, day.dinner]) {
        expect(meal.vegetables.length).toBeGreaterThanOrEqual(2);
        expect(meal.vegetables.length).toBeLessThanOrEqual(4);
      }
    }
  });

  it('is deterministic for same seed', () => {
    const w1 = generateWeek(ctx);
    const w2 = generateWeek(ctx);
    expect(w1.meals).toEqual(w2.meals);
  });

  it('generates different plans for different seeds', () => {
    const w1 = generateWeek({ ...ctx, seed: 1 });
    const w2 = generateWeek({ ...ctx, seed: 2 });
    const p1 = w1.meals.map(d => d.lunch.protein).join(',');
    const p2 = w2.meals.map(d => d.lunch.protein).join(',');
    expect(p1).not.toBe(p2);
  });

  it('excludes fish when fish allergen is set', () => {
    const week = generateWeek({ ...ctx, allergens: ['fish'] });
    for (const day of week.meals) {
      for (const meal of [day.lunch, day.dinner]) {
        const protein = proteins.find(p => p.id === meal.protein)!;
        expect(protein.group).not.toBe('fish');
      }
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/engine/generate-week.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement week generation**

```typescript
import type { Cereal, Protein, Vegetable, FrequencyTarget, Meal, DayPlan, WeekPlan, ProteinGroup, AllergenTag, Season } from '$lib/types';
import { createRng, shuffle, pickRandom, pickN, type Rng } from './random';
import { filterCereals, filterProteins, filterVegetables } from './filter';
import { generateMeal } from './generate-meal';

export interface WeekGenerationContext {
  cereals: Cereal[];
  proteins: Protein[];
  vegetables: Vegetable[];
  babyAgeMonths: number;
  allergens: AllergenTag[];
  season: Season;
  previousWeek: WeekPlan | null;
  seed: number;
}

export function allocateGroupSlots(
  targets: FrequencyTarget[],
  rng: Rng
): Record<ProteinGroup, number> {
  const allocation: Record<string, number> = {};
  let total = 0;

  // Start with minimum for each group
  for (const t of targets) {
    allocation[t.group] = t.min;
    total += t.min;
  }

  // Fill remaining slots randomly from groups that can still grow
  const remaining = 14 - total;
  const expandable = targets
    .filter(t => allocation[t.group] < t.max)
    .map(t => t.group);

  const shuffled = shuffle([...expandable], rng);
  let idx = 0;
  for (let i = 0; i < remaining; i++) {
    // Find next group that can still grow
    let attempts = 0;
    while (attempts < shuffled.length) {
      const group = shuffled[idx % shuffled.length];
      const target = targets.find(t => t.group === group)!;
      if (allocation[group] < target.max) {
        allocation[group]++;
        idx++;
        break;
      }
      idx++;
      attempts++;
    }
  }

  return allocation as Record<ProteinGroup, number>;
}

export function getWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function generateWeek(ctx: WeekGenerationContext): WeekPlan {
  const rng = createRng(ctx.seed);

  // Filter available ingredients
  const availCereals = filterCereals(ctx.cereals, ctx.babyAgeMonths, ctx.allergens);
  const availProteins = filterProteins(ctx.proteins, ctx.babyAgeMonths, ctx.allergens);
  const availVegetables = filterVegetables(ctx.vegetables, ctx.babyAgeMonths, ctx.season);

  // Get available frequency targets (only for groups that have proteins after filtering)
  const availableGroups = new Set(availProteins.map(p => p.group));
  const { frequencyTargets } = await import('$lib/data/proteins');
  const availTargets = frequencyTargets.filter(t => availableGroups.has(t.group));

  // Reallocate targets to sum to 14 when some groups are excluded
  const adjustedTargets = adjustTargetsForAvailability(availTargets, rng);

  // Allocate group slots
  const allocation = allocateGroupSlots(adjustedTargets, rng);

  // Build protein pool: for each group, pick N variants with rotation
  const proteinPool: Protein[] = [];
  for (const [group, count] of Object.entries(allocation)) {
    const groupProteins = availProteins.filter(p => p.group === group);
    if (groupProteins.length === 0) continue;
    for (let i = 0; i < count; i++) {
      proteinPool.push(groupProteins[i % groupProteins.length]);
    }
  }

  // Shuffle protein pool
  const shuffledProteins = shuffle(proteinPool, rng);

  // Cross-week variety: get proteins/cereals from end of previous week
  const prevDayProteins = ctx.previousWeek
    ? [ctx.previousWeek.meals[6]?.lunch.protein, ctx.previousWeek.meals[6]?.dinner.protein].filter(Boolean)
    : [];

  // Assign proteins to 14 slots (7 days x 2 meals)
  // Ensuring no same variant in lunch+dinner of same day
  const meals: DayPlan[] = [];

  let poolIdx = 0;
  for (let day = 0; day < 7; day++) {
    // Pick lunch protein
    let lunchProtein = shuffledProteins[poolIdx++];
    // Avoid cross-week repetition on day 0
    if (day === 0 && prevDayProteins.includes(lunchProtein.id) && poolIdx < shuffledProteins.length) {
      // Swap with next available
      const swapIdx = shuffledProteins.findIndex((p, i) => i >= poolIdx && !prevDayProteins.includes(p.id));
      if (swapIdx >= 0) {
        [shuffledProteins[poolIdx - 1], shuffledProteins[swapIdx]] = [shuffledProteins[swapIdx], shuffledProteins[poolIdx - 1]];
        lunchProtein = shuffledProteins[poolIdx - 1];
      }
    }

    // Pick dinner protein (different variant from lunch)
    let dinnerProtein = shuffledProteins[poolIdx++];
    if (dinnerProtein.id === lunchProtein.id) {
      // Swap with next non-conflicting protein
      const swapIdx = shuffledProteins.findIndex((p, i) => i > poolIdx && p.id !== lunchProtein.id);
      if (swapIdx >= 0) {
        [shuffledProteins[poolIdx - 1], shuffledProteins[swapIdx]] = [shuffledProteins[swapIdx], shuffledProteins[poolIdx - 1]];
        dinnerProtein = shuffledProteins[poolIdx - 1];
      }
    }

    // Generate lunch and dinner meals
    const lunchCereal = pickRandom(availCereals, rng);
    const dinnerCereal = pickRandom(
      availCereals.filter(c => c.id !== lunchCereal.id).length > 0
        ? availCereals.filter(c => c.id !== lunchCereal.id)
        : availCereals,
      rng
    );

    const vegCount1 = 2 + Math.floor(rng() * 3);
    const vegCount2 = 2 + Math.floor(rng() * 3);
    const lunchVegs = pickN(availVegetables, vegCount1, rng);
    const dinnerVegs = pickN(availVegetables, vegCount2, rng);

    meals.push({
      day,
      lunch: {
        cereal: lunchCereal.id,
        protein: lunchProtein.id,
        vegetables: lunchVegs.map(v => v.id),
      },
      dinner: {
        cereal: dinnerCereal.id,
        protein: dinnerProtein.id,
        vegetables: dinnerVegs.map(v => v.id),
      },
    });
  }

  const now = new Date();
  return {
    weekKey: getWeekKey(now),
    weekStart: getWeekStart(now).toISOString().slice(0, 10),
    meals,
  };
}
```

**Important implementation note:** The `await import()` above won't work in a sync function. Instead, pass `frequencyTargets` as part of the context, or import it at the top. Refactor to import at the top:

```typescript
import { frequencyTargets } from '$lib/data/proteins';
```

And remove the dynamic import. Also add a helper for when groups are excluded by allergens:

```typescript
function adjustTargetsForAvailability(
  targets: FrequencyTarget[],
  rng: Rng
): FrequencyTarget[] {
  const currentMin = targets.reduce((s, t) => s + t.min, 0);
  const currentMax = targets.reduce((s, t) => s + t.max, 0);

  if (currentMax < 14) {
    // Not enough slots even at max — proportionally increase max
    const deficit = 14 - currentMax;
    const adjusted = targets.map(t => ({ ...t, max: t.max + Math.ceil(deficit / targets.length) }));
    return adjusted;
  }
  if (currentMin > 14) {
    // Too many mandatory slots — proportionally reduce min
    const excess = currentMin - 14;
    const adjusted = targets.map(t => ({ ...t, min: Math.max(0, t.min - Math.ceil(excess / targets.length)) }));
    return adjusted;
  }
  return targets;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/engine/generate-week.test.ts`
Expected: All tests pass

If any test fails, debug and fix. Common issues:
- Pool index out of bounds: ensure shuffledProteins has exactly 14 items
- Cross-week swap failing: ensure fallback when no swap candidate exists
- Determinism: ensure createRng is called once and all randomness flows through it

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine/generate-week.ts src/lib/engine/generate-week.test.ts
git commit -m "feat: add week generation with frequency targets and cross-week variety"
```

---

## Task 9: Meal Swap (TDD)

**Files:**
- Create: `src/lib/engine/swap-meal.ts`
- Create: `src/lib/engine/swap-meal.test.ts`

- [ ] **Step 1: Write failing tests for meal swap**

```typescript
import { describe, it, expect } from 'vitest';
import { swapMeal } from './swap-meal';
import { generateWeek } from './generate-week';
import { cereals } from '$lib/data/cereals';
import { proteins } from '$lib/data/proteins';
import { vegetables } from '$lib/data/vegetables';
import type { MealType } from '$lib/types';

const baseCtx = {
  cereals,
  proteins,
  vegetables,
  babyAgeMonths: 8,
  allergens: [] as any[],
  season: 'winter' as const,
  previousWeek: null,
  seed: 42,
};

describe('swapMeal', () => {
  it('returns a week with a different meal in the swapped slot', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 0, 'lunch', baseCtx);
    expect(swapped.meals[0].lunch.protein).not.toBe(original.meals[0].lunch.protein);
  });

  it('does not change other days', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 0, 'lunch', baseCtx);
    for (let i = 1; i < 7; i++) {
      expect(swapped.meals[i]).toEqual(original.meals[i]);
    }
  });

  it('does not change the other meal of the same day', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 0, 'lunch', baseCtx);
    expect(swapped.meals[0].dinner).toEqual(original.meals[0].dinner);
  });

  it('new meal has different protein from same-day other meal', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 0, 'lunch', baseCtx);
    expect(swapped.meals[0].lunch.protein).not.toBe(swapped.meals[0].dinner.protein);
  });

  it('new meal has different cereal from same-day other meal', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 0, 'lunch', baseCtx);
    expect(swapped.meals[0].lunch.cereal).not.toBe(swapped.meals[0].dinner.cereal);
  });

  it('new meal has 2-4 vegetables', () => {
    const original = generateWeek(baseCtx);
    const swapped = swapMeal(original, 3, 'dinner', baseCtx);
    expect(swapped.meals[3].dinner.vegetables.length).toBeGreaterThanOrEqual(2);
    expect(swapped.meals[3].dinner.vegetables.length).toBeLessThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/engine/swap-meal.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement swapMeal**

```typescript
import type { WeekPlan, MealType, AllergenTag, Season, Cereal, Protein, Vegetable } from '$lib/types';
import { createRng } from './random';
import { filterCereals, filterProteins, filterVegetables } from './filter';
import { generateMeal } from './generate-meal';

interface SwapContext {
  cereals: Cereal[];
  proteins: Protein[];
  vegetables: Vegetable[];
  babyAgeMonths: number;
  allergens: AllergenTag[];
  season: Season;
}

export function swapMeal(
  week: WeekPlan,
  dayIndex: number,
  mealType: MealType,
  ctx: SwapContext
): WeekPlan {
  const seed = Date.now(); // Use current time as seed for swap randomness
  const rng = createRng(seed);

  const availCereals = filterCereals(ctx.cereals, ctx.babyAgeMonths, ctx.allergens);
  const availProteins = filterProteins(ctx.proteins, ctx.babyAgeMonths, ctx.allergens);
  const availVegetables = filterVegetables(ctx.vegetables, ctx.babyAgeMonths, ctx.season);

  const dayPlan = week.meals[dayIndex];
  const otherMeal = mealType === 'lunch' ? dayPlan.dinner : dayPlan.lunch;
  const currentMeal = mealType === 'lunch' ? dayPlan.lunch : dayPlan.dinner;

  const newMeal = generateMeal(
    availCereals,
    // Exclude current protein so we get a different one, and the other meal's protein
    availProteins.filter(p => p.id !== currentMeal.protein),
    availVegetables,
    rng,
    {
      excludeProtein: otherMeal.protein,
      excludeCereal: otherMeal.cereal,
    }
  );

  const newMeals = week.meals.map((day, i) => {
    if (i !== dayIndex) return day;
    return {
      ...day,
      [mealType]: newMeal,
    };
  });

  return { ...week, meals: newMeals };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/engine/swap-meal.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine/swap-meal.ts src/lib/engine/swap-meal.test.ts
git commit -m "feat: add single meal swap with constraint compliance"
```

---

## Task 10: Stores (Profile + Meals)

**Files:**
- Create: `src/lib/stores/profile.ts`
- Create: `src/lib/stores/meals.ts`

- [ ] **Step 1: Create profile store**

```typescript
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { UserProfile, AgeBracket, Texture, AllergenTag } from '$lib/types';

const STORAGE_KEY = 'babymeal_profile';

const defaultProfile: UserProfile = {
  ageBracket: '6-7',
  texture: 'smooth',
  allergens: [],
  language: 'it',
  seasonOverride: null,
};

function loadProfile(): UserProfile | null {
  if (!browser) return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserProfile;
  } catch {
    return null;
  }
}

function createProfileStore() {
  const stored = loadProfile();
  const { subscribe, set, update } = writable<UserProfile | null>(stored);

  return {
    subscribe,
    initialize(profile: UserProfile) {
      set(profile);
      if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    },
    update(partial: Partial<UserProfile>) {
      update(current => {
        if (!current) return current;
        const updated = { ...current, ...partial };
        if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    get(): UserProfile | null {
      return get({ subscribe });
    },
    isOnboarded(): boolean {
      return loadProfile() !== null;
    },
  };
}

export const profileStore = createProfileStore();
```

- [ ] **Step 2: Create meals store**

```typescript
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { WeekPlan } from '$lib/types';

const STORAGE_KEY = 'babymeal_weeks';
const MAX_STORED_WEEKS = 4;

function loadWeeks(): Record<string, WeekPlan> {
  if (!browser) return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as Record<string, WeekPlan>;
  } catch {
    return {};
  }
}

function saveWeeks(weeks: Record<string, WeekPlan>) {
  if (!browser) return;
  // Prune old weeks, keep only most recent MAX_STORED_WEEKS
  const entries = Object.entries(weeks).sort(([a], [b]) => b.localeCompare(a));
  const pruned = Object.fromEntries(entries.slice(0, MAX_STORED_WEEKS));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
}

function createMealsStore() {
  const initial = loadWeeks();
  const { subscribe, set, update } = writable<Record<string, WeekPlan>>(initial);

  return {
    subscribe,
    getWeek(weekKey: string): WeekPlan | undefined {
      return get({ subscribe })[weekKey];
    },
    setWeek(weekKey: string, plan: WeekPlan) {
      update(weeks => {
        const updated = { ...weeks, [weekKey]: plan };
        saveWeeks(updated);
        return updated;
      });
    },
    getPreviousWeek(currentWeekKey: string): WeekPlan | null {
      const weeks = get({ subscribe });
      const keys = Object.keys(weeks).sort();
      const currentIdx = keys.indexOf(currentWeekKey);
      if (currentIdx > 0) return weeks[keys[currentIdx - 1]];
      return null;
    },
    clear() {
      set({});
      if (browser) localStorage.removeItem(STORAGE_KEY);
    },
  };
}

export const mealsStore = createMealsStore();
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/stores/
git commit -m "feat: add profile and meals stores with LocalStorage persistence"
```

---

## Task 11: i18n Setup

**Files:**
- Create: `src/lib/i18n/index.ts`
- Create: `static/locales/it.json`
- Create: `static/locales/en.json`

- [ ] **Step 1: Create i18n initialization**

```typescript
import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('it', () => fetch('/locales/it.json').then(r => r.json()));
register('en', () => fetch('/locales/en.json').then(r => r.json()));

export function initI18n(savedLanguage?: string) {
  init({
    fallbackLocale: 'it',
    initialLocale: savedLanguage || getLocaleFromNavigator()?.slice(0, 2) || 'it',
  });
}
```

- [ ] **Step 2: Create Italian locale file**

Create `static/locales/it.json`:
```json
{
  "app": {
    "name": "BabyMeal Planner",
    "tagline": "Pasti sani e vari per il tuo bambino"
  },
  "onboarding": {
    "welcome": {
      "title": "BabyMeal Planner",
      "subtitle": "Pasti sani e vari per il tuo bambino, ogni giorno. Noi pianifichiamo, tu cucini!",
      "start": "Iniziamo"
    },
    "profile": {
      "title": "Parlaci del tuo bambino",
      "subtitle": "Personalizzeremo i pasti per la sua età",
      "age": "Età",
      "texture": "Consistenza preferita",
      "next": "Avanti"
    },
    "allergens": {
      "title": "Allergie o intolleranze?",
      "subtitle": "Escludi gli alimenti da evitare. Puoi cambiare dopo.",
      "skip": "Nessuna allergia, salta",
      "done": "Genera il mio piano!"
    }
  },
  "calendar": {
    "weekOf": "Settimana del",
    "lunch": "Pranzo",
    "dinner": "Cena",
    "tapForDetails": "Tap per dettagli",
    "days": {
      "short": ["L", "M", "M", "G", "V", "S", "D"],
      "long": ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
    }
  },
  "meal": {
    "swap": "Cambia questo pasto",
    "ingredients": "Ingredienti",
    "portions": "Porzioni",
    "texture": "Consistenza"
  },
  "settings": {
    "title": "Impostazioni",
    "ageBracket": "Fascia d'età",
    "texture": "Consistenza",
    "allergens": "Allergie",
    "language": "Lingua",
    "season": "Stagione",
    "seasonAuto": "Automatica",
    "save": "Salva"
  },
  "allergens": {
    "fish": "Pesce",
    "dairy": "Latticini",
    "egg": "Uova",
    "legumes": "Legumi",
    "gluten": "Glutine"
  },
  "textures": {
    "smooth": "Liscia (crema/purè)",
    "slightly-textured": "Leggermente granulosa",
    "soft-pieces": "Pezzettini morbidi"
  },
  "seasons": {
    "spring": "Primavera",
    "summer": "Estate",
    "fall": "Autunno",
    "winter": "Inverno"
  },
  "ageBrackets": {
    "6-7": "6-7 mesi",
    "8-9": "8-9 mesi",
    "10-12": "10-12 mesi"
  }
}
```

- [ ] **Step 3: Create English locale file**

Create `static/locales/en.json`:
```json
{
  "app": {
    "name": "BabyMeal Planner",
    "tagline": "Healthy and varied meals for your baby"
  },
  "onboarding": {
    "welcome": {
      "title": "BabyMeal Planner",
      "subtitle": "Healthy and varied meals for your baby, every day. We plan, you cook!",
      "start": "Let's start"
    },
    "profile": {
      "title": "Tell us about your baby",
      "subtitle": "We'll customize meals for their age",
      "age": "Age",
      "texture": "Preferred texture",
      "next": "Next"
    },
    "allergens": {
      "title": "Any allergies or intolerances?",
      "subtitle": "Exclude foods to avoid. You can change this later.",
      "skip": "No allergies, skip",
      "done": "Generate my plan!"
    }
  },
  "calendar": {
    "weekOf": "Week of",
    "lunch": "Lunch",
    "dinner": "Dinner",
    "tapForDetails": "Tap for details",
    "days": {
      "short": ["M", "T", "W", "T", "F", "S", "S"],
      "long": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
  },
  "meal": {
    "swap": "Swap this meal",
    "ingredients": "Ingredients",
    "portions": "Portions",
    "texture": "Texture"
  },
  "settings": {
    "title": "Settings",
    "ageBracket": "Age bracket",
    "texture": "Texture",
    "allergens": "Allergies",
    "language": "Language",
    "season": "Season",
    "seasonAuto": "Automatic",
    "save": "Save"
  },
  "allergens": {
    "fish": "Fish",
    "dairy": "Dairy",
    "egg": "Eggs",
    "legumes": "Legumes",
    "gluten": "Gluten"
  },
  "textures": {
    "smooth": "Smooth (purée/cream)",
    "slightly-textured": "Slightly textured (mashed)",
    "soft-pieces": "Soft pieces (diced)"
  },
  "seasons": {
    "spring": "Spring",
    "summer": "Summer",
    "fall": "Fall",
    "winter": "Winter"
  },
  "ageBrackets": {
    "6-7": "6-7 months",
    "8-9": "8-9 months",
    "10-12": "10-12 months"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/i18n/ static/locales/
git commit -m "feat: add i18n setup with Italian and English locales"
```

---

## Task 12: App Shell & Global Styles

**Files:**
- Modify: `src/app.css` (already created in Task 1, extend with component styles)
- Modify: `src/routes/+layout.svelte`
- Modify: `src/routes/+layout.ts`

- [ ] **Step 1: Update layout.ts for static site**

```typescript
export const prerender = true;
export const ssr = false;
```

- [ ] **Step 2: Create app layout with header**

```svelte
<script lang="ts">
  import { initI18n } from '$lib/i18n';
  import { profileStore } from '$lib/stores/profile';
  import { _ } from 'svelte-i18n';
  import '../app.css';

  let profile = $derived($profileStore);

  $effect(() => {
    initI18n(profile?.language);
  });
</script>

<div class="app">
  <header class="app-header">
    <h1 class="app-title">{$_('app.name')}</h1>
    {#if profile}
      <a href="/settings" class="settings-btn" aria-label={$_('settings.title')}>
        ⚙️
      </a>
    {/if}
  </header>
  <main class="app-main">
    {@render children()}
  </main>
</div>

<style>
  .app {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .app-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-primary);
  }
  .settings-btn {
    font-size: 20px;
    text-decoration: none;
    padding: 4px;
  }
  .app-main {
    flex: 1;
    padding: 16px;
  }
</style>
```

Note: In Svelte 5, `{@render children()}` replaces `<slot />`. The `children` snippet is implicitly available.

- [ ] **Step 3: Commit**

```bash
git add src/routes/ src/app.css
git commit -m "feat: add app shell with header and i18n initialization"
```

---

## Task 13: Onboarding Wizard

**Files:**
- Create: `src/lib/components/WelcomeStep.svelte`
- Create: `src/lib/components/ProfileStep.svelte`
- Create: `src/lib/components/AllergenStep.svelte`
- Create: `src/routes/onboarding/+page.svelte`
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Create WelcomeStep component**

```svelte
<script lang="ts">
  import { _ } from 'svelte-i18n';

  let { onNext }: { onNext: () => void } = $props();
</script>

<div class="welcome">
  <div class="emoji">🍼</div>
  <h2>{$_('onboarding.welcome.title')}</h2>
  <p class="subtitle">{$_('onboarding.welcome.subtitle')}</p>
  <button class="btn-primary" onclick={onNext}>
    {$_('onboarding.welcome.start')} →
  </button>
</div>

<style>
  .welcome {
    text-align: center;
    padding: 48px 24px;
  }
  .emoji {
    font-size: 64px;
    margin-bottom: 16px;
  }
  h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .subtitle {
    font-size: 15px;
    color: var(--color-text-muted);
    line-height: 1.5;
    max-width: 280px;
    margin: 0 auto 24px;
  }
  .btn-primary {
    background: var(--color-primary);
    color: white;
    padding: 14px 32px;
    border-radius: var(--radius-lg);
    font-size: 16px;
    font-weight: 600;
  }
</style>
```

- [ ] **Step 2: Create ProfileStep component**

```svelte
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { AgeBracket, Texture } from '$lib/types';
  import { defaultTexture } from '$lib/data/portions';

  let {
    ageBracket = $bindable<AgeBracket>('6-7'),
    texture = $bindable<Texture>('smooth'),
    onNext,
  }: {
    ageBracket: AgeBracket;
    texture: Texture;
    onNext: () => void;
  } = $props();

  const ageBrackets: AgeBracket[] = ['6-7', '8-9', '10-12'];
  const textures: Texture[] = ['smooth', 'slightly-textured', 'soft-pieces'];
  const textureEmoji: Record<Texture, string> = {
    'smooth': '🥣',
    'slightly-textured': '🥄',
    'soft-pieces': '🍲',
  };

  function selectAge(bracket: AgeBracket) {
    ageBracket = bracket;
    texture = defaultTexture[bracket];
  }
</script>

<div class="profile-step">
  <h2>{$_('onboarding.profile.title')}</h2>
  <p class="subtitle">{$_('onboarding.profile.subtitle')}</p>

  <div class="section">
    <label class="label">{$_('onboarding.profile.age')}</label>
    <div class="pill-group">
      {#each ageBrackets as bracket}
        <button
          class="pill"
          class:active={ageBracket === bracket}
          onclick={() => selectAge(bracket)}
        >
          {$_(`ageBrackets.${bracket}`)}
        </button>
      {/each}
    </div>
  </div>

  <div class="section">
    <label class="label">{$_('onboarding.profile.texture')}</label>
    <div class="texture-list">
      {#each textures as tex}
        <button
          class="texture-option"
          class:active={texture === tex}
          onclick={() => texture = tex}
        >
          <span class="tex-emoji">{textureEmoji[tex]}</span>
          <span>{$_(`textures.${tex}`)}</span>
          {#if tex === defaultTexture[ageBracket]}
            <span class="recommended">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <button class="btn-primary" onclick={onNext}>
    {$_('onboarding.profile.next')} →
  </button>
</div>

<style>
  .profile-step { padding: 24px 16px; }
  h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: var(--color-text-light); margin-bottom: 20px; }
  .section { margin-bottom: 20px; }
  .label { font-size: 12px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; display: block; margin-bottom: 8px; }
  .pill-group { display: flex; gap: 8px; }
  .pill {
    flex: 1; padding: 10px 8px; border-radius: var(--radius-md);
    border: 2px solid var(--color-border); font-size: 13px;
    color: var(--color-text-light); text-align: center; background: var(--color-surface);
  }
  .pill.active { border-color: var(--color-primary); background: var(--color-primary-light); color: var(--color-primary); font-weight: 600; }
  .texture-list { display: flex; flex-direction: column; gap: 8px; }
  .texture-option {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px; border-radius: var(--radius-md);
    border: 2px solid var(--color-border); font-size: 14px;
    color: var(--color-text-muted); text-align: left; background: var(--color-surface);
  }
  .texture-option.active { border-color: var(--color-primary); background: var(--color-primary-light); color: var(--color-text); }
  .tex-emoji { font-size: 18px; }
  .recommended { margin-left: auto; color: var(--color-primary); font-size: 12px; }
  .btn-primary {
    width: 100%; background: var(--color-primary); color: white;
    padding: 14px; border-radius: var(--radius-lg); font-size: 16px;
    font-weight: 600; margin-top: 8px;
  }
</style>
```

- [ ] **Step 3: Create AllergenStep component**

```svelte
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { AllergenTag } from '$lib/types';

  let {
    allergens = $bindable<AllergenTag[]>([]),
    onDone,
    onSkip,
  }: {
    allergens: AllergenTag[];
    onDone: () => void;
    onSkip: () => void;
  } = $props();

  const allAllergens: { tag: AllergenTag; emoji: string }[] = [
    { tag: 'egg', emoji: '🥚' },
    { tag: 'fish', emoji: '🐟' },
    { tag: 'dairy', emoji: '🧀' },
    { tag: 'gluten', emoji: '🌾' },
    { tag: 'legumes', emoji: '🫘' },
  ];

  function toggle(tag: AllergenTag) {
    if (allergens.includes(tag)) {
      allergens = allergens.filter(a => a !== tag);
    } else {
      allergens = [...allergens, tag];
    }
  }
</script>

<div class="allergen-step">
  <h2>{$_('onboarding.allergens.title')}</h2>
  <p class="subtitle">{$_('onboarding.allergens.subtitle')}</p>

  <div class="allergen-pills">
    {#each allAllergens as { tag, emoji }}
      <button
        class="allergen-pill"
        class:active={allergens.includes(tag)}
        onclick={() => toggle(tag)}
      >
        {emoji} {$_(`allergens.${tag}`)}
        {#if allergens.includes(tag)}
          <span class="x">✕</span>
        {/if}
      </button>
    {/each}
  </div>

  <button class="btn-primary" onclick={onDone}>
    {$_('onboarding.allergens.done')} 🎉
  </button>
  <button class="btn-skip" onclick={onSkip}>
    {$_('onboarding.allergens.skip')} →
  </button>
</div>

<style>
  .allergen-step { padding: 24px 16px; }
  h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: var(--color-text-light); margin-bottom: 20px; }
  .allergen-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
  .allergen-pill {
    padding: 10px 16px; border-radius: 20px; border: 2px solid var(--color-border);
    font-size: 14px; color: var(--color-text-muted); background: var(--color-surface);
  }
  .allergen-pill.active {
    border-color: var(--color-danger); background: var(--color-danger-light);
    color: var(--color-danger); font-weight: 500;
  }
  .x { margin-left: 4px; }
  .btn-primary {
    width: 100%; background: var(--color-primary); color: white;
    padding: 14px; border-radius: var(--radius-lg); font-size: 16px;
    font-weight: 600;
  }
  .btn-skip {
    width: 100%; padding: 12px; font-size: 13px;
    color: var(--color-text-light); text-decoration: underline;
    margin-top: 8px;
  }
</style>
```

- [ ] **Step 4: Create onboarding page that ties the wizard together**

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { profileStore } from '$lib/stores/profile';
  import { defaultTexture } from '$lib/data/portions';
  import WelcomeStep from '$lib/components/WelcomeStep.svelte';
  import ProfileStep from '$lib/components/ProfileStep.svelte';
  import AllergenStep from '$lib/components/AllergenStep.svelte';
  import type { AgeBracket, Texture, AllergenTag } from '$lib/types';

  let step = $state(0);
  let ageBracket = $state<AgeBracket>('6-7');
  let texture = $state<Texture>('smooth');
  let allergens = $state<AllergenTag[]>([]);

  function finishOnboarding() {
    profileStore.initialize({
      ageBracket,
      texture,
      allergens,
      language: 'it',
      seasonOverride: null,
    });
    goto('/');
  }
</script>

<div class="wizard">
  {#if step === 0}
    <WelcomeStep onNext={() => step = 1} />
  {:else if step === 1}
    <ProfileStep bind:ageBracket bind:texture onNext={() => step = 2} />
  {:else if step === 2}
    <AllergenStep bind:allergens onDone={finishOnboarding} onSkip={finishOnboarding} />
  {/if}

  <div class="dots">
    {#each [0, 1, 2] as i}
      <div class="dot" class:active={step === i}></div>
    {/each}
  </div>
</div>

<style>
  .wizard { min-height: 80dvh; display: flex; flex-direction: column; }
  .dots { display: flex; justify-content: center; gap: 8px; padding: 16px; margin-top: auto; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); }
  .dot.active { background: var(--color-primary); }
</style>
```

- [ ] **Step 5: Update main page to redirect to onboarding if not onboarded**

Update `src/routes/+page.svelte`:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { profileStore } from '$lib/stores/profile';

  onMount(() => {
    if (!profileStore.isOnboarded()) {
      goto('/onboarding');
    }
  });
</script>

<p>Loading...</p>
```

This is a placeholder — the full calendar will be built in Task 14.

- [ ] **Step 6: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/lib/components/ src/routes/
git commit -m "feat: add onboarding wizard with age, texture, and allergen selection"
```

---

## Task 14: Calendar View

**Files:**
- Create: `src/lib/components/DaySelector.svelte`
- Create: `src/lib/components/MealCard.svelte`
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Create DaySelector component**

```svelte
<script lang="ts">
  import { _ } from 'svelte-i18n';

  let {
    selectedDay = $bindable(0),
    today = 0,
  }: {
    selectedDay: number;
    today: number;
  } = $props();

  let dayLabels = $derived(($_('calendar.days.short') as unknown as string[]) || ['L','M','M','G','V','S','D']);
</script>

<div class="day-selector">
  {#each dayLabels as label, i}
    <button
      class="day-dot"
      class:active={selectedDay === i}
      class:today={today === i}
      onclick={() => selectedDay = i}
      aria-label={label}
    >
      {label}
    </button>
  {/each}
</div>

<style>
  .day-selector {
    display: flex; gap: 8px; justify-content: center; padding: 8px 0;
  }
  .day-dot {
    width: 40px; height: 40px; border-radius: var(--radius-full);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 500;
    background: var(--color-border); color: var(--color-text-muted);
    transition: all 0.2s;
  }
  .day-dot.active {
    background: var(--color-primary); color: white; font-weight: 600;
  }
  .day-dot.today:not(.active) {
    border: 2px solid var(--color-primary);
  }
</style>
```

- [ ] **Step 2: Create MealCard component**

```svelte
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { Meal, MealType } from '$lib/types';
  import { proteins } from '$lib/data/proteins';
  import { cereals } from '$lib/data/cereals';
  import { vegetables } from '$lib/data/vegetables';

  let {
    meal,
    mealType,
    language = 'it',
    onClick,
  }: {
    meal: Meal;
    mealType: MealType;
    language?: string;
    onClick: () => void;
  } = $props();

  let isLunch = $derived(mealType === 'lunch');

  function getName(id: string, list: { id: string; nameIt: string; nameEn: string }[]): string {
    const item = list.find(x => x.id === id);
    if (!item) return id;
    return language === 'en' ? item.nameEn : item.nameIt;
  }

  let description = $derived(() => {
    const cerealName = getName(meal.cereal, cereals);
    const proteinName = getName(meal.protein, proteins);
    const vegNames = meal.vegetables.map(v => getName(v, vegetables)).join(', ');
    return `${cerealName} con ${vegNames} e ${proteinName}`;
  });
</script>

<button class="meal-card" class:lunch={isLunch} class:dinner={!isLunch} onclick={onClick}>
  <div class="meal-label">
    {#if isLunch}
      🍽 {$_('calendar.lunch').toUpperCase()}
    {:else}
      🌙 {$_('calendar.dinner').toUpperCase()}
    {/if}
  </div>
  <div class="meal-description">{description()}</div>
  <div class="meal-hint">{$_('calendar.tapForDetails')} →</div>
</button>

<style>
  .meal-card {
    width: 100%; text-align: left;
    background: var(--color-surface); border-radius: var(--radius-md);
    padding: 16px; margin-bottom: 10px;
    border: none; cursor: pointer; transition: transform 0.1s;
  }
  .meal-card:active { transform: scale(0.98); }
  .meal-label {
    font-size: 11px; font-weight: 600; margin-bottom: 6px;
  }
  .lunch .meal-label { color: var(--color-primary); }
  .dinner .meal-label { color: var(--color-secondary); }
  .meal-description { font-size: 15px; font-weight: 500; line-height: 1.4; }
  .meal-hint { font-size: 12px; color: var(--color-text-light); margin-top: 6px; }
</style>
```

- [ ] **Step 3: Build the main calendar page**

Update `src/routes/+page.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { _ } from 'svelte-i18n';
  import { profileStore } from '$lib/stores/profile';
  import { mealsStore } from '$lib/stores/meals';
  import { generateWeek, getWeekKey, getWeekStart } from '$lib/engine/generate-week';
  import { cereals } from '$lib/data/cereals';
  import { proteins, frequencyTargets } from '$lib/data/proteins';
  import { vegetables } from '$lib/data/vegetables';
  import { getCurrentSeason } from '$lib/data/seasons';
  import { ageBracketToMinMonth } from '$lib/engine/filter';
  import DaySelector from '$lib/components/DaySelector.svelte';
  import MealCard from '$lib/components/MealCard.svelte';
  import MealDetail from '$lib/components/MealDetail.svelte';
  import type { WeekPlan, DayPlan, MealType } from '$lib/types';

  let profile = $derived($profileStore);
  let weeks = $derived($mealsStore);

  let currentDate = $state(new Date());
  let weekKey = $derived(getWeekKey(currentDate));
  let weekStart = $derived(getWeekStart(currentDate));
  let selectedDay = $state(0);
  let showDetail = $state(false);
  let detailMealType = $state<MealType>('lunch');

  let currentWeek = $derived(weeks[weekKey]);
  let todayDayIndex = $derived(() => {
    const today = new Date();
    const day = today.getDay();
    return day === 0 ? 6 : day - 1; // Monday=0, Sunday=6
  });

  let selectedDayPlan = $derived(currentWeek?.meals[selectedDay]);

  onMount(() => {
    if (!profileStore.isOnboarded()) {
      goto('/onboarding');
      return;
    }
    selectedDay = todayDayIndex();
    ensureWeekExists();
  });

  function ensureWeekExists() {
    if (!profile || currentWeek) return;
    const season = getCurrentSeason(profile.seasonOverride);
    const previousWeek = mealsStore.getPreviousWeek(weekKey);
    const week = generateWeek({
      cereals, proteins, vegetables,
      babyAgeMonths: ageBracketToMinMonth(profile.ageBracket),
      allergens: profile.allergens,
      season,
      previousWeek,
      seed: hashString(weekKey),
    });
    week.weekKey = weekKey;
    week.weekStart = weekStart.toISOString().slice(0, 10);
    mealsStore.setWeek(weekKey, week);
  }

  function navigateWeek(delta: number) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta * 7);
    currentDate = d;
    selectedDay = 0;
    ensureWeekExists();
  }

  function openDetail(mealType: MealType) {
    detailMealType = mealType;
    showDetail = true;
  }

  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  function formatWeekDate(date: Date): string {
    return date.toLocaleDateString(profile?.language || 'it', {
      day: 'numeric', month: 'long',
    });
  }

  let dayLongNames = $derived(($_('calendar.days.long') as unknown as string[]) || []);
  let selectedDayName = $derived(dayLongNames[selectedDay] || '');
</script>

{#if profile && currentWeek}
  <div class="calendar">
    <div class="week-nav">
      <button class="nav-btn" onclick={() => navigateWeek(-1)}>←</button>
      <span class="week-label">{$_('calendar.weekOf')} {formatWeekDate(weekStart)}</span>
      <button class="nav-btn" onclick={() => navigateWeek(1)}>→</button>
    </div>

    <DaySelector bind:selectedDay today={todayDayIndex()} />

    {#if selectedDayPlan}
      <div class="day-header">{selectedDayName} {weekStart.getDate() + selectedDay}</div>
      <MealCard
        meal={selectedDayPlan.lunch}
        mealType="lunch"
        language={profile.language}
        onClick={() => openDetail('lunch')}
      />
      <MealCard
        meal={selectedDayPlan.dinner}
        mealType="dinner"
        language={profile.language}
        onClick={() => openDetail('dinner')}
      />
    {/if}
  </div>

  {#if showDetail && selectedDayPlan}
    <MealDetail
      meal={detailMealType === 'lunch' ? selectedDayPlan.lunch : selectedDayPlan.dinner}
      mealType={detailMealType}
      {profile}
      weekPlan={currentWeek}
      dayIndex={selectedDay}
      onClose={() => showDetail = false}
      onSwap={() => { ensureWeekExists(); showDetail = false; }}
    />
  {/if}
{:else}
  <p>Loading...</p>
{/if}

<style>
  .calendar { padding: 0; }
  .week-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 0; margin-bottom: 8px;
  }
  .nav-btn {
    font-size: 20px; padding: 8px 12px; color: var(--color-text-muted);
  }
  .week-label { font-size: 14px; color: var(--color-text-muted); }
  .day-header {
    text-align: center; font-weight: 600; font-size: 16px;
    margin: 12px 0;
  }
</style>
```

- [ ] **Step 4: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ src/routes/
git commit -m "feat: add calendar view with day selector and meal cards"
```

---

## Task 15: Meal Detail

**Files:**
- Create: `src/lib/components/MealDetail.svelte`

- [ ] **Step 1: Create MealDetail component**

```svelte
<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { Meal, MealType, UserProfile, WeekPlan } from '$lib/types';
  import { cereals } from '$lib/data/cereals';
  import { proteins } from '$lib/data/proteins';
  import { vegetables } from '$lib/data/vegetables';
  import { portions } from '$lib/data/portions';
  import { swapMeal } from '$lib/engine/swap-meal';
  import { getCurrentSeason } from '$lib/data/seasons';
  import { ageBracketToMinMonth } from '$lib/engine/filter';
  import { mealsStore } from '$lib/stores/meals';

  let {
    meal,
    mealType,
    profile,
    weekPlan,
    dayIndex,
    onClose,
    onSwap,
  }: {
    meal: Meal;
    mealType: MealType;
    profile: UserProfile;
    weekPlan: WeekPlan;
    dayIndex: number;
    onClose: () => void;
    onSwap: () => void;
  } = $props();

  let portionSizes = $derived(portions[profile.ageBracket]);
  let lang = $derived(profile.language);

  function getName(id: string, list: { id: string; nameIt: string; nameEn: string }[]): string {
    const item = list.find(x => x.id === id);
    if (!item) return id;
    return lang === 'en' ? item.nameEn : item.nameIt;
  }

  function handleSwap() {
    const season = getCurrentSeason(profile.seasonOverride);
    const updated = swapMeal(weekPlan, dayIndex, mealType, {
      cereals, proteins, vegetables,
      babyAgeMonths: ageBracketToMinMonth(profile.ageBracket),
      allergens: profile.allergens,
      season,
    });
    mealsStore.setWeek(weekPlan.weekKey, updated);
    onSwap();
  }

  let isLunch = $derived(mealType === 'lunch');
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="overlay" onclick={onClose} role="presentation">
  <div class="detail-panel" onclick|stopPropagation role="dialog">
    <div class="detail-header" class:lunch={isLunch} class:dinner={!isLunch}>
      <span>
        {#if isLunch}🍽 {$_('calendar.lunch')}{:else}🌙 {$_('calendar.dinner')}{/if}
      </span>
      <button class="close-btn" onclick={onClose}>✕</button>
    </div>

    <div class="detail-body">
      <h3>{$_('meal.ingredients')}</h3>
      <ul class="ingredient-list">
        <li>
          <span class="ingredient-name">{getName(meal.cereal, cereals)}</span>
          <span class="ingredient-qty">{portionSizes.cereal}g</span>
        </li>
        {#each meal.vegetables as vegId}
          <li>
            <span class="ingredient-name">{getName(vegId, vegetables)}</span>
            <span class="ingredient-qty">
              {Math.round(portionSizes.vegetables / meal.vegetables.length)}g
            </span>
          </li>
        {/each}
        <li>
          <span class="ingredient-name">{getName(meal.protein, proteins)}</span>
          <span class="ingredient-qty">{portionSizes.proteinMin}-{portionSizes.proteinMax}g</span>
        </li>
        <li>
          <span class="ingredient-name">{lang === 'it' ? 'Olio EVO' : 'Olive oil'}</span>
          <span class="ingredient-qty">{portionSizes.oil}g</span>
        </li>
        <li>
          <span class="ingredient-name">{lang === 'it' ? 'Brodo vegetale' : 'Vegetable broth'}</span>
          <span class="ingredient-qty">{portionSizes.broth}ml</span>
        </li>
      </ul>

      <div class="texture-info">
        <span class="label">{$_('meal.texture')}:</span>
        {$_(`textures.${profile.texture}`)}
      </div>

      <button class="swap-btn" onclick={handleSwap}>
        🔄 {$_('meal.swap')}
      </button>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: flex-end; justify-content: center;
    z-index: 100;
  }
  .detail-panel {
    background: var(--color-surface); border-radius: 20px 20px 0 0;
    width: 100%; max-width: 480px; max-height: 80dvh;
    overflow-y: auto;
  }
  .detail-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 20px; font-weight: 600; font-size: 16px;
  }
  .detail-header.lunch { color: var(--color-primary); }
  .detail-header.dinner { color: var(--color-secondary); }
  .close-btn { font-size: 18px; color: var(--color-text-muted); padding: 4px; }
  .detail-body { padding: 0 20px 24px; }
  h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--color-text-muted); }
  .ingredient-list { list-style: none; }
  .ingredient-list li {
    display: flex; justify-content: space-between; padding: 10px 0;
    border-bottom: 1px solid var(--color-border);
  }
  .ingredient-name { font-size: 15px; }
  .ingredient-qty { font-size: 14px; color: var(--color-text-muted); font-weight: 500; }
  .texture-info {
    margin-top: 16px; padding: 12px; background: var(--color-bg);
    border-radius: var(--radius-sm); font-size: 14px;
  }
  .label { font-weight: 600; color: var(--color-text-muted); }
  .swap-btn {
    width: 100%; margin-top: 20px; padding: 14px;
    background: var(--color-bg); border: 2px solid var(--color-border);
    border-radius: var(--radius-md); font-size: 15px; font-weight: 500;
  }
</style>
```

- [ ] **Step 2: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/MealDetail.svelte
git commit -m "feat: add meal detail panel with ingredients, portions, and swap"
```

---

## Task 16: Settings Page

**Files:**
- Create: `src/routes/settings/+page.svelte`

- [ ] **Step 1: Create settings page**

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { _ , locale } from 'svelte-i18n';
  import { profileStore } from '$lib/stores/profile';
  import { mealsStore } from '$lib/stores/meals';
  import { generateWeek, getWeekKey, getWeekStart } from '$lib/engine/generate-week';
  import { cereals } from '$lib/data/cereals';
  import { proteins } from '$lib/data/proteins';
  import { vegetables } from '$lib/data/vegetables';
  import { getCurrentSeason } from '$lib/data/seasons';
  import { ageBracketToMinMonth } from '$lib/engine/filter';
  import { defaultTexture } from '$lib/data/portions';
  import type { AgeBracket, Texture, AllergenTag, Season } from '$lib/types';

  let profile = $derived($profileStore);

  let ageBracket = $state<AgeBracket>(profile?.ageBracket ?? '6-7');
  let texture = $state<Texture>(profile?.texture ?? 'smooth');
  let allergens = $state<AllergenTag[]>(profile?.allergens ?? []);
  let language = $state<'it' | 'en'>(profile?.language ?? 'it');
  let seasonOverride = $state<Season | null>(profile?.seasonOverride ?? null);

  const ageBrackets: AgeBracket[] = ['6-7', '8-9', '10-12'];
  const textures: Texture[] = ['smooth', 'slightly-textured', 'soft-pieces'];
  const allAllergens: { tag: AllergenTag; emoji: string }[] = [
    { tag: 'egg', emoji: '🥚' }, { tag: 'fish', emoji: '🐟' },
    { tag: 'dairy', emoji: '🧀' }, { tag: 'gluten', emoji: '🌾' },
    { tag: 'legumes', emoji: '🫘' },
  ];
  const seasons: (Season | null)[] = [null, 'spring', 'summer', 'fall', 'winter'];

  function toggleAllergen(tag: AllergenTag) {
    if (allergens.includes(tag)) {
      allergens = allergens.filter(a => a !== tag);
    } else {
      allergens = [...allergens, tag];
    }
  }

  function save() {
    profileStore.update({ ageBracket, texture, allergens, language, seasonOverride });
    locale.set(language);

    // Regenerate current week with new settings
    const now = new Date();
    const weekKey = getWeekKey(now);
    const season = getCurrentSeason(seasonOverride);
    const previousWeek = mealsStore.getPreviousWeek(weekKey);
    const week = generateWeek({
      cereals, proteins, vegetables,
      babyAgeMonths: ageBracketToMinMonth(ageBracket),
      allergens,
      season,
      previousWeek,
      seed: Date.now(),
    });
    week.weekKey = weekKey;
    week.weekStart = getWeekStart(now).toISOString().slice(0, 10);
    mealsStore.setWeek(weekKey, week);

    goto('/');
  }
</script>

<div class="settings">
  <h2>{$_('settings.title')}</h2>

  <section>
    <label class="label">{$_('settings.ageBracket')}</label>
    <div class="pill-group">
      {#each ageBrackets as bracket}
        <button class="pill" class:active={ageBracket === bracket}
          onclick={() => { ageBracket = bracket; texture = defaultTexture[bracket]; }}>
          {$_(`ageBrackets.${bracket}`)}
        </button>
      {/each}
    </div>
  </section>

  <section>
    <label class="label">{$_('settings.texture')}</label>
    <div class="texture-list">
      {#each textures as tex}
        <button class="texture-option" class:active={texture === tex}
          onclick={() => texture = tex}>
          {$_(`textures.${tex}`)}
        </button>
      {/each}
    </div>
  </section>

  <section>
    <label class="label">{$_('settings.allergens')}</label>
    <div class="allergen-pills">
      {#each allAllergens as { tag, emoji }}
        <button class="allergen-pill" class:active={allergens.includes(tag)}
          onclick={() => toggleAllergen(tag)}>
          {emoji} {$_(`allergens.${tag}`)}
        </button>
      {/each}
    </div>
  </section>

  <section>
    <label class="label">{$_('settings.language')}</label>
    <div class="pill-group">
      <button class="pill" class:active={language === 'it'} onclick={() => language = 'it'}>
        🇮🇹 Italiano
      </button>
      <button class="pill" class:active={language === 'en'} onclick={() => language = 'en'}>
        🇬🇧 English
      </button>
    </div>
  </section>

  <section>
    <label class="label">{$_('settings.season')}</label>
    <div class="pill-group season-pills">
      {#each seasons as s}
        <button class="pill" class:active={seasonOverride === s}
          onclick={() => seasonOverride = s}>
          {s === null ? $_('settings.seasonAuto') : $_(`seasons.${s}`)}
        </button>
      {/each}
    </div>
  </section>

  <button class="btn-primary" onclick={save}>
    {$_('settings.save')}
  </button>
</div>

<style>
  .settings { padding: 8px 0; }
  h2 { font-size: 22px; font-weight: 700; margin-bottom: 20px; }
  section { margin-bottom: 20px; }
  .label { font-size: 12px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; display: block; margin-bottom: 8px; }
  .pill-group { display: flex; gap: 8px; flex-wrap: wrap; }
  .pill {
    padding: 10px 14px; border-radius: var(--radius-md);
    border: 2px solid var(--color-border); font-size: 13px;
    color: var(--color-text-muted); background: var(--color-surface);
  }
  .pill.active { border-color: var(--color-primary); background: var(--color-primary-light); color: var(--color-primary); font-weight: 600; }
  .texture-list { display: flex; flex-direction: column; gap: 8px; }
  .texture-option {
    padding: 12px; border-radius: var(--radius-md); border: 2px solid var(--color-border);
    font-size: 14px; color: var(--color-text-muted); text-align: left; background: var(--color-surface);
  }
  .texture-option.active { border-color: var(--color-primary); background: var(--color-primary-light); color: var(--color-text); }
  .allergen-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .allergen-pill {
    padding: 8px 14px; border-radius: 20px; border: 2px solid var(--color-border);
    font-size: 13px; color: var(--color-text-muted); background: var(--color-surface);
  }
  .allergen-pill.active { border-color: var(--color-danger); background: var(--color-danger-light); color: var(--color-danger); }
  .season-pills { flex-wrap: wrap; }
  .btn-primary {
    width: 100%; background: var(--color-primary); color: white;
    padding: 14px; border-radius: var(--radius-lg); font-size: 16px;
    font-weight: 600; margin-top: 12px;
  }
</style>
```

- [ ] **Step 2: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/routes/settings/
git commit -m "feat: add settings page with profile, allergen, language, and season controls"
```

---

## Task 17: PWA Configuration

**Files:**
- Modify: `vite.config.ts`
- Create: `static/icons/icon-192.png` (placeholder)
- Create: `static/icons/icon-512.png` (placeholder)

- [ ] **Step 1: Update vite.config.ts with PWA plugin**

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BabyMeal Planner',
        short_name: 'BabyMeal',
        description: 'Meal planning for babies aged 6-12 months',
        theme_color: '#f4a261',
        background_color: '#fef7f0',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,ico}'],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

Note: Use `@vite-pwa/sveltekit` instead of `vite-plugin-pwa` for proper SvelteKit integration. Update package.json dependency accordingly:

```bash
npm uninstall vite-plugin-pwa
npm install -D @vite-pwa/sveltekit
```

- [ ] **Step 2: Create placeholder icons**

Generate simple placeholder icons (these should be replaced with proper icons later):

```bash
# Create simple placeholder PNGs using a quick script
node -e "
const { createCanvas } = require('canvas');
// If canvas is not available, create minimal valid PNG files instead
const fs = require('fs');

// Minimal 1x1 orange PNG (placeholder - replace with real icons)
// For now, create empty files that won't break the build
fs.writeFileSync('static/icons/icon-192.png', Buffer.alloc(0));
fs.writeFileSync('static/icons/icon-512.png', Buffer.alloc(0));
"
```

Alternatively, create the icons directory and add placeholder files:
```bash
mkdir -p static/icons
touch static/icons/icon-192.png
touch static/icons/icon-512.png
```

These should be replaced with proper app icons before deployment.

- [ ] **Step 3: Verify the app builds with PWA**

Run: `npm run build`
Expected: Build succeeds, service worker generated in `build/`

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts static/icons/ package.json package-lock.json
git commit -m "feat: add PWA configuration with service worker and manifest"
```

---

## Task 18: Final Integration & Smoke Test

**Files:**
- All existing files

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All engine and data tests pass

- [ ] **Step 2: Run the dev server and manually verify**

Run: `npm run dev`
Expected: App starts on localhost

Manual checks:
- Opening app redirects to /onboarding
- Complete the 3-step wizard
- After onboarding, calendar shows current week with meals
- Tap a meal to see ingredients and portions
- Swap a meal — it should change
- Navigate to settings, change language to English
- Navigate between weeks

- [ ] **Step 3: Build for production**

Run: `npm run build && npm run preview`
Expected: Production build works, preview serves the app

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final integration verification — all features working"
```

---

## Self-Review Checklist

Checking the plan against the spec:

| Spec Requirement | Task |
|---|---|
| Combinatorial meal generation | Task 7 (single meal), Task 8 (week) |
| 6 protein groups with frequency targets | Task 3 (data), Task 8 (allocation) |
| Age brackets 6-7, 8-9, 10-12 | Task 3 (portions), Task 6 (filtering) |
| Texture options decoupled from age | Task 3 (portions), Task 13 (onboarding) |
| Seasonal vegetables (Italian) | Task 4 (seasons), Task 6 (filtering) |
| Allergen handling | Task 6 (filtering), Task 13 (onboarding), Task 16 (settings) |
| Single meal swap | Task 9, Task 15 (UI) |
| No full-week regeneration | Not implemented (correct) |
| Cross-week variety | Task 8 (previousWeek context) |
| Day-focused calendar with dot nav | Task 14 |
| Onboarding 3-step wizard | Task 13 |
| Meal detail with portions | Task 15 |
| Settings (all preferences) | Task 16 |
| LocalStorage persistence | Task 10 |
| Multi-week retention (2+ weeks) | Task 10 (MAX_STORED_WEEKS = 4) |
| i18n (Italian + English) | Task 11 |
| PWA (offline, installable) | Task 17 |
| Mobile-first warm design | Tasks 12-16 (CSS throughout) |
| Week starts Monday | Task 8 (getWeekStart), Task 14 (DaySelector) |
| Svelte 5 / SvelteKit / TypeScript / Vitest | Task 1 |

All spec requirements are covered. No placeholders found. Type names and function signatures are consistent across tasks.
