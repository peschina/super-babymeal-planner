<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { _ } from 'svelte-i18n';
  import { profileStore } from '$lib/stores/profile';
  import { mealsStore } from '$lib/stores/meals';
  import { generateWeek, getWeekKey, getWeekStart } from '$lib/engine/generate-week';
  import { cereals } from '$lib/data/cereals';
  import { proteins } from '$lib/data/proteins';
  import { vegetables } from '$lib/data/vegetables';
  import { getCurrentSeason } from '$lib/data/seasons';
  import { ageBracketToMinMonth } from '$lib/engine/filter';
  import DaySelector from '$lib/components/DaySelector.svelte';
  import MealCard from '$lib/components/MealCard.svelte';
  import MealDetail from '$lib/components/MealDetail.svelte';
  import type { MealType } from '$lib/types';

  let profile = $derived($profileStore);
  let weeks = $derived($mealsStore);

  let currentDate = $state(new Date());
  let weekKey = $derived(getWeekKey(currentDate));
  let weekStart = $derived(getWeekStart(currentDate));
  let selectedDay = $state(0);
  let showDetail = $state(false);
  let detailMealType = $state<MealType>('lunch');

  let currentWeek = $derived(weeks[weekKey]);

  function getTodayDayIndex(): number {
    const today = new Date();
    const day = today.getDay();
    return day === 0 ? 6 : day - 1;
  }

  let selectedDayPlan = $derived(currentWeek?.meals[selectedDay]);

  onMount(() => {
    if (!profileStore.isOnboarded()) {
      goto('/onboarding');
      return;
    }
    selectedDay = getTodayDayIndex();
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

    <DaySelector bind:selectedDay today={getTodayDayIndex()} />

    {#if selectedDayPlan}
      <div class="day-header">{selectedDayName}</div>
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
      onSwap={() => { showDetail = false; }}
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
