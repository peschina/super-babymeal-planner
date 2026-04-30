<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { AllergenTag } from '$lib/types';

  let {
    allergens = $bindable([] as AllergenTag[]),
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
