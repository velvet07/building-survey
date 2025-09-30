import translations from '@/translations/hu.json';

type TranslationKey = string;

export function t(key: TranslationKey): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}