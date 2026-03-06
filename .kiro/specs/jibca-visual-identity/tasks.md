# Tasks: JIBCA Visual Identity Implementation

**Spec ID:** jibca-visual-identity  
**Created:** 05/03/2026  
**Status:** Ready for Implementation

---

## 📋 Task Overview

Total: 23 tasks across 4 phases  
Estimated Time: ~32 hours

---

## 🔴 PHASE 1: FOUNDATION (Critical Priority)

### Task 1.1: Update Tailwind Configuration
**File:** `app/frontend/tailwind.config.js`  
**Estimated Time:** 1 hour  
**Priority:** Critical

**Description:**
Update Tailwind config to include complete JIBCA color palette and change primary colors from blue to burgundy.

**Changes:**
```javascript
// Add to colors.extend
jibca: {
  darkBrown: '#2D1810',
  darkerBrown: '#1A0F0A',
  gold: '#D4C4B0',
  goldLight: '#E8DCC8',
  goldDark: '#B8A890',
  burgundy: '#8B0000',
  burgundyHover: '#A52A2A',
  burgundyPressed: '#6B0000',
}

// Update primary colors
primary: {
  500: '#8B0000',  // Changed from #3b82f6
  600: '#6B0000',  // Changed from #2563eb
}
```

**Acceptance Criteria:**
- [ ] JIBCA colors added to theme
- [ ] Primary colors changed to burgundy
- [ ] No build errors
- [ ] Colors accessible via Tailwind classes

**Dependencies:** None

---

### Task 1.2: Update CSS Variables
**File:** `app/frontend/src/index.css`  
**Estimated Time:** 30 minutes  
**Priority:** Critical

**Description:**
Add JIBCA color CSS variables for use in inline styles and legacy code.

**Changes:**
```css
:root {
  /* JIBCA Browns */
  --jibca-dark-brown: #2D1810;
  --jibca-darker-brown: #1A0F0A;
  
  /* JIBCA Golds */
  --jibca-gold: #D4C4B0;
  --jibca-gold-light: #E8DCC8;
  --jibca-gold-dark: #B8A890;
  
  /* JIBCA Burgundy */
  --jibca-burgundy: #8B0000;
  --jibca-burgundy-hover: #A52A2A;
  --jibca-burgundy-pressed: #6B0000;
}
```

**Acceptance Criteria:**
- [ ] All JIBCA variables added
- [ ] Variables accessible via var(--jibca-*)
- [ ] No CSS errors

**Dependencies:** None

---

### Task 1.3: Test Theme Configuration
**Files:** All components  
**Estimated Time:** 30 minutes  
**Priority:** Critical

**Description:**
Verify that new Tailwind classes and CSS variables work correctly.

**Test Cases:**
1. Create test component using `bg-jibca-burgundy`
2. Create test component using `var(--jibca-gold)`
3. Verify no build errors
4. Verify colors render correctly in browser

**Acceptance Criteria:**
- [ ] Tailwind classes work
- [ ] CSS variables work
- [ ] No console errors
- [ ] Build succeeds

**Dependencies:** Task 1.1, Task 1.2

---

## 🔴 PHASE 2: AUTHENTICATION PAGES (Critical Priority)

### Task 2.1: Update ForgotPassword.jsx
**File:** `app/frontend/src/pages/ForgotPassword.jsx`  
**Estimated Time:** 2 hours  
**Priority:** Critical

**Description:**
Replace all blue elements with JIBCA colors. This is the most critical page as it's completely off-brand.

**Changes:**
1. Background gradient: `from-slate-900 via-blue-900` → `from-jibca-darkBrown via-jibca-darkerBrown`
2. Header: `from-blue-600 to-blue-700` → `from-jibca-burgundy to-jibca-burgundyPressed`
3. Icon container: `bg-white/20` → `bg-jibca-gold/20`
4. Icon color: Add `text-jibca-gold`
5. Buttons: `bg-blue-600 hover:bg-blue-700` → `bg-jibca-burgundy hover:bg-jibca-burgundyHover`
6. Focus rings: `focus:ring-blue-500` → `focus:ring-jibca-burgundy`
7. Links: `text-blue-600` → `text-jibca-burgundy`

**Acceptance Criteria:**
- [ ] No blue colors remain
- [ ] Gradient uses dark brown
- [ ] Header uses burgundy
- [ ] Icons use gold
- [ ] Buttons use burgundy
- [ ] Page renders correctly
- [ ] Mobile responsive

**Dependencies:** Task 1.1, Task 1.2

---

### Task 2.2: Update ResetPassword.jsx
**File:** `app/frontend/src/pages/ResetPassword.jsx`  
**Estimated Time:** 2 hours  
**Priority:** Critical

**Description:**
Replace all blue elements with JIBCA colors. Similar to ForgotPassword.

**Changes:**
1. Background gradient: `from-slate-900 via-blue-900` → `from-jibca-darkBrown via-jibca-darkerBrown`
2. Header: `from-blue-600 to-blue-700` → `from-jibca-burgundy to-jibca-burgundyPressed`
3. Lock icon: Add `text-jibca-gold`
4. Password strength indicators: `text-blue-600` → `text-jibca-gold`
5. Buttons: `bg-blue-600` → `bg-jibca-burgundy`
6. Focus rings: `focus:ring-blue-500` → `focus:ring-jibca-burgundy`
7. Validation icons: Blue → gold

**Acceptance Criteria:**
- [ ] No blue colors remain
- [ ] Password strength uses gold
- [ ] Header uses burgundy
- [ ] All buttons use burgundy
- [ ] Page renders correctly
- [ ] Mobile responsive

**Dependencies:** Task 1.1, Task 1.2

---

### Task 2.3: Update LoginPage.jsx
**File:** `app/frontend/src/pages/LoginPage.jsx`  
**Estimated Time:** 1 hour  
**Priority:** Critical

**Description:**
Fix verse icon and background. Most of the page is already correct.

**Changes:**
1. Background: `from-gray-50 to-gray-100` → subtle brown gradient (optional)
2. Verse icon background: `bg-blue-100` → `bg-jibca-gold/20`
3. Verse icon color: `text-blue-600` → `text-jibca-gold`

**Acceptance Criteria:**
- [ ] Verse icon uses gold
- [ ] Icon background uses gold/20
- [ ] No blue elements remain
- [ ] Existing burgundy elements unchanged
- [ ] Page renders correctly

**Dependencies:** Task 1.1, Task 1.2

---

## 🟠 PHASE 3: CORE LAYOUT (High Priority)

### Task 3.1: Update Layout.jsx Header
**File:** `app/frontend/src/components/Layout.jsx`  
**Estimated Time:** 1 hour  
**Priority:** High

**Description:**
Update logo background and Church icon color.

**Changes:**
1. Logo container: `bg-blue-600` → `bg-jibca-burgundy`
2. Church icon: `text-white` → `text-jibca-gold`

**Acceptance Criteria:**
- [ ] Logo background is burgundy
- [ ] Church icon is gold
- [ ] Active navigation unchanged (already correct)
- [ ] Logout button unchanged (already correct)
- [ ] Header renders correctly

**Dependencies:** Task 1.1

---

### Task 3.2: Update MobileNavigation.jsx
**File:** `app/frontend/src/components/MobileNavigation.jsx`  
**Estimated Time:** 1 hour  
**Priority:** High

**Description:**
Update active navigation item colors.

**Changes:**
1. Active text: `text-blue-600` → `text-jibca-burgundy`
2. Active background: `bg-blue-50` → `bg-jibca-burgundy/10`

**Acceptance Criteria:**
- [ ] Active items use burgundy
- [ ] Active background uses burgundy/10
- [ ] Inactive items unchanged
- [ ] Mobile navigation works correctly

**Dependencies:** Task 1.1

---

### Task 3.3: Update DashboardPage.jsx
**File:** `app/frontend/src/pages/DashboardPage.jsx`  
**Estimated Time:** 2 hours  
**Priority:** High

**Description:**
Update quick action cards and verse section.

**Changes:**
1. Quick action cards:
   - Background: `bg-blue-600` → `bg-jibca-burgundy`
   - Hover: `hover:bg-blue-700` → `hover:bg-jibca-burgundyHover`
   - Icons: Add `text-jibca-gold`
2. Verse section:
   - Icon background: `bg-blue-100` → `bg-jibca-gold/20`
   - Icon color: `text-blue-600` → `text-jibca-gold`
3. "Visualização completa" links:
   - Color: `text-blue-600` → `text-jibca-burgundy`
   - Hover: `hover:text-blue-700` → `hover:text-jibca-burgundyHover`

**Acceptance Criteria:**
- [ ] All action cards use burgundy
- [ ] Card icons use gold
- [ ] Verse section uses gold
- [ ] Links use burgundy
- [ ] Welcome banner unchanged (already correct)
- [ ] Dashboard renders correctly

**Dependencies:** Task 1.1

---

## 🟡 PHASE 4: COMPONENTS (Medium Priority)

### Task 4.1: Update EventCalendar.jsx
**File:** `app/frontend/src/components/EventCalendar.jsx`  
**Estimated Time:** 1.5 hours  
**Priority:** Medium

**Description:**
Update calendar icons and event links.

**Changes:**
1. Calendar icons: `text-blue-600` → `text-jibca-burgundy`
2. Event links: `text-blue-600 hover:text-blue-700` → `text-jibca-burgundy hover:text-jibca-burgundyHover`
3. Icon backgrounds: `bg-blue-100` → `bg-jibca-burgundy/10`

**Acceptance Criteria:**
- [ ] Calendar icons use burgundy
- [ ] Event links use burgundy
- [ ] Header unchanged (already correct)
- [ ] Event type colors unchanged (functional)
- [ ] Calendar renders correctly

**Dependencies:** Task 1.1

---

### Task 4.2: Update EventDetails.jsx
**File:** `app/frontend/src/components/EventDetails.jsx`  
**Estimated Time:** 1 hour  
**Priority:** Medium

**Description:**
Update edit button and back link.

**Changes:**
1. Edit button: `bg-blue-600 hover:bg-blue-700` → `bg-jibca-burgundy hover:bg-jibca-burgundyHover`
2. Back link: `text-blue-600` → `text-jibca-burgundy`
3. Detail icons: Blue → burgundy or gold (context dependent)

**Acceptance Criteria:**
- [ ] Edit button uses burgundy
- [ ] Back link uses burgundy
- [ ] Delete button unchanged (red is functional)
- [ ] Icons use appropriate JIBCA colors
- [ ] Page renders correctly

**Dependencies:** Task 1.1

---

### Task 4.3: Update EventForm.jsx
**File:** `app/frontend/src/components/EventForm.jsx`  
**Estimated Time:** 1.5 hours  
**Priority:** Medium

**Description:**
Update header gradient to exact JIBCA colors and fix focus rings.

**Changes:**
1. Header: `from-red-900 to-red-800` → `from-jibca-burgundy to-jibca-burgundyPressed`
2. Focus rings: `focus:ring-blue-500` → `focus:ring-jibca-burgundy`
3. Focus borders: `focus:border-blue-500` → `focus:border-jibca-burgundy`
4. Validation icons: Blue/green → gold/burgundy

**Acceptance Criteria:**
- [ ] Header uses exact JIBCA burgundy
- [ ] All focus rings use burgundy
- [ ] Validation icons use JIBCA colors
- [ ] Form functions correctly
- [ ] Mobile responsive

**Dependencies:** Task 1.1

---

### Task 4.4: Update MemberForm.jsx
**File:** `app/frontend/src/components/MemberForm.jsx`  
**Estimated Time:** 2 hours  
**Priority:** Medium

**Description:**
Complete overhaul of header and form elements.

**Changes:**
1. Header gradient: `from-slate-900 via-blue-900` → `from-jibca-burgundy to-jibca-burgundyPressed`
2. Icon container: Add `bg-jibca-gold/20 rounded-xl`
3. Icon color: `text-white` → `text-jibca-gold`
4. Buttons: `bg-blue-600` → `bg-jibca-burgundy`
5. Focus rings: Blue → burgundy

**Acceptance Criteria:**
- [ ] Header uses burgundy gradient
- [ ] Icons use gold
- [ ] All buttons use burgundy
- [ ] Focus rings use burgundy
- [ ] Form functions correctly
- [ ] Mobile responsive

**Dependencies:** Task 1.1

---

### Task 4.5: Update MemberList.jsx
**File:** `app/frontend/src/components/MemberList.jsx`  
**Estimated Time:** 1 hour  
**Priority:** Medium

**Description:**
Update "Novo Membro" button and active filters.

**Changes:**
1. "Novo Membro" button: `bg-blue-600 hover:bg-blue-700` → `bg-jibca-burgundy hover:bg-jibca-burgundyHover`
2. Active filters: `text-blue-600 bg-blue-50` → `text-jibca-burgundy bg-jibca-burgundy/10`

**Acceptance Criteria:**
- [ ] Button uses burgundy
- [ ] Active filters use burgundy
- [ ] Stats icons unchanged (functional colors)
- [ ] List renders correctly

**Dependencies:** Task 1.1

---

### Task 4.6: Update NotificationCard.jsx
**File:** `app/frontend/src/components/NotificationCard.jsx`  
**Estimated Time:** 1 hour  
**Priority:** Medium

**Description:**
Update unread indicators and mark as read button.

**Changes:**
1. Unread dot: `bg-blue-500` → `bg-jibca-burgundy`
2. Unread background: `bg-blue-50/30` → `bg-jibca-burgundy/10`
3. Unread text: `text-blue-600` → `text-jibca-burgundy`
4. Mark as read button: `text-blue-600` → `text-jibca-burgundy`

**Acceptance Criteria:**
- [ ] Unread indicator uses burgundy
- [ ] Unread background uses burgundy/10
- [ ] Button uses burgundy
- [ ] Notifications render correctly

**Dependencies:** Task 1.1

---

### Task 4.7: Update ConfirmationButton.jsx (Emoji Replacement)
**File:** `app/frontend/src/components/ConfirmationButton.jsx`  
**Estimated Time:** 2 hours  
**Priority:** Medium

**Description:**
Replace emojis with professional Lucide icons.

**Changes:**
1. Import icons: `import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'`
2. Replace ✅ with `<CheckCircle className="w-5 h-5" />`
3. Replace ❌ with `<XCircle className="w-5 h-5" />`
4. Replace ❓ with `<HelpCircle className="w-5 h-5" />`
5. Update status display to use icons
6. Ensure proper spacing with `flex items-center space-x-2`

**Acceptance Criteria:**
- [ ] No emojis remain
- [ ] CheckCircle used for confirmed
- [ ] XCircle used for declined
- [ ] HelpCircle used for maybe
- [ ] Status display uses icons
- [ ] Icons properly sized and aligned
- [ ] Functional colors maintained (green, red, yellow)
- [ ] Component functions correctly

**Dependencies:** Task 1.1

---

### Task 4.8: Update VerseOfTheDay.jsx
**File:** `app/frontend/src/components/VerseOfTheDay.jsx`  
**Estimated Time:** 1.5 hours  
**Priority:** Medium

**Description:**
Update modal gradient and button.

**Changes:**
1. Header gradient: `from-slate-900 via-blue-900` → `from-jibca-darkBrown via-jibca-darkerBrown`
2. Heart icon: `text-white` → `text-jibca-gold`
3. Button: `from-blue-600 to-purple-600` → `from-jibca-burgundy to-jibca-burgundyPressed`

**Acceptance Criteria:**
- [ ] Header uses dark brown gradient
- [ ] Heart icon uses gold
- [ ] Button uses burgundy gradient
- [ ] Modal renders correctly
- [ ] Animation works

**Dependencies:** Task 1.1, Task 1.2

---

### Task 4.9: Update ProfilePage.jsx
**File:** `app/frontend/src/pages/ProfilePage.jsx`  
**Estimated Time:** 1 hour  
**Priority:** Medium

**Description:**
Update focus rings and validation icons.

**Changes:**
1. Focus rings: `focus:ring-blue-500` → `focus:ring-jibca-burgundy`
2. Focus borders: `focus:border-blue-500` → `focus:border-jibca-burgundy`
3. Validation icons: Blue → gold

**Acceptance Criteria:**
- [ ] Focus rings use burgundy
- [ ] Validation icons use gold
- [ ] Header unchanged (already correct)
- [ ] Profile page functions correctly

**Dependencies:** Task 1.1

---

### Task 4.10: Update CalendarPage.jsx
**File:** `app/frontend/src/pages/CalendarPage.jsx`  
**Estimated Time:** 1 hour  
**Priority:** Medium

**Description:**
Update calendar icons and backgrounds.

**Changes:**
1. Icon backgrounds: `bg-blue-100` → `bg-jibca-burgundy/10`
2. Icon colors: `text-blue-600` → `text-jibca-burgundy`

**Acceptance Criteria:**
- [ ] Icons use burgundy
- [ ] Icon backgrounds use burgundy/10
- [ ] Calendar renders correctly

**Dependencies:** Task 1.1

---

## 🟢 PHASE 5: REFINEMENT (Low Priority)

### Task 5.1: Global Focus Ring Audit
**Files:** All components  
**Estimated Time:** 2 hours  
**Priority:** Low

**Description:**
Search and replace any remaining blue focus rings across all files.

**Search Pattern:** `focus:ring-blue-`  
**Replace With:** `focus:ring-jibca-burgundy`

**Acceptance Criteria:**
- [ ] No blue focus rings remain
- [ ] All focus rings use burgundy
- [ ] Focus states visible and accessible

**Dependencies:** All previous tasks

---

### Task 5.2: Global Link Audit
**Files:** All components  
**Estimated Time:** 1.5 hours  
**Priority:** Low

**Description:**
Search and replace any remaining blue links.

**Search Pattern:** `text-blue-6`  
**Replace With:** `text-jibca-burgundy`

**Acceptance Criteria:**
- [ ] No blue links remain
- [ ] All links use burgundy
- [ ] Hover states work correctly

**Dependencies:** All previous tasks

---

### Task 5.3: Global Icon Background Audit
**Files:** All components  
**Estimated Time:** 1 hour  
**Priority:** Low

**Description:**
Search and replace any remaining blue icon backgrounds.

**Search Pattern:** `bg-blue-`  
**Replace With:** `bg-jibca-burgundy/10` or `bg-jibca-gold/20` (context dependent)

**Acceptance Criteria:**
- [ ] No blue icon backgrounds remain
- [ ] All backgrounds use JIBCA colors
- [ ] Visual hierarchy maintained

**Dependencies:** All previous tasks

---

### Task 5.4: Visual Regression Testing
**Files:** All components  
**Estimated Time:** 3 hours  
**Priority:** Low

**Description:**
Comprehensive visual testing of all updated components.

**Test Cases:**
1. Screenshot each page/component
2. Compare with design specifications
3. Test on Chrome, Firefox, Safari, Edge
4. Test on mobile devices (iOS, Android)
5. Test keyboard navigation
6. Test screen reader compatibility

**Acceptance Criteria:**
- [ ] All components match design
- [ ] No visual regressions
- [ ] Cross-browser compatible
- [ ] Mobile responsive
- [ ] Accessible

**Dependencies:** All previous tasks

---

### Task 5.5: Accessibility Audit
**Files:** All components  
**Estimated Time:** 2 hours  
**Priority:** Low

**Description:**
Verify all color changes meet WCAG AA standards.

**Test Cases:**
1. Run Lighthouse accessibility audit
2. Check contrast ratios for all text
3. Verify focus indicators visible
4. Test with color blindness simulators
5. Test with screen readers

**Acceptance Criteria:**
- [ ] Lighthouse score ≥ 90
- [ ] All contrast ratios ≥ 4.5:1 (AA)
- [ ] Focus indicators visible
- [ ] Color blind friendly
- [ ] Screen reader compatible

**Dependencies:** All previous tasks

---

### Task 5.6: Documentation Update
**Files:** README.md, component docs  
**Estimated Time:** 1 hour  
**Priority:** Low

**Description:**
Update documentation to reflect new color system.

**Changes:**
1. Update README with JIBCA color palette
2. Document color usage guidelines
3. Update component examples
4. Add migration notes

**Acceptance Criteria:**
- [ ] README updated
- [ ] Color guidelines documented
- [ ] Examples updated
- [ ] Migration notes added

**Dependencies:** All previous tasks

---

## 📊 Task Summary by Phase

### Phase 1: Foundation (Critical)
- 3 tasks
- ~2 hours
- Must complete before other phases

### Phase 2: Authentication (Critical)
- 3 tasks
- ~5 hours
- Highest user impact

### Phase 3: Core Layout (High)
- 3 tasks
- ~4 hours
- Affects all pages

### Phase 4: Components (Medium)
- 10 tasks
- ~14 hours
- Individual component updates

### Phase 5: Refinement (Low)
- 6 tasks
- ~10.5 hours
- Polish and validation

**Total: 23 tasks, ~35.5 hours**

---

## 🎯 Implementation Order

Recommended order for maximum efficiency:

1. **Day 1:** Phase 1 (Foundation) - Tasks 1.1, 1.2, 1.3
2. **Day 2:** Phase 2 (Authentication) - Tasks 2.1, 2.2, 2.3
3. **Day 3:** Phase 3 (Core Layout) - Tasks 3.1, 3.2, 3.3
4. **Day 4-5:** Phase 4 (Components) - Tasks 4.1-4.10
5. **Day 6:** Phase 5 (Refinement) - Tasks 5.1-5.6

---

## ✅ Definition of Done (Per Task)

Each task is complete when:

- [ ] Code changes implemented
- [ ] Component renders without errors
- [ ] No console warnings
- [ ] Visual appearance matches design
- [ ] Mobile responsive
- [ ] Accessibility maintained
- [ ] Git commit with clear message
- [ ] Self-review completed

---

## 🔄 Testing Checklist (Per Task)

Before marking task complete:

- [ ] Component loads without errors
- [ ] All interactive elements work
- [ ] Hover states function correctly
- [ ] Focus states visible
- [ ] Mobile view tested
- [ ] No blue colors remain (except functional)
- [ ] JIBCA colors applied correctly
- [ ] No layout breaks

---

## 📝 Git Commit Message Template

```
feat(jibca-identity): [Component] - Replace blue with JIBCA colors

- Update [specific element] from blue to burgundy
- Update [specific element] from blue to gold
- Replace [emoji] with [Lucide icon]
- Update focus rings to use burgundy

Closes #[issue-number]
```

---

## 🚀 Ready to Start!

All tasks are defined and ready for implementation. Begin with Phase 1 to establish the foundation, then proceed through phases sequentially.

**Next Step:** Start with Task 1.1 - Update Tailwind Configuration
