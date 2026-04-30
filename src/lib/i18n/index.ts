import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('it', () => fetch('/locales/it.json').then(r => r.json()));
register('en', () => fetch('/locales/en.json').then(r => r.json()));

export function initI18n(savedLanguage?: string) {
  init({
    fallbackLocale: 'it',
    initialLocale: savedLanguage || getLocaleFromNavigator()?.slice(0, 2) || 'it',
  });
}
