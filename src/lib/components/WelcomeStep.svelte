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
