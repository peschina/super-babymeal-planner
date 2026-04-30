<script lang="ts">
  import { goto } from '$app/navigation';
  import { _, locale } from 'svelte-i18n';
  import { profileStore } from '$lib/stores/profile';
  import { mealsStore } from '$lib/stores/meals';
  import { generateWeek, getWeekKey, getWeekStart } from '$lib/engine/generate-week';
  import { cereals } from '$lib/data/cereals';
  import { proteins } from '$lib/data/proteins';
  import { vegetables } from '$lib/data/vegetables';
  import { getCurrentSeason } from '$lib/data/seasons';
  import { ageBracketToMinMonth } from '$lib/engine/filter';
  import { defaultTexture } from '$lib/data/portions';
  import type { AgeBracket, Texture, AllergenTag, Season } from '$lib/types';

  let profile = $derived($profileStore);

  let ageBracket = $state<AgeBracket>(profile?.ageBracket ?? '6-7');
  let texture = $state<Texture>(profile?.texture ?? 'smooth');
  let allergens = $state<AllergenTag[]>(profile?.allergens ?? []);
  let language = $state<'it' | 'en'>(profile?.language ?? 'it');
  let seasonOverride = $state<Season | null>(profile?.seasonOverride ?? null);

  const ageBrackets: AgeBracket[] = ['6-7', '8-9', '10-12'];
  const textures: Texture[] = ['smooth', 'slightly-textured', 'soft-pieces'];
  const allAllergens: { tag: AllergenTag; emoji: string }[] = [
    { tag: 'egg', emoji: '🥚' }, { tag: 'fish', emoji: '🐟' },
    { tag: 'dairy', emoji: '🧀' }, { tag: 'gluten', emoji: '🌾' },
    { tag: 'legumes', emoji: '🫘' },
  ];
  const seasons: (Season | null)[] = [null, 'spring', 'summer', 'fall', 'winter'];

  function toggleAllergen(tag: AllergenTag) {
    if (allergens.includes(tag)) {
      allergens = allergens.filter(a => a !== tag);
    } else {
      allergens = [...allergens, tag];
    }
  }

  function save() {
    profileStore.update({ ageBracket, texture, allergens, language, seasonOverride });
    locale.set(language);

    const now = new Date();
    const wk = getWeekKey(now);
    const season = getCurrentSeason(seasonOverride);
    const previousWeek = mealsStore.getPreviousWeek(wk);
    const week = generateWeek({
      cereals, proteins, vegetables,
      babyAgeMonths: ageBracketToMinMonth(ageBracket),
      allergens,
      season,
      previousWeek,
      seed: Date.now(),
    });
    week.weekKey = wk;
    week.weekStart = getWeekStart(now).toISOString().slice(0, 10);
    mealsStore.setWeek(wk, week);

    goto('/');
  }
</script>

<div class="settings">
  <h2>{$_('settings.title')}</h2>

  <section>
    <label class="label">{$_('settings.ageBracket')}</label>
    <div class="pill-group">
      {#each ageBrackets as bracket}
        <button class="pill" class:active={ageBracket === bracket}
          onclick={() => { ageBracket = bracket; texture = defaultTexture[bracket]; }}>
          {$_(`ageBrackets.${bracket}`)}
        </button>
      {/each}
    </div>
  </section>

  <section>
    <label class="label">{$_('settings.texture')}</label>
    <div class="texture-list">
      {#each textures as tex}
        <button class="texture-option" class:active={texture === tex}
          onclick={() => texture = tex}>
          {$_(`textures.${tex}`)}
        </button>
      {/each}
    </div>
  </section>

  <section>
    <label class="label">{$_('settings.allergens')}</label>
    <div class="allergen-pills">
      {#each allAllergens as { tag, emoji }}
        <button class="allergen-pill" class:active={allergens.includes(tag)}
          onclick={() => toggleAllergen(tag)}>
          {emoji} {$_(`allergens.${tag}`)}
        </button>
      {/each}
    </div>
  </section>

  <section>
    <label class="label">{$_('settings.language')}</label>
    <div class="pill-group">
      <button class="pill" class:active={language === 'it'} onclick={() => language = 'it'}>
        🇮🇹 Italiano
      </button>
      <button class="pill" class:active={language === 'en'} onclick={() => language = 'en'}>
        🇬🇧 English
      </button>
    </div>
  </section>

  <section>
    <label class="label">{$_('settings.season')}</label>
    <div class="pill-group season-pills">
      {#each seasons as s}
        <button class="pill" class:active={seasonOverride === s}
          onclick={() => seasonOverride = s}>
          {s === null ? $_('settings.seasonAuto') : $_(`seasons.${s}`)}
        </button>
      {/each}
    </div>
  </section>

  <button class="btn-primary" onclick={save}>
    {$_('settings.save')}
  </button>
</div>

<style>
  .settings { padding: 8px 0; }
  h2 { font-size: 22px; font-weight: 700; margin-bottom: 20px; }
  section { margin-bottom: 20px; }
  .label { font-size: 12px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; display: block; margin-bottom: 8px; }
  .pill-group { display: flex; gap: 8px; flex-wrap: wrap; }
  .pill {
    padding: 10px 14px; border-radius: var(--radius-md);
    border: 2px solid var(--color-border); font-size: 13px;
    color: var(--color-text-muted); background: var(--color-surface);
  }
  .pill.active { border-color: var(--color-primary); background: var(--color-primary-light); color: var(--color-primary); font-weight: 600; }
  .texture-list { display: flex; flex-direction: column; gap: 8px; }
  .texture-option {
    padding: 12px; border-radius: var(--radius-md); border: 2px solid var(--color-border);
    font-size: 14px; color: var(--color-text-muted); text-align: left; background: var(--color-surface);
  }
  .texture-option.active { border-color: var(--color-primary); background: var(--color-primary-light); color: var(--color-text); }
  .allergen-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .allergen-pill {
    padding: 8px 14px; border-radius: 20px; border: 2px solid var(--color-border);
    font-size: 13px; color: var(--color-text-muted); background: var(--color-surface);
  }
  .allergen-pill.active { border-color: var(--color-danger); background: var(--color-danger-light); color: var(--color-danger); }
  .season-pills { flex-wrap: wrap; }
  .btn-primary {
    width: 100%; background: var(--color-primary); color: white;
    padding: 14px; border-radius: var(--radius-lg); font-size: 16px;
    font-weight: 600; margin-top: 12px;
  }
</style>
