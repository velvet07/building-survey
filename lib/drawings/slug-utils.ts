/**
 * Slug Generation Utilities for Drawings
 * Slug generálás magyar karakterek kezelésével
 */

/**
 * Generate a URL-safe slug from a drawing name
 * Converts Hungarian characters and creates a URL-safe string
 *
 * @param name - The drawing name to convert
 * @returns A URL-safe slug
 *
 * @example
 * generateSlug("Alaprajz - Pince") => "alaprajz-pince"
 * generateSlug("1. Emeleti Hálószoba") => "1-emeleti-haloszoba"
 */
export function generateSlug(name: string): string {
  // Hungarian character mapping
  const hungarianMap: Record<string, string> = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o', 'ú': 'u', 'ü': 'u', 'ű': 'u',
    'Á': 'a', 'É': 'e', 'Í': 'i', 'Ó': 'o', 'Ö': 'o', 'Ő': 'o', 'Ú': 'u', 'Ü': 'u', 'Ű': 'u'
  };

  return name
    .toLowerCase()
    .trim()
    // Replace Hungarian characters
    .split('')
    .map(char => hungarianMap[char] || char)
    .join('')
    // Replace non-alphanumeric characters (except hyphens) with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Limit length to 100 characters
    .substring(0, 100)
    // Remove trailing hyphen if any after truncation
    .replace(/-+$/, '');
}

/**
 * Generate a unique slug by appending a number if necessary
 * Used when a slug collision is detected
 *
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 *
 * @example
 * makeSlugUnique("alaprajz", ["alaprajz"]) => "alaprajz-2"
 * makeSlugUnique("alaprajz", ["alaprajz", "alaprajz-2"]) => "alaprajz-3"
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Check if a string looks like a UUID (for backward compatibility)
 *
 * @param str - The string to check
 * @returns True if the string looks like a UUID
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
