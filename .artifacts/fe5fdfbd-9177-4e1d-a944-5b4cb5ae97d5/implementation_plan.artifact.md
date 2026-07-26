# Implementation Plan: Advanced Theme Management & UX Polish

This plan addresses the theme synchronization bug, implements a professional animated theme switch, and ensures full UI visibility across both Light and Dark modes.

## 1. Theme Synchronization Fix
The "out-of-sync" issue happens because the state initializes as `null` and waits for a click to sync with the system.
- **Fix**: We will initialize `ThemeViewModel` with the current system theme state directly from `MainActivity`.

## 2. Premium Theme Switch Component
Instead of a simple icon button, we will implement a modern sliding toggle switch.
- **Design**: A rounded pill with Sun (Light) and Moon (Dark) icons.
- **Motion**: Spring-based sliding animation for the toggle handle.
- **Placement**: Fixed in the top-right corner of all major screens.

## 3. Global UI Visibility Audit
We will refine the following components to ensure perfect readability:
- **`ModernTextField`**: Glowing borders will use a dynamic alpha that adjusts to the background luminosity.
- **`ModernCard`**: Surface colors will be audited to ensure high contrast against the `BackgroundDark` (Midnight Navy).
- **Form Labels**: Ensure `MaterialTheme.typography` colors are strictly mapped to the theme tokens.

## Proposed Changes

### [Component] Theme Engine
#### [MODIFY] [ThemeViewModel.kt](file:///C:/hireblue/Hire-Blue/android_app/app/src/main/java/com/aram/ftc/ui/theme/ThemeViewModel.kt)
- Add a `setInitialTheme(isDark: Boolean)` method or update constructor to prevent the initial `null` state.

### [Component] Shared UI
#### [NEW] [ThemeSwitch.kt](file:///C:/hireblue/Hire-Blue/android_app/app/src/main/java/com/aram/ftc/ui/components/ThemeSwitch.kt)
- A reusable sliding toggle component.

#### [NEW] [AramHeader.kt](file:///C:/hireblue/Hire-Blue/android_app/app/src/main/java/com/aram/ftc/ui/components/AramHeader.kt)
- A standardized TopBar that includes the ARAM branding and the `ThemeSwitch`.

### [Component] Screens
#### [MODIFY] All Portals
- Refactor all screens to use the standardized `AramHeader` for consistency.

## Verification Plan
1. **Cold Start Test**: Set the phone to Dark Mode, start the app. Verify the toggle starts in the "Moon" state and the UI is Dark Navy.
2. **Interaction Test**: Toggle the theme multiple times. Verify smooth spring motion.
3. **Contrast Audit**: View the Candidate Wizard in both modes. Ensure "Date of Birth" labels and input borders are clearly visible.
