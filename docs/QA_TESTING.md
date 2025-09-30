# QA Testing Plan & Results - FÁZIS 3

**Verzió:** 1.0
**Utolsó frissítés:** 2025-09-29
**Készítette:** QA Tester

---

## 📋 Áttekintés

Ez a dokumentum tartalmazza a teljes QA testing stratégiát, test case-eket és eredményeket.

---

## 🎯 Testing Scope

### In Scope
- ✅ Functional testing (összes feature)
- ✅ UI/UX testing
- ✅ Edge case testing
- ✅ Error handling testing
- ✅ Performance testing (basic)
- ✅ Accessibility testing (basic)
- ✅ Cross-browser testing
- ✅ Responsive design testing

### Out of Scope (MVP)
- ❌ Automated E2E tests (későbbi verzió)
- ❌ Load testing (későbbi verzió)
- ❌ Penetration testing (Security Analyst feladat)

---

## 🧪 1. Functional Testing

### 1.1 Authentication Flow

#### Test Case #1: Successful Registration

**Pre-conditions:**
- Application running on `http://localhost:3000`
- Test email not registered yet

**Steps:**
1. Navigate to `/register`
2. Enter email: `qa-test-001@example.com`
3. Enter password: `QaTest123!`
4. Enter confirm password: `QaTest123!`
5. Click "Regisztráció"

**Expected Result:**
- ✅ Success toast: "Regisztráció sikeres! Ellenőrizd az email fiókodat..."
- ✅ Redirect to `/login`
- ✅ Email confirmation sent (check Supabase Dashboard)

**Status:** 🟡 Pending Manual Test

---

#### Test Case #2: Registration - Password Mismatch

**Steps:**
1. Navigate to `/register`
2. Enter password: `QaTest123!`
3. Enter confirm password: `DifferentPass!`
4. Click "Regisztráció"

**Expected Result:**
- ✅ Error message: "A jelszavak nem egyeznek"
- ✅ Form not submitted
- ✅ No API call made

**Status:** 🟡 Pending Manual Test

---

#### Test Case #3: Registration - Weak Password

**Steps:**
1. Navigate to `/register`
2. Enter password: `123` (< 8 characters)
3. Click "Regisztráció"

**Expected Result:**
- ✅ Error message: "A jelszónak legalább 8 karakter hosszúnak kell lennie"

**Status:** 🟡 Pending Manual Test

---

#### Test Case #4: Registration - Invalid Email

**Steps:**
1. Navigate to `/register`
2. Enter email: `invalid-email` (no @ symbol)
3. Click "Regisztráció"

**Expected Result:**
- ✅ Error message: "Érvénytelen email formátum"

**Status:** 🟡 Pending Manual Test

---

#### Test Case #5: Registration - Duplicate Email

**Pre-conditions:**
- Email `duplicate@example.com` already registered

**Steps:**
1. Navigate to `/register`
2. Enter email: `duplicate@example.com`
3. Enter valid password
4. Click "Regisztráció"

**Expected Result:**
- ✅ Error toast: "Ez az email cím már regisztrálva van"

**Status:** 🟡 Pending Manual Test

---

#### Test Case #6: Successful Login

**Pre-conditions:**
- User `qa-test-001@example.com` registered and email confirmed

**Steps:**
1. Navigate to `/login`
2. Enter email: `qa-test-001@example.com`
3. Enter password: `QaTest123!`
4. Click "Bejelentkezés"

**Expected Result:**
- ✅ Success toast: "Sikeres bejelentkezés!"
- ✅ Redirect to `/dashboard`
- ✅ Header shows user email

**Status:** 🟡 Pending Manual Test

---

#### Test Case #7: Login - Invalid Credentials

**Steps:**
1. Navigate to `/login`
2. Enter email: `qa-test-001@example.com`
3. Enter password: `WrongPassword!`
4. Click "Bejelentkezés"

**Expected Result:**
- ✅ Error toast: "Hibás email cím vagy jelszó"
- ✅ User remains on `/login`

**Status:** 🟡 Pending Manual Test

---

#### Test Case #8: Login - Empty Fields

**Steps:**
1. Navigate to `/login`
2. Leave email empty
3. Click "Bejelentkezés"

**Expected Result:**
- ✅ Error message: "Az email cím megadása kötelező"

**Status:** 🟡 Pending Manual Test

---

#### Test Case #9: Logout

**Pre-conditions:**
- User logged in

**Steps:**
1. Navigate to `/dashboard`
2. Click "Kijelentkezés" button in header
3. Wait for response

**Expected Result:**
- ✅ Success toast: "Sikeres kijelentkezés"
- ✅ Redirect to `/login`
- ✅ Session cleared

**Status:** 🟡 Pending Manual Test

---

### 1.2 Protected Routes

#### Test Case #10: Access Dashboard Without Login

**Pre-conditions:**
- User not logged in

**Steps:**
1. Navigate to `/dashboard`

**Expected Result:**
- ✅ Automatic redirect to `/login`

**Status:** 🟡 Pending Manual Test

---

#### Test Case #11: Access Login While Logged In

**Pre-conditions:**
- User logged in

**Steps:**
1. Navigate to `/login`

**Expected Result:**
- ✅ Automatic redirect to `/dashboard`

**Status:** 🟡 Pending Manual Test

---

### 1.3 Project CRUD Operations

#### Test Case #12: Create Project - Success

**Pre-conditions:**
- User logged in as `user` role

**Steps:**
1. Navigate to `/dashboard/projects`
2. Click "Új projekt" button
3. Enter name: "QA Test Projekt 001"
4. Click "Létrehozás"

**Expected Result:**
- ✅ Success toast: "Projekt sikeresen létrehozva!"
- ✅ Modal closes
- ✅ New project appears in list
- ✅ Auto identifier generated (PROJ-YYYYMMDD-NNN format)
- ✅ Current date in created_at

**Status:** 🟡 Pending Manual Test

---

#### Test Case #13: Create Project - Name Too Short

**Steps:**
1. Click "Új projekt"
2. Enter name: "AB" (< 3 characters)
3. Click "Létrehozás"

**Expected Result:**
- ✅ Error message: "A projekt nevének legalább 3 karakter hosszúnak kell lennie"
- ✅ Form not submitted

**Status:** 🟡 Pending Manual Test

---

#### Test Case #14: Create Project - Name Too Long

**Steps:**
1. Click "Új projekt"
2. Enter name: 101 characters long string
3. Click "Létrehozás"

**Expected Result:**
- ✅ Error message: "A projekt neve maximum 100 karakter hosszú lehet"

**Status:** 🟡 Pending Manual Test

---

#### Test Case #15: Create Project - Empty Name

**Steps:**
1. Click "Új projekt"
2. Leave name empty
3. Click "Létrehozás"

**Expected Result:**
- ✅ Error message: "A projekt neve kötelező"

**Status:** 🟡 Pending Manual Test

---

#### Test Case #16: Edit Project - Success

**Pre-conditions:**
- At least 1 project exists owned by current user

**Steps:**
1. Navigate to `/dashboard/projects`
2. Click "Szerkesztés" on a project card
3. Change name to "Módosított Projekt Név"
4. Click "Mentés"

**Expected Result:**
- ✅ Success toast: "Projekt sikeresen frissítve!"
- ✅ Modal closes
- ✅ Project card shows updated name
- ✅ Auto identifier unchanged

**Status:** 🟡 Pending Manual Test

---

#### Test Case #17: Edit Project - Cancel

**Steps:**
1. Click "Szerkesztés" on a project
2. Change name
3. Click "Mégse"

**Expected Result:**
- ✅ Modal closes
- ✅ No changes saved
- ✅ Project name unchanged

**Status:** 🟡 Pending Manual Test

---

#### Test Case #18: Delete Project - Confirm

**Pre-conditions:**
- At least 1 project exists

**Steps:**
1. Navigate to `/dashboard/projects`
2. Click "Törlés" on a project card
3. Confirm in delete modal
4. Click "Törlés" button

**Expected Result:**
- ✅ Success toast: "Projekt sikeresen törölve!"
- ✅ Modal closes
- ✅ Project disappears from list
- ✅ Soft delete (deleted_at set, not hard delete)

**Status:** 🟡 Pending Manual Test

---

#### Test Case #19: Delete Project - Cancel

**Steps:**
1. Click "Törlés" on a project
2. Click "Mégse" in modal

**Expected Result:**
- ✅ Modal closes
- ✅ Project NOT deleted
- ✅ Project still visible

**Status:** 🟡 Pending Manual Test

---

#### Test Case #20: View Projects - Empty State

**Pre-conditions:**
- User has NO projects

**Steps:**
1. Navigate to `/dashboard/projects`

**Expected Result:**
- ✅ Empty state component visible
- ✅ Message: "Még nincs egyetlen projekt sem"
- ✅ "Új projekt létrehozása" button visible

**Status:** 🟡 Pending Manual Test

---

#### Test Case #21: View Projects - Loading State

**Steps:**
1. Navigate to `/dashboard/projects`
2. Observe immediately (before data loads)

**Expected Result:**
- ✅ Loading spinner visible
- ✅ No project cards shown yet

**Status:** 🟡 Pending Manual Test

---

### 1.4 Role-Based Access Control

#### Test Case #22: Admin Sees All Projects

**Pre-conditions:**
- Logged in as `admin@example.com`
- Multiple users have projects

**Steps:**
1. Navigate to `/dashboard/projects`

**Expected Result:**
- ✅ Admin sees all projects (own + other users')

**Status:** 🟡 Pending Manual Test

---

#### Test Case #23: User Sees Only Own Projects

**Pre-conditions:**
- Logged in as `user@example.com`
- Admin has projects too

**Steps:**
1. Navigate to `/dashboard/projects`

**Expected Result:**
- ✅ User sees ONLY own projects
- ✅ Admin projects NOT visible

**Status:** 🟡 Pending Manual Test

---

#### Test Case #24: User Cannot Edit Admin Project

**Pre-conditions:**
- Logged in as `user`
- Manually try to call API with admin project ID

**Steps:**
1. Open browser DevTools
2. Attempt to update admin project via Supabase client

**Expected Result:**
- ✅ RLS policy blocks update
- ✅ Error returned
- ✅ No changes saved

**Status:** 🟡 Pending Manual Test (requires DevTools)

---

### 1.5 Dashboard

#### Test Case #25: Dashboard Home

**Pre-conditions:**
- User logged in

**Steps:**
1. Navigate to `/dashboard`

**Expected Result:**
- ✅ Dashboard title visible
- ✅ 3 stat cards visible (Projektek, Aktív felmérések, Befejezett)
- ✅ Quick actions section visible
- ✅ "Új projekt létrehozása" button works
- ✅ "Projektek megtekintése" button navigates to `/dashboard/projects`

**Status:** 🟡 Pending Manual Test

---

### 1.6 Sidebar Navigation

#### Test Case #26: Sidebar Active State

**Steps:**
1. Navigate to `/dashboard`
2. Observe "Dashboard" menu item
3. Navigate to `/dashboard/projects`
4. Observe "Projektek" menu item

**Expected Result:**
- ✅ Active page highlighted (blue background)
- ✅ Inactive pages gray

**Status:** 🟡 Pending Manual Test

---

## 🔍 2. Edge Case Testing

### 2.1 Network Edge Cases

#### Test Case #27: API Timeout

**Pre-conditions:**
- Simulate slow network (DevTools → Network → Throttling)

**Steps:**
1. Navigate to `/dashboard/projects`
2. Create new project
3. Wait for timeout

**Expected Result:**
- ✅ Loading state shown during wait
- ✅ Error toast if timeout occurs

**Status:** 🟡 Pending Manual Test

---

#### Test Case #28: Offline Mode

**Steps:**
1. Open DevTools → Network tab
2. Set to "Offline"
3. Try to create project

**Expected Result:**
- ✅ Error toast: "Hiba történt..."
- ✅ Form not submitted
- ✅ No crash

**Status:** 🟡 Pending Manual Test

---

### 2.2 Data Edge Cases

#### Test Case #29: Special Characters in Project Name

**Steps:**
1. Create project with name: `Teszt & Projekt <>'"`
2. Save

**Expected Result:**
- ✅ Special characters saved correctly
- ✅ No XSS vulnerability (characters escaped)
- ✅ Display correctly in project card

**Status:** 🟡 Pending Manual Test

---

#### Test Case #30: Unicode Characters (Magyar)

**Steps:**
1. Create project with name: `Projekt ékezetes karakterekkel: áéíóöőúüű`
2. Save

**Expected Result:**
- ✅ Magyar characters saved correctly
- ✅ Display correctly

**Status:** 🟡 Pending Manual Test

---

#### Test Case #31: Whitespace Trimming

**Steps:**
1. Create project with name: `   Projekt whitespace-ekkel   `
2. Save

**Expected Result:**
- ✅ Leading/trailing whitespace trimmed (if validation implemented)
- OR ✅ Whitespace saved as-is (acceptable for MVP)

**Status:** 🟡 Pending Manual Test

---

### 2.3 Concurrent Actions

#### Test Case #32: Double Submit

**Steps:**
1. Create project modal
2. Enter valid name
3. Double-click "Létrehozás" button rapidly

**Expected Result:**
- ✅ Button disabled after first click
- ✅ Only ONE project created
- ✅ No duplicate submissions

**Status:** 🟡 Pending Manual Test

---

#### Test Case #33: Modal Close During API Call

**Steps:**
1. Create project modal
2. Enter name and click "Létrehozás"
3. Immediately click X or backdrop to close modal

**Expected Result:**
- ✅ Modal closes
- ✅ API call still completes
- ✅ Toast notification shown
- ✅ Project list refreshes

**Status:** 🟡 Pending Manual Test

---

## ❌ 3. Error Handling Testing

### 3.1 Form Validation Errors

#### Test Case #34: Multiple Validation Errors

**Steps:**
1. Registration form
2. Leave all fields empty
3. Click "Regisztráció"

**Expected Result:**
- ✅ All relevant error messages shown
- ✅ Email error visible
- ✅ Password error visible

**Status:** 🟡 Pending Manual Test

---

### 3.2 API Errors

#### Test Case #35: Supabase Connection Error

**Pre-conditions:**
- Invalid Supabase URL in `.env.local`

**Steps:**
1. Try to login

**Expected Result:**
- ✅ Error toast shown
- ✅ User-friendly message (not raw error)
- ✅ No crash

**Status:** 🟡 Pending Manual Test (requires manual .env change)

---

### 3.3 Session Errors

#### Test Case #36: Expired Session

**Pre-conditions:**
- User logged in
- Session expired (manually clear session cookie)

**Steps:**
1. Try to access `/dashboard/projects`

**Expected Result:**
- ✅ Redirect to `/login`
- ✅ No crash

**Status:** 🟡 Pending Manual Test

---

## ⚡ 4. Performance Testing

### 4.1 Load Time

#### Test Case #37: Initial Page Load

**Steps:**
1. Clear browser cache
2. Navigate to `/login`
3. Measure load time (DevTools → Network)

**Expected Result:**
- ✅ Page loads in < 2 seconds (3G network)
- ✅ First Contentful Paint < 1.5s

**Status:** 🟡 Pending Manual Test

---

#### Test Case #38: Dashboard Load

**Pre-conditions:**
- User logged in

**Steps:**
1. Navigate to `/dashboard`
2. Measure load time

**Expected Result:**
- ✅ Page loads in < 2 seconds

**Status:** 🟡 Pending Manual Test

---

### 4.2 Project List Performance

#### Test Case #39: Large Project List

**Pre-conditions:**
- User has 50+ projects

**Steps:**
1. Navigate to `/dashboard/projects`
2. Measure render time

**Expected Result:**
- ✅ List renders in < 3 seconds
- ✅ No lag when scrolling

**Status:** 🟡 Pending Manual Test (requires seed data)

---

### 4.3 API Response Time

#### Test Case #40: Create Project API

**Steps:**
1. Create project
2. Measure API response time (DevTools → Network → projects POST)

**Expected Result:**
- ✅ API responds in < 500ms

**Status:** 🟡 Pending Manual Test

---

## ♿ 5. Accessibility Testing

### 5.1 Keyboard Navigation

#### Test Case #41: Tab Navigation

**Steps:**
1. Navigate to `/login`
2. Press Tab repeatedly
3. Observe focus order

**Expected Result:**
- ✅ Focus moves in logical order (email → password → button)
- ✅ Focus visible (outline or ring)

**Status:** 🟡 Pending Manual Test

---

#### Test Case #42: Enter Key Submit

**Steps:**
1. Login form
2. Enter credentials
3. Press Enter (without clicking button)

**Expected Result:**
- ✅ Form submits

**Status:** 🟡 Pending Manual Test

---

#### Test Case #43: ESC Key - Modal Close

**Steps:**
1. Open create project modal
2. Press ESC key

**Expected Result:**
- ✅ Modal closes

**Status:** 🟡 Pending Manual Test (requires implementation)

---

### 5.2 Screen Reader

#### Test Case #44: Label Association

**Steps:**
1. Inspect login form HTML
2. Check `<label for="">` attributes

**Expected Result:**
- ✅ All inputs have associated labels
- ✅ Labels have correct `for` attribute

**Status:** 🟡 Pending Manual Test

---

#### Test Case #45: Button Text

**Steps:**
1. Inspect all buttons

**Expected Result:**
- ✅ All buttons have descriptive text
- ✅ No icon-only buttons without aria-label

**Status:** 🟡 Pending Manual Test

---

### 5.3 Color Contrast

#### Test Case #46: WCAG AA Compliance

**Steps:**
1. Use browser extension (e.g., "WAVE" or "axe DevTools")
2. Scan `/login` page

**Expected Result:**
- ✅ Text contrast ratio ≥ 4.5:1 (normal text)
- ✅ No contrast issues reported

**Status:** 🟡 Pending Manual Test

---

## 🌐 6. Cross-Browser Testing

### 6.1 Desktop Browsers

#### Test Case #47: Chrome

**Steps:**
1. Open in Google Chrome (latest)
2. Run Test Cases #1-26

**Expected Result:**
- ✅ All features work

**Status:** 🟡 Pending Manual Test

---

#### Test Case #48: Firefox

**Steps:**
1. Open in Mozilla Firefox (latest)
2. Run Test Cases #1-26

**Expected Result:**
- ✅ All features work
- ✅ No layout issues

**Status:** 🟡 Pending Manual Test

---

#### Test Case #49: Safari

**Steps:**
1. Open in Safari (macOS)
2. Run Test Cases #1-26

**Expected Result:**
- ✅ All features work
- ✅ No webkit-specific issues

**Status:** 🟡 Pending Manual Test

---

#### Test Case #50: Edge

**Steps:**
1. Open in Microsoft Edge (latest)
2. Run Test Cases #1-26

**Expected Result:**
- ✅ All features work

**Status:** 🟡 Pending Manual Test

---

## 📱 7. Mobile Testing

### 7.1 Responsive Design

#### Test Case #51: Mobile View (375px)

**Steps:**
1. Open DevTools → Responsive mode
2. Set width to 375px (iPhone SE)
3. Navigate to `/login`

**Expected Result:**
- ✅ Form fits screen without horizontal scroll
- ✅ Text readable
- ✅ Buttons tappable (min 44px height)

**Status:** 🟡 Pending Manual Test

---

#### Test Case #52: Tablet View (768px)

**Steps:**
1. Set width to 768px (iPad)
2. Navigate to `/dashboard/projects`

**Expected Result:**
- ✅ Project cards in 2-column grid
- ✅ Sidebar visible (if implemented)

**Status:** 🟡 Pending Manual Test

---

#### Test Case #53: Mobile Navigation

**Steps:**
1. Mobile view (< 640px)
2. Check sidebar visibility

**Expected Result:**
- ✅ Sidebar hidden or hamburger menu shown
- OR ✅ Sidebar auto-hides (acceptable for MVP)

**Status:** 🟡 Pending Manual Test

---

### 7.2 Touch Interactions

#### Test Case #54: Touch Targets

**Steps:**
1. Measure button sizes on mobile

**Expected Result:**
- ✅ All buttons ≥ 44x44px (Apple HIG guideline)

**Status:** 🟡 Pending Manual Test

---

#### Test Case #55: Modal Backdrop Touch

**Steps:**
1. Open modal on mobile
2. Tap backdrop outside modal

**Expected Result:**
- ✅ Modal closes

**Status:** 🟡 Pending Manual Test

---

## 📊 Testing Summary

### Test Coverage

| Category | Total Tests | Passed | Failed | Pending |
|----------|-------------|--------|--------|---------|
| Authentication | 9 | 0 | 0 | 9 |
| Protected Routes | 2 | 0 | 0 | 2 |
| Project CRUD | 13 | 0 | 0 | 13 |
| Edge Cases | 7 | 0 | 0 | 7 |
| Error Handling | 4 | 0 | 0 | 4 |
| Performance | 4 | 0 | 0 | 4 |
| Accessibility | 6 | 0 | 0 | 6 |
| Cross-Browser | 4 | 0 | 0 | 4 |
| Mobile | 5 | 0 | 0 | 5 |
| **TOTAL** | **55** | **0** | **0** | **55** |

---

## 🐛 Bug Report Template

### Bug #XXX: [Title]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
- What should happen

**Actual Result:**
- What actually happened

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Screen: 1920x1080

**Screenshots:**
- [Attach screenshot]

**Status:** Open / In Progress / Resolved

---

## ✅ Pre-Production Checklist

### Functional
- [ ] All authentication flows work
- [ ] All CRUD operations work
- [ ] Protected routes enforced
- [ ] Role-based access working

### UI/UX
- [ ] No broken layouts on mobile
- [ ] No broken layouts on tablet
- [ ] No broken layouts on desktop
- [ ] Toast notifications work

### Performance
- [ ] Page load < 3s
- [ ] No console errors
- [ ] No memory leaks

### Accessibility
- [ ] Keyboard navigation works
- [ ] Form labels present
- [ ] Color contrast sufficient

### Cross-Browser
- [ ] Works on Chrome
- [ ] Works on Firefox
- [ ] Works on Safari (if available)
- [ ] Works on Edge

---

## 📝 Regression Testing Checklist

**Run these tests after every major code change:**

1. ✅ Test Case #6: Successful Login
2. ✅ Test Case #12: Create Project
3. ✅ Test Case #16: Edit Project
4. ✅ Test Case #18: Delete Project
5. ✅ Test Case #10: Protected Routes
6. ✅ Test Case #23: RLS (User sees only own projects)

---

## ✅ Final Acceptance Criteria

**MVP Ready for Production when:**

- [ ] 0 Critical bugs
- [ ] 0 High bugs
- [ ] ≤ 3 Medium bugs (documented)
- [ ] All authentication flows tested
- [ ] All CRUD operations tested
- [ ] Mobile responsive tested
- [ ] Cross-browser tested (Chrome + Firefox minimum)
- [ ] Security audit passed
- [ ] Performance acceptable (< 3s load)

---

**QA Testing Status:** 🟡 Pending Manual Execution
**Next Step:** Execute all 55 test cases manually
**Estimated Time:** 4-6 hours (full regression)

---

**Készítette:** QA Tester
**Dátum:** 2025-09-29
**Testing Plan Verzió:** 1.0