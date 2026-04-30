<script lang="ts">
  import { initI18n } from '$lib/i18n';
  import { profileStore } from '$lib/stores/profile';
  import { _ } from 'svelte-i18n';
  import '../app.css';

  let { children } = $props();
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
