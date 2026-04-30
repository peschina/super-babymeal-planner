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
