# 🔧 Fix Import Error - lib/projects.ts

## Probléma
A szerveren a `lib/projects.ts` fájlban rossz az import útvonal:
- ❌ Régi (hibás): `import { getSession } from './auth/local';`
- ✅ Új (helyes): `import { getSession } from '@/lib/auth/local';`

## Gyors javítás SSH-n keresztül

```bash
cd /home/wpmuhel/public_html/felmeres

# Javítsd az importot
sed -i "s|from './auth/local'|from '@/lib/auth/local'|g" lib/projects.ts

# Ellenőrizd
grep -n "from.*auth/local" lib/projects.ts
# A kimenetnek így kell kinéznie:
# 8:import { getSession } from '@/lib/auth/local';

# Töröld a build cache-t
rm -rf .next

# Újra buildelés
npm run build
```

## Vagy használd a fix scriptet

```bash
chmod +x fix-import.sh
./fix-import.sh
rm -rf .next
npm run build
```

## Ellenőrzés

A fájl 8. sorának így kell kinéznie:
```typescript
import { getSession } from '@/lib/auth/local';
```

Ha még mindig `./auth/local`-t látsz, akkor a fájl nem lett frissítve.

