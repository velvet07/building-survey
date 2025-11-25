import type { FormValue } from '../types';

export function formatFormValue(value: FormValue): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Igen' : 'Nem';
  }

  if (typeof value === 'string') {
    if (value === 'yes') return 'Igen';
    if (value === 'no') return 'Nem';
    return value;
  }

  return String(value);
}
