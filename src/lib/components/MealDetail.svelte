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

<div class="overlay" onclick={onClose} role="presentation">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div class="detail-panel" onclick={(e) => e.stopPropagation()} role="dialog">
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
