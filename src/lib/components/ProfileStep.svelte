<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { AgeBracket, Texture } from '$lib/types';
  import { defaultTexture } from '$lib/data/portions';

  let {
    ageBracket = $bindable('6-7' as AgeBracket),
    texture = $bindable('smooth' as Texture),
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
