# Requirements: JIBCA Visual Identity Implementation

**Spec ID:** jibca-visual-identity  
**Created:** 05/03/2026  
**Status:** Draft  
**Priority:** Critical

---

## 🎯 Objective

Align the entire frontend application with the official JIBCA visual identity, replacing all inconsistent blue elements with the official color palette (dark brown, gold/beige, dark red) while maintaining functional colors for status indicators.

---

## 📋 Background

The current system uses blue (#3B82F6) extensively throughout the interface, which conflicts with the JIBCA youth group's official visual identity featuring:
- Dark brown tones for backgrounds
- Gold/beige for highlights and accents
- Dark red/burgundy for primary actions
- A lion with crown logo representing strength and leadership

This inconsistency weakens brand recognition and creates a disconnect between the digital platform and the physical JIBCA identity.

---

## 👥 Stakeholders

- **Primary:** JIBCA Youth Group Members (end users)
- **Secondary:** JIBCA Leadership Team
- **Technical:** Frontend Development Team

---

## 🎨 Official JIBCA Color Palette

### Primary Colors
- **Dark Brown:** `#2D1810` (main backgrounds)
- **Darker Brown:** `#1A0F0A` (deeper backgrounds)
- **Gold:** `#D4C4B0` (highlights and accents)
- **Gold Light:** `#E8DCC8` (lighter accents)
- **Burgundy:** `#8B0000` (primary actions)
- **Burgundy Hover:** `#A52A2A` (hover states)
- **Burgundy Pressed:** `#6B0000` (pressed states)

### Functional Colors (Keep)
- **Success:** `#10B981` (green)
- **Warning:** `#F59E0B` (yellow)
- **Danger:** `#EF4444` (red)
- **Info:** `#64748B` (gray)

### Event Type Colors (Keep)
- Culto: Blue, Retiro: Green, Reunião: Yellow, etc. (functional differentiation)

---

## 📊 User Stories

### US-1: Consistent Authentication Experience
**As a** JIBCA member  
**I want** the login, password reset, and forgot password pages to reflect JIBCA's visual identity  
**So that** I feel connected to the organization from my first interaction

**Acceptance Criteria:**
- [ ] Login page uses dark brown backgrounds with gold accents
- [ ] Forgot password page uses JIBCA gradient (dark brown to darker brown)
- [ ] Reset password page header uses burgundy gradient
- [ ] All buttons use burgundy (#8B0000) instead of blue
- [ ] Bible verse icon uses gold instead of blue
- [ ] Church icon uses gold color on burgundy background
- [ ] No blue colors remain except in functional status indicators

---

### US-2: Branded Navigation and Layout
**As a** user navigating the system  
**I want** the header, navigation, and layout to use JIBCA colors  
**So that** I have a consistent branded experience throughout the app

**Acceptance Criteria:**
- [ ] Header logo background uses burgundy (#8B0000)
- [ ] Church icon in header uses gold (#D4C4B0)
- [ ] Active navigation items use burgundy text and background
- [ ] Mobile navigation active states use burgundy
- [ ] "Sair" (logout) button maintains burgundy (already correct)
- [ ] No blue colors in navigation elements

---

### US-3: JIBCA-Branded Dashboard
**As a** user viewing the dashboard  
**I want** all action cards and elements to use JIBCA colors  
**So that** the main interface reflects the organization's identity

**Acceptance Criteria:**
- [ ] Quick action cards use burgundy backgrounds
- [ ] Card icons use gold color
- [ ] Bible verse section uses gold icons on dark brown background
- [ ] "Visualização completa" links use burgundy
- [ ] Welcome banner maintains burgundy (already correct)
- [ ] No blue gradients or backgrounds remain

---

### US-4: Consistent Event Management
**As a** user managing events  
**I want** event forms, details, and calendar to use JIBCA colors  
**So that** event management feels cohesive with the brand

**Acceptance Criteria:**
- [ ] EventForm header uses exact burgundy gradient (#8B0000 to #6B0000)
- [ ] EventDetails edit button uses burgundy
- [ ] EventCalendar icons use burgundy or gold
- [ ] Event links use burgundy hover states
- [ ] Calendar page icons use burgundy with light backgrounds
- [ ] Focus rings use burgundy instead of blue
- [ ] Event type colors remain unchanged (functional)

---

### US-5: Professional Confirmation Buttons
**As a** user confirming event attendance  
**I want** professional icons instead of emojis  
**So that** the interface looks polished and consistent

**Acceptance Criteria:**
- [ ] Replace ✅ emoji with CheckCircle icon from Lucide
- [ ] Replace ❌ emoji with XCircle icon from Lucide
- [ ] Replace ❓ emoji with HelpCircle icon from Lucide
- [ ] Status display uses icons instead of emojis
- [ ] Icons maintain functional colors (green, red, yellow)
- [ ] Icons are properly sized and aligned

---

### US-6: Branded Member Management
**As a** user managing members  
**I want** member forms and lists to use JIBCA colors  
**So that** member management is visually consistent

**Acceptance Criteria:**
- [ ] MemberForm header uses burgundy gradient (not blue)
- [ ] "Novo Membro" button uses burgundy
- [ ] Active filters use burgundy
- [ ] Form icons use gold color
- [ ] Focus rings use burgundy
- [ ] No blue gradients remain

---

### US-7: JIBCA-Styled Notifications
**As a** user receiving notifications  
**I want** notification indicators to use JIBCA colors  
**So that** notifications feel integrated with the brand

**Acceptance Criteria:**
- [ ] Unread indicator uses burgundy (#8B0000)
- [ ] Unread background uses burgundy with transparency
- [ ] "Marcar como lida" button uses burgundy
- [ ] Notification icons use gold or burgundy
- [ ] No blue notification elements remain

---

### US-8: Consistent Verse of the Day
**As a** user viewing the daily verse  
**I want** the verse modal to use JIBCA colors  
**So that** spiritual content aligns with the brand

**Acceptance Criteria:**
- [ ] Modal header uses dark brown gradient
- [ ] Heart icon uses gold color
- [ ] "Continuar" button uses burgundy gradient
- [ ] No blue or purple gradients remain

---

### US-9: Branded Profile Page
**As a** user managing my profile  
**I want** profile elements to use JIBCA colors  
**So that** my personal settings reflect the brand

**Acceptance Criteria:**
- [ ] Profile header maintains burgundy gradient (already correct)
- [ ] Save buttons use burgundy
- [ ] Focus rings use burgundy
- [ ] Validation icons use gold
- [ ] No blue elements remain

---

### US-10: Updated Theme Configuration
**As a** developer  
**I want** centralized theme configuration with JIBCA colors  
**So that** future components automatically use the correct palette

**Acceptance Criteria:**
- [ ] tailwind.config.js defines complete JIBCA palette
- [ ] Primary colors changed from blue to burgundy
- [ ] index.css includes all JIBCA CSS variables
- [ ] No blue color definitions remain in primary palette
- [ ] Functional colors remain separate and unchanged

---

## 🚫 Out of Scope

The following are explicitly OUT of scope for this spec:

1. **Logo Replacement:** Using actual JIBCA logo instead of Church icon (future enhancement)
2. **UX Improvements:** Dashboard graphs, notifications, search, etc. (separate spec)
3. **New Features:** Comments, photo galleries, sharing (separate spec)
4. **Backend Changes:** No API or database modifications
5. **Content Changes:** No text or copy modifications
6. **Functional Color Changes:** Event type colors, status colors remain unchanged

---

## ✅ Success Criteria

This spec is considered complete when:

1. **Zero Blue Elements:** No blue (#3B82F6) colors remain except in functional status indicators and event type badges
2. **Complete JIBCA Palette:** All interactive elements use burgundy, gold, or dark brown
3. **Professional Icons:** No emojis remain in the interface
4. **Consistent Gradients:** All gradients use JIBCA colors
5. **Theme Configuration:** Tailwind and CSS variables fully updated
6. **Visual Regression:** No broken layouts or styling issues
7. **Accessibility:** All color changes maintain WCAG AA contrast ratios
8. **Cross-Browser:** Consistent appearance in Chrome, Firefox, Safari, Edge

---

## 📏 Constraints

1. **No Breaking Changes:** Existing functionality must remain intact
2. **Maintain Functional Colors:** Green (success), red (error), yellow (warning) stay unchanged
3. **Event Type Colors:** Keep existing event type color coding for differentiation
4. **Accessibility:** Maintain or improve current contrast ratios
5. **Performance:** No performance degradation from color changes
6. **Mobile Responsive:** All changes must work on mobile devices

---

## 🔗 Dependencies

- **Analysis Document:** ANALISE_IDENTIDADE_VISUAL_JIBCA.md (reference for all inconsistencies)
- **Lucide React:** Already installed (for icon replacements)
- **Tailwind CSS:** Already configured (needs palette update)
- **No New Dependencies:** All changes use existing libraries

---

## 📊 Metrics

### Before Implementation:
- Blue color usage: ~70% of components
- JIBCA color usage: ~30% of components
- Emoji usage: 1 component (ConfirmationButton)

### After Implementation:
- Blue color usage: 0% (except functional/event types)
- JIBCA color usage: 100% of brand elements
- Emoji usage: 0%

---

## 🎯 Definition of Done

- [ ] All 10 user stories have passing acceptance criteria
- [ ] Visual regression testing completed
- [ ] No console errors or warnings
- [ ] Mobile responsive testing passed
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Stakeholder approval received

---

## 📝 Notes

1. **Phased Approach:** Implementation will follow 4 phases (Critical → High → Medium → Refinement)
2. **Testing Strategy:** Visual regression tests for each component
3. **Rollback Plan:** Git branches allow easy rollback if issues arise
4. **Communication:** Update JIBCA leadership on progress weekly

---

**Next Step:** Create design.md with detailed implementation approach
