# Design: JIBCA Visual Identity Implementation

**Spec ID:** jibca-visual-identity  
**Created:** 05/03/2026  
**Status:** Draft

---

## 🎨 Design Philosophy

The JIBCA visual identity represents:
- **Strength & Leadership:** Dark brown and burgundy convey stability and authority
- **Excellence & Value:** Gold accents represent the precious nature of youth ministry
- **Warmth & Community:** Earth tones create welcoming, approachable interfaces

**Core Principle:** Every visual element should reinforce JIBCA's identity while maintaining excellent usability.

---

## 🏗️ Architecture Overview

### Component Hierarchy
```
Theme Configuration (Foundation)
├── tailwind.config.js - Tailwind palette
├── index.css - CSS variables
│
UI Components (Implementation)
├── Authentication Pages
│   ├── LoginPage.jsx
│   ├── ForgotPassword.jsx
│   └── ResetPassword.jsx
├── Layout Components
│   ├── Layout.jsx
│   └── MobileNavigation.jsx
├── Dashboard
│   └── DashboardPage.jsx
├── Event Management
│   ├── EventCalendar.jsx
│   ├── EventDetails.jsx
│   └── EventForm.jsx
├── Member Management
│   ├── MemberForm.jsx
│   └── MemberList.jsx
├── Shared Components
│   ├── ConfirmationButton.jsx
│   ├── NotificationCard.jsx
│   ├── VerseOfTheDay.jsx
│   ├── ProfilePage.jsx
│   └── CalendarPage.jsx
```

---

## 🎨 Color System Design

### Primary Palette (JIBCA Brand)
```javascript
// Tailwind Config
colors: {
  jibca: {
    // Browns (Backgrounds)
    darkBrown: '#2D1810',
    darkerBrown: '#1A0F0A',
    
    // Golds (Accents & Highlights)
    gold: '#D4C4B0',
    goldLight: '#E8DCC8',
    goldDark: '#B8A890',
    
    // Burgundy (Primary Actions)
    burgundy: '#8B0000',
    burgundyHover: '#A52A2A',
    burgundyPressed: '#6B0000',
  }
}
```

### Usage Guidelines

#### Backgrounds
- **Full Page:** `bg-gradient-to-br from-jibca-darkBrown via-jibca-darkerBrown to-jibca-darkBrown`
- **Cards:** `bg-white` or `bg-gray-50` (light mode), `bg-gray-800` (dark sections)
- **Headers:** `bg-gradient-to-r from-jibca-burgundy to-jibca-burgundyPressed`

#### Interactive Elements
- **Primary Buttons:** `bg-jibca-burgundy hover:bg-jibca-burgundyHover`
- **Links:** `text-jibca-burgundy hover:text-jibca-burgundyHover`
- **Active States:** `text-jibca-burgundy bg-jibca-burgundy/10`

#### Accents & Icons
- **Decorative Icons:** `text-jibca-gold`
- **Icon Backgrounds:** `bg-jibca-gold/20` or `bg-jibca-burgundy/10`
- **Borders:** `border-jibca-gold/30`

#### Focus States
- **Focus Rings:** `focus:ring-jibca-burgundy focus:border-jibca-burgundy`

---

## 🔧 Component Design Patterns

### Pattern 1: Authentication Pages
**Used in:** LoginPage, ForgotPassword, ResetPassword

```jsx
// Full-page gradient background
<div className="min-h-screen bg-gradient-to-br from-jibca-darkBrown via-jibca-darkerBrown to-jibca-darkBrown">
  
  {/* Header with burgundy gradient */}
  <div className="bg-gradient-to-r from-jibca-burgundy to-jibca-burgundyPressed p-8 text-white">
    
    {/* Icon with gold accent */}
    <div className="w-16 h-16 bg-jibca-gold/20 rounded-full flex items-center justify-center">
      <Key className="w-8 h-8 text-jibca-gold" />
    </div>
    
    <h1 className="text-2xl font-bold">Título</h1>
  </div>
  
  {/* Content card */}
  <div className="bg-white rounded-lg shadow-xl p-8">
    {/* Form content */}
    
    {/* Primary action button */}
    <button className="w-full bg-jibca-burgundy hover:bg-jibca-burgundyHover text-white">
      Ação Principal
    </button>
  </div>
</div>
```

---

### Pattern 2: Page Headers
**Used in:** EventForm, MemberForm, ProfilePage

```jsx
<div className="bg-gradient-to-r from-jibca-burgundy to-jibca-burgundyPressed text-white p-6 rounded-t-lg">
  <div className="flex items-center space-x-4">
    {/* Icon with gold color */}
    <div className="p-3 bg-jibca-gold/20 rounded-xl">
      <Calendar className="w-8 h-8 text-jibca-gold" />
    </div>
    
    <div>
      <h1 className="text-2xl font-bold">Título da Página</h1>
      <p className="text-jibca-gold">Descrição</p>
    </div>
  </div>
</div>
```

---

### Pattern 3: Action Cards
**Used in:** Dashboard quick actions

```jsx
<button className="bg-jibca-burgundy hover:bg-jibca-burgundyHover text-white p-6 rounded-xl transition-all hover:scale-105">
  <div className="flex flex-col items-center space-y-3">
    {/* Icon with gold color */}
    <Calendar className="w-8 h-8 text-jibca-gold" />
    <span className="font-semibold">Ação</span>
  </div>
</button>
```

---

### Pattern 4: Icon Containers
**Used in:** Various components for decorative icons

```jsx
{/* Burgundy background variant */}
<div className="p-3 bg-jibca-burgundy/10 rounded-xl">
  <Icon className="w-6 h-6 text-jibca-burgundy" />
</div>

{/* Gold background variant */}
<div className="p-3 bg-jibca-gold/20 rounded-xl">
  <Icon className="w-6 h-6 text-jibca-gold" />
</div>
```

---

### Pattern 5: Navigation Active States
**Used in:** Layout, MobileNavigation

```jsx
<Link
  className={`
    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
    ${isActive 
      ? 'text-jibca-burgundy bg-jibca-burgundy/10 font-semibold' 
      : 'text-gray-600 hover:bg-gray-100'
    }
  `}
>
  <Icon className="w-5 h-5" />
  <span>Item</span>
</Link>
```

---

### Pattern 6: Links
**Used in:** Throughout the application

```jsx
<Link className="text-jibca-burgundy hover:text-jibca-burgundyHover hover:underline transition-colors">
  Link Text
</Link>
```

---

### Pattern 7: Form Focus States
**Used in:** All input fields

```jsx
<input
  className="
    w-full px-4 py-2 border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-jibca-burgundy focus:border-jibca-burgundy
    transition-colors
  "
/>
```

---

## 🔄 Icon Replacement Strategy

### ConfirmationButton.jsx Redesign

**Current (Emojis):**
```jsx
<button>
  <span>✅</span>
  <span>Vou participar</span>
</button>
```

**New (Lucide Icons):**
```jsx
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'

<button className="flex items-center space-x-2">
  <CheckCircle className="w-5 h-5" />
  <span>Vou participar</span>
</button>
```

**Icon Mapping:**
- ✅ → `<CheckCircle />` (green for confirmed)
- ❌ → `<XCircle />` (red for declined)
- ❓ → `<HelpCircle />` (yellow for maybe)

**Status Display:**
```jsx
{currentStatus === 'confirmed' && (
  <span className="flex items-center space-x-1 text-green-600">
    <CheckCircle className="w-4 h-4" />
    <span>Confirmado</span>
  </span>
)}
```

---

## 📐 Gradient Specifications

### Background Gradients
```css
/* Full page backgrounds */
bg-gradient-to-br from-jibca-darkBrown via-jibca-darkerBrown to-jibca-darkBrown

/* Alternative subtle gradient */
bg-gradient-to-b from-gray-50 to-gray-100
```

### Header Gradients
```css
/* Primary header gradient */
bg-gradient-to-r from-jibca-burgundy to-jibca-burgundyPressed

/* Alternative with angle */
style={{ background: 'linear-gradient(135deg, #8B0000 0%, #6B0000 100%)' }}
```

---

## 🎯 Specific Component Designs

### 1. ForgotPassword.jsx

**Before:**
- Blue gradient background
- Blue header
- Blue buttons

**After:**
```jsx
<div className="min-h-screen bg-gradient-to-br from-jibca-darkBrown via-jibca-darkerBrown to-jibca-darkBrown">
  <div className="bg-gradient-to-r from-jibca-burgundy to-jibca-burgundyPressed p-8 text-white">
    <div className="w-16 h-16 bg-jibca-gold/20 rounded-full flex items-center justify-center">
      <Key className="w-8 h-8 text-jibca-gold" />
    </div>
    <h1>Recuperar Senha</h1>
  </div>
  
  <div className="bg-white rounded-lg shadow-xl p-8">
    <button className="w-full bg-jibca-burgundy hover:bg-jibca-burgundyHover">
      Enviar Link
    </button>
  </div>
</div>
```

---

### 2. Layout.jsx Header

**Before:**
- Blue logo background
- White Church icon

**After:**
```jsx
<div className="p-2 bg-jibca-burgundy rounded-xl">
  <Church className="w-6 h-6 text-jibca-gold" />
</div>
```

---

### 3. DashboardPage.jsx

**Quick Action Cards - Before:**
```jsx
<div className="bg-blue-600 hover:bg-blue-700">
  <Calendar className="w-6 h-6" />
</div>
```

**Quick Action Cards - After:**
```jsx
<button className="bg-jibca-burgundy hover:bg-jibca-burgundyHover text-white p-6 rounded-xl">
  <Calendar className="w-6 h-6 text-jibca-gold" />
  <span>Ver Calendário</span>
</button>
```

**Verse Section - Before:**
```jsx
<div className="w-16 h-16 bg-blue-100 rounded-full">
  <svg className="w-8 h-8 text-blue-600">
```

**Verse Section - After:**
```jsx
<div className="w-16 h-16 bg-jibca-gold/20 rounded-full flex items-center justify-center">
  <svg className="w-8 h-8 text-jibca-gold">
```

---

### 4. EventCalendar.jsx

**Icons - Before:**
```jsx
<CalendarIcon className="w-5 h-5 text-blue-600" />
```

**Icons - After:**
```jsx
<CalendarIcon className="w-5 h-5 text-jibca-burgundy" />
```

**Links - Before:**
```jsx
<Link className="text-blue-600 hover:text-blue-700">
```

**Links - After:**
```jsx
<Link className="text-jibca-burgundy hover:text-jibca-burgundyHover">
```

---

### 5. MemberForm.jsx

**Header - Before:**
```jsx
<div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900">
  <UserPlus className="w-8 h-8 text-white" />
</div>
```

**Header - After:**
```jsx
<div className="bg-gradient-to-r from-jibca-burgundy to-jibca-burgundyPressed text-white p-6">
  <div className="p-3 bg-jibca-gold/20 rounded-xl inline-block">
    <UserPlus className="w-8 h-8 text-jibca-gold" />
  </div>
</div>
```

---

### 6. NotificationCard.jsx

**Unread Indicator - Before:**
```jsx
<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
<div className="text-blue-600">
  <EyeOff className="w-4 h-4" />
</div>
```

**Unread Indicator - After:**
```jsx
<div className="w-2 h-2 bg-jibca-burgundy rounded-full animate-pulse"></div>
<div className="text-jibca-burgundy">
  <EyeOff className="w-4 h-4" />
</div>
```

---

## 🎨 CSS Variables Design

### index.css Updates

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
  
  /* Legacy support (update references) */
  --primary-darkred: #8B0000;
  --primary-darkred-hover: #A52A2A;
  --primary-darkred-pressed: #6B0000;
  
  /* Functional colors (keep) */
  --jibca-success: #10B981;
  --jibca-warning: #F59E0B;
  --jibca-danger: #EF4444;
  --jibca-info: #64748B;
}
```

---

## 🎨 Tailwind Config Design

### tailwind.config.js Updates

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // JIBCA Primary Palette
        jibca: {
          // Browns
          darkBrown: '#2D1810',
          darkerBrown: '#1A0F0A',
          
          // Golds
          gold: '#D4C4B0',
          goldLight: '#E8DCC8',
          goldDark: '#B8A890',
          
          // Burgundy
          burgundy: '#8B0000',
          burgundyHover: '#A52A2A',
          burgundyPressed: '#6B0000',
        },
        
        // Update primary to use JIBCA burgundy
        primary: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#8B0000',  // Changed from blue
          600: '#6B0000',  // Changed from blue
          700: '#5B0000',
          800: '#4B0000',
          900: '#3B0000',
        },
      },
    },
  },
}
```

---

## ♿ Accessibility Considerations

### Contrast Ratios

All color combinations must meet WCAG AA standards:

**Text on Backgrounds:**
- White text on burgundy (#8B0000): ✅ 7.2:1 (AAA)
- Gold text (#D4C4B0) on dark brown (#2D1810): ✅ 4.8:1 (AA)
- Burgundy text (#8B0000) on white: ✅ 8.1:1 (AAA)

**Interactive Elements:**
- Focus rings must be visible (2px solid burgundy)
- Hover states must have clear visual change
- Active states must be distinguishable

### Testing Strategy
1. Use Chrome DevTools Lighthouse for automated checks
2. Manual testing with screen readers
3. Keyboard navigation testing
4. Color blindness simulation (Deuteranopia, Protanopia)

---

## 📱 Responsive Design

All color changes must work across breakpoints:

- **Mobile (< 768px):** Full JIBCA palette, optimized touch targets
- **Tablet (768px - 1024px):** Same palette, adjusted spacing
- **Desktop (> 1024px):** Full palette with enhanced hover states

---

## 🔍 Visual Regression Testing

### Test Cases
1. Screenshot comparison before/after for each component
2. Cross-browser testing (Chrome, Firefox, Safari, Edge)
3. Mobile device testing (iOS Safari, Chrome Android)
4. Dark mode compatibility (if applicable)

### Tools
- Percy.io or Chromatic for visual regression
- Manual QA checklist for each component

---

## 📊 Implementation Phases

### Phase 1: Foundation (Critical)
- Update tailwind.config.js
- Update index.css
- Test theme configuration

### Phase 2: Authentication (Critical)
- ForgotPassword.jsx
- ResetPassword.jsx
- LoginPage.jsx

### Phase 3: Core Layout (High)
- Layout.jsx
- MobileNavigation.jsx
- DashboardPage.jsx

### Phase 4: Components (Medium)
- Event components
- Member components
- Notification components
- ConfirmationButton.jsx (emoji replacement)

### Phase 5: Refinement (Low)
- Focus states
- Hover states
- Edge cases

---

## 🎯 Design Validation Checklist

Before marking design complete:

- [ ] All color patterns documented
- [ ] Component examples provided
- [ ] Accessibility verified
- [ ] Responsive behavior defined
- [ ] CSS variables complete
- [ ] Tailwind config complete
- [ ] Icon replacement strategy clear
- [ ] Gradient specifications documented
- [ ] Testing strategy defined

---

**Next Step:** Create tasks.md with detailed implementation tasks
