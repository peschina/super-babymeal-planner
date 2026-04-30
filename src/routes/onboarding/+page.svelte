<script lang="ts">
  import { goto } from '$app/navigation';
  import { profileStore } from '$lib/stores/profile';
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
