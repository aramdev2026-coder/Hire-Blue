# Fix Gradle Sync Error: AGP Incompatibility with Gradle 9.6.0

The project is failing to sync because the current Android Gradle Plugin (AGP) version **8.13.2** is incompatible with **Gradle 9.6.1**. Gradle 9.6.0 removed internal APIs (`InternalProblems`) that AGP 8.x relies on.

## Proposed Changes

### Build Configuration

#### [MODIFY] [gradle-wrapper.properties](file:///C:/hireblue/Hire-Blue/android_app/gradle/wrapper/gradle-wrapper.properties)
- Downgrade the Gradle distribution URL from version `9.6.1` to `9.5.1`. This version still includes the internal APIs required by AGP 8.13.2.

> [!NOTE]
> The error message explicitly suggests using Gradle 9.5 as a fix. This is the safest and least invasive approach to restore project sync without requiring a major upgrade of AGP and other dependencies (like Kotlin or Compose), which might introduce further breaking changes.

## Verification Plan

### Manual Verification
- Run a Gradle sync in Android Studio to verify that the error is resolved.
- Build the project to ensure no other regressions were introduced by the Gradle downgrade.
