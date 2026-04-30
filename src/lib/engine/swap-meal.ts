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
  const seed = Date.now();
  const rng = createRng(seed);

  const availCereals = filterCereals(ctx.cereals, ctx.babyAgeMonths, ctx.allergens);
  const availProteins = filterProteins(ctx.proteins, ctx.babyAgeMonths, ctx.allergens);
  const availVegetables = filterVegetables(ctx.vegetables, ctx.babyAgeMonths, ctx.season);

  const dayPlan = week.meals[dayIndex];
  const otherMeal = mealType === 'lunch' ? dayPlan.dinner : dayPlan.lunch;
  const currentMeal = mealType === 'lunch' ? dayPlan.lunch : dayPlan.dinner;

  const newMeal = generateMeal(
    availCereals,
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
