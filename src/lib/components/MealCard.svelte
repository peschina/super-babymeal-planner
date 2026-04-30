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

  let description = $derived.by(() => {
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
  <div class="meal-description">{description}</div>
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
