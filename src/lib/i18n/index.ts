import { register, init, locale, getLocaleFromNavigator } from 'svelte-i18n';

register('it', () => fetch('/locales/it.json').then(r => r.json()));
register('en', () => fetch('/locales/en.json').then(r => r.json()));

// Initialize eagerly so $_ is available during first render
init({
  fallbackLocale: 'it',
  initialLocale: getLocaleFromNavigator()?.slice(0, 2) || 'it',
});

export function setLocale(language: string) {
  locale.set(language);
}
