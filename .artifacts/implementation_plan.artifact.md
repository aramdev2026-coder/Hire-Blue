# Implementation Plan - Fix Red Code and UI Errors

The project currently has several compilation errors in the UI code, specifically a typo in `CardDefaults` method calls and usage of deprecated APIs.

## User Review Required
> [!IMPORTANT]
> I have identified a widespread typo `cardCardElevation` instead of `cardElevation` in all Compose screens. I will also be updating deprecated Kotlin and Security API calls to ensure better compatibility with the latest libraries.

## Proposed Changes

### Build Configuration
#### [MODIFY] [app/build.gradle.kts](file:///C:/hireblue/Hire-Blue/android_app/app/build.gradle.kts)
- Align the `plugins` block to use Version Catalog `alias(...)` for consistency.

### UI Screens
#### [MODIFY] [RoleSelectionScreen.kt](file:///C:/hireblue/Hire-Blue/android_app/app/src/main/java/com/aram/ftc/ui/screens/RoleSelectionScreen.kt)
#### [MODIFY] [CandidateLoginScreen.kt](file:///C:/hireblue/Hire-Blue/android_app/app/src/main/java/com/aram/ftc/ui/screens/CandidateLoginScreen.kt)
#### [MODIFY] [CandidateWizardScreen.kt](file:///C:/hireblue/Hire-Blue/android_app/app/src/main/java/com/aram/ftc/ui/screens/CandidateWizardScreen.kt)
#### [MODIFY] [CandidateDashboardScreen.kt](file:///C:/hireblue/Hire-Blue/android_app/app/src/main/java/com/aram/ftc/ui/screens/CandidateDashboardScreen.kt)
#### [MODIFY] [EmployerAuthScreen.kt](file:///C:/hireblue/Hire-Blue/android_app/app/src/main/java/com/aram/ftc/ui/screens/EmployerAuthScreen.kt)
#### [MODIFY] [EmployerDashboardScreen.kt](file:///C:/hireblue/Hire-Blue/android_app/app/src/main/java/com/aram/ftc/ui/screens/EmployerDashboardScreen.kt)
- Fix `CardDefaults.cardCardElevation` to `CardDefaults.cardElevation`.
- Replace `toLowerCase()` with `lowercase()` where applicable.

### Data Layer
#### [MODIFY] [SessionManager.kt](file:///C:/hireblue/Hire-Blue/android_app/app/src/main/java/com/aram/ftc/data/pref/SessionManager.kt)
- Update `MasterKeys` usage to the modern `MasterKey.Builder` API for encrypted preferences.

## Verification Plan

### Automated Tests
- Run `gradle_sync` to ensure build configuration is stable.
- Run `gradle_build` (assembleDebug) to verify all Kotlin compiler errors are resolved.

### Manual Verification
- I will check specific files with `analyze_file` after the changes to ensure no new errors are introduced.
