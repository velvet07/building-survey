# 🔄 Alkalmazás újraindítása

Ha build után még mindig régi hibákat látsz, az alkalmazást újra kell indítani.

## Probléma jelei

- `ChunkLoadError`: Loading chunk failed
- `400 Bad Request` a statikus fájlok betöltésekor
- Régi verzió fut a böngészőben

## Megoldás

### 1. Leállítás és újraindítás SSH-n keresztül

```bash
cd /home/wpmuhel/public_html/felmeres

# Keressük meg a futó folyamatot
lsof -i :4000
# vagy
ps aux | grep "next start"

# Állítsd le (cseréld ki a PID-t a talált process ID-re)
kill -9 [PID]

# Vagy használd a restart scriptet:
chmod +x RESTART_APP.sh
./RESTART_APP.sh
```

### 2. CWP7 Node.js Selector használata

1. Lépj be a CWP7 panelbe
2. Nyisd meg a "Node.js Selector" opciót
3. Keresd meg az alkalmazást
4. Kattints az "Stop" gombra
5. Várj 5 másodpercet
6. Kattints az "Start" gombra

### 3. Ellenőrzés

```bash
# Ellenőrizd, hogy fut-e
lsof -i :4000

# Ellenőrizd a BUILD_ID-t
cat .next/BUILD_ID

# Teszteld az alkalmazást
curl https://felmeres.wpmuhely.com/api/health
```

## Automatikus újraindítás script

Futtasd le az `RESTART_APP.sh` scriptet, ami:
- ✅ Leállítja a régi folyamatot
- ✅ Ellenőrzi a build-et
- ✅ Újraindítja az alkalmazást
- ✅ Ellenőrzi, hogy elindult-e

```bash
chmod +x RESTART_APP.sh
./RESTART_APP.sh
```

