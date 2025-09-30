# User Flow Diagram - Moduláris WebApp MVP

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** UX/UI Designer

---

## 📋 Áttekintés

Ez a dokumentum tartalmazza a főbb user flow-kat Mermaid diagram formátumban.

---

## 🔐 1. Regisztráció és Email Confirmation Flow

```mermaid
graph TD
    A[User Landing Page] --> B[Regisztráció Oldal]
    B --> C{Form Kitöltése}
    C -->|Valid| D[Email Confirmation Küldése]
    C -->|Invalid| B
    D --> E[Várj Email-re]
    E --> F[Email Érkezik]
    F --> G[Kattintás Confirmation Link-re]
    G --> H[/auth/callback]
    H --> I{Email Megerősítve}
    I -->|Success| J[Redirect Login Page]
    I -->|Error| K[Error Message]
    J --> L[Bejelentkezés]
```

---

## 🔑 2. Login Flow

```mermaid
graph TD
    A[Login Page] --> B{Credentials Beírása}
    B -->|Valid| C[Auth Check]
    B -->|Invalid| D[Error Message]
    D --> A
    C -->|Success| E[Session Create]
    C -->|Fail| D
    E --> F[Redirect /dashboard]
    F --> G[Dashboard Home]
```

---

## 📊 3. Dashboard Navigation Flow

```mermaid
graph TD
    A[Dashboard Home] --> B[Sidebar Navigation]
    B --> C{Menüpont Választás}
    C -->|Projektek| D[Projektek Lista]
    C -->|Modulok| E[Modulok Lista - Későbbi]
    C -->|Settings| F[Settings - Későbbi]
    D --> G{Projektek vannak?}
    G -->|Igen| H[Project Table/Cards]
    G -->|Nem| I[Empty State]
    I --> J[Új Projekt CTA]
```

---

## ➕ 4. Projekt Létrehozás Flow

```mermaid
graph TD
    A[Projektek Lista] --> B[Új Projekt Button Click]
    B --> C[Create Project Modal Megnyílik]
    C --> D{Projekt Név Beírása}
    D -->|Valid 3-100 kar| E[Létrehozás Button Engedélyezve]
    D -->|Invalid| F[Validation Error]
    F --> D
    E --> G[Click Létrehozás]
    G --> H[API Call: createProject]
    H -->|Success| I[Toast: Siker]
    H -->|Error| J[Toast: Hiba]
    I --> K[Modal Bezáródik]
    K --> L[Lista Frissül]
    L --> M[Új Projekt Látható]
```

---

## ✏️ 5. Projekt Szerkesztés Flow

```mermaid
graph TD
    A[Projektek Lista] --> B[Szerkesztés Button Click]
    B --> C[Edit Project Modal/Page]
    C --> D{Projekt Név Módosítása}
    D -->|Valid| E[Mentés Button Engedélyezve]
    D -->|Invalid| F[Validation Error]
    F --> D
    E --> G[Click Mentés]
    G --> H[API Call: updateProject]
    H -->|Success| I[Optimistic Update UI]
    I --> J[Toast: Siker]
    H -->|Error| K[Revert + Toast: Hiba]
    J --> L[Modal Bezáródik]
    L --> M[Lista Frissül]
```

---

## 🗑️ 6. Projekt Törlés Flow

```mermaid
graph TD
    A[Projektek Lista] --> B[Törlés Button Click]
    B --> C[Delete Confirmation Modal]
    C --> D{Megerősítés}
    D -->|Mégse| E[Modal Bezáródik]
    E --> A
    D -->|Törlés| F[API Call: deleteProject soft delete]
    F -->|Success| G[Projekt Eltűnik Listából]
    G --> H[Toast: Projekt Törölve]
    F -->|Error| I[Toast: Hiba]
```

---

## 👤 7. Admin vs User vs Viewer Flow Különbségek

### Admin Flow
```mermaid
graph TD
    A[Admin Login] --> B[Dashboard]
    B --> C[Projektek Lista]
    C --> D[ÖSSZES Projekt Látható]
    D --> E{Művelet Választás}
    E -->|Szerkesztés| F[Bármelyik Projekt Szerkeszthető]
    E -->|Törlés| G[Bármelyik Projekt Törölhető]
    E -->|Létrehozás| H[Új Projekt Létrehozása]
```

### User Flow
```mermaid
graph TD
    A[User Login] --> B[Dashboard]
    B --> C[Projektek Lista]
    C --> D[CSAK Saját Projektek Láthatók]
    D --> E{Művelet Választás}
    E -->|Szerkesztés| F[Csak Saját Projekt Szerkeszthető]
    E -->|Törlés| G[Csak Saját Projekt Törölhető]
    E -->|Létrehozás| H[Új Projekt Létrehozása]
```

### Viewer Flow
```mermaid
graph TD
    A[Viewer Login] --> B[Dashboard]
    B --> C[Projektek Lista]
    C --> D[Empty State - Nincs Projekt MVP-ben]
    D --> E[Nincs Új Projekt Button]
    E --> F[Később: Megosztott Projektek Olvasása]
```

---

## 🚪 8. Logout Flow

```mermaid
graph TD
    A[Dashboard - Bejelentkezett] --> B[Logout Button Click]
    B --> C[Confirm Logout - Opcionális]
    C --> D[API Call: signOut]
    D --> E[Session Törlése]
    E --> F[Redirect /login]
    F --> G[Login Page]
```

---

## 🔒 9. Protected Route Flow

```mermaid
graph TD
    A[User Navigate /dashboard] --> B{Session Létezik?}
    B -->|Igen| C[Dashboard Betöltődik]
    B -->|Nem| D[Redirect /login]
    D --> E[Login Page + Return URL]
    E --> F[Sikeres Login]
    F --> G[Redirect Original URL]
```

---

## ⚠️ 10. Error Handling Flow

```mermaid
graph TD
    A[API Call Végrehajtása] --> B{Response Status}
    B -->|200-299 Success| C[Toast: Success Message]
    B -->|400 Validation Error| D[Toast: Validation Error Message]
    B -->|401 Unauthorized| E[Redirect /login]
    B -->|403 Forbidden| F[Toast: Nincs Jogosultságod]
    B -->|404 Not Found| G[Toast: Nem Található]
    B -->|500 Server Error| H[Toast: Hiba Történt]
    C --> I[Folytatás]
    D --> I
    E --> J[Login Page]
    F --> I
    G --> I
    H --> I
```

---

## 📝 Flow Megjegyzések

### Optimistic Updates
- Projekt szerkesztésnél instant UI update, majd API call
- Ha API error → revert to original state + toast

### Loading States
- Minden async művelet során loading spinner
- Button disabled loading alatt
- Skeleton screen hosszabb betöltéseknél

### Toast Notifications
- Success: Zöld
- Error: Piros
- Auto-dismiss: 3-5 másodperc

### Session Management
- Session automatikusan refresh-elődik
- Expired session → redirect login
- Protected routes middleware check

---

**Jóváhagyva:** ❌ (Pending review)
**Státusz:** Tervezési fázis