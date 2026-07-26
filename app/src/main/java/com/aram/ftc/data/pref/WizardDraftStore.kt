package com.aram.ftc.data.pref

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.wizardDataStore: DataStore<Preferences> by preferencesDataStore(name = "wizard_draft")

data class WizardDraft(
    val step: Int = 1,
    val fullName: String = "",
    val dob: String = "",
    val sex: String = "",
    val maritalStatus: String = "",
    val phone1: String = "",
    val phone2: String = "",
    val presentStreet: String = "",
    val presentCity: String = "",
    val presentState: String = "Tamil Nadu",
    val isPermanentSame: Boolean = false,
    val permanentStreet: String = "",
    val permanentCity: String = "",
    val permanentState: String = "Tamil Nadu",
    val targetRoles: String = "",
    val preferredDistricts: String = "",
    val languagesKnown: String = "",
    val expectedSalary: String = "₹15,000 - ₹25,000"
)

class WizardDraftStore(private val context: Context) {

    val draftFlow: Flow<WizardDraft> = context.wizardDataStore.data.map { prefs ->
        WizardDraft(
            step = prefs[KEY_STEP] ?: 1,
            fullName = prefs[KEY_FULL_NAME] ?: "",
            dob = prefs[KEY_DOB] ?: "",
            sex = prefs[KEY_SEX] ?: "",
            maritalStatus = prefs[KEY_MARITAL] ?: "",
            phone1 = prefs[KEY_PHONE1] ?: "",
            phone2 = prefs[KEY_PHONE2] ?: "",
            presentStreet = prefs[KEY_PRESENT_STREET] ?: "",
            presentCity = prefs[KEY_PRESENT_CITY] ?: "",
            presentState = prefs[KEY_PRESENT_STATE] ?: "Tamil Nadu",
            isPermanentSame = prefs[KEY_PERM_SAME] ?: false,
            permanentStreet = prefs[KEY_PERM_STREET] ?: "",
            permanentCity = prefs[KEY_PERM_CITY] ?: "",
            permanentState = prefs[KEY_PERM_STATE] ?: "Tamil Nadu",
            targetRoles = prefs[KEY_TARGET_ROLES] ?: "",
            preferredDistricts = prefs[KEY_PREF_DISTRICTS] ?: "",
            languagesKnown = prefs[KEY_LANGUAGES] ?: "",
            expectedSalary = prefs[KEY_SALARY] ?: "₹15,000 - ₹25,000"
        )
    }

    suspend fun saveDraft(draft: WizardDraft) {
        context.wizardDataStore.edit { prefs ->
            prefs[KEY_STEP] = draft.step
            prefs[KEY_FULL_NAME] = draft.fullName
            prefs[KEY_DOB] = draft.dob
            prefs[KEY_SEX] = draft.sex
            prefs[KEY_MARITAL] = draft.maritalStatus
            prefs[KEY_PHONE1] = draft.phone1
            prefs[KEY_PHONE2] = draft.phone2
            prefs[KEY_PRESENT_STREET] = draft.presentStreet
            prefs[KEY_PRESENT_CITY] = draft.presentCity
            prefs[KEY_PRESENT_STATE] = draft.presentState
            prefs[KEY_PERM_SAME] = draft.isPermanentSame
            prefs[KEY_PERM_STREET] = draft.permanentStreet
            prefs[KEY_PERM_CITY] = draft.permanentCity
            prefs[KEY_PERM_STATE] = draft.permanentState
            prefs[KEY_TARGET_ROLES] = draft.targetRoles
            prefs[KEY_PREF_DISTRICTS] = draft.preferredDistricts
            prefs[KEY_LANGUAGES] = draft.languagesKnown
            prefs[KEY_SALARY] = draft.expectedSalary
        }
    }

    suspend fun clearDraft() {
        context.wizardDataStore.edit { prefs ->
            prefs.clear()
        }
    }

    companion object {
        private val KEY_STEP = intPreferencesKey("step")
        private val KEY_FULL_NAME = stringPreferencesKey("full_name")
        private val KEY_DOB = stringPreferencesKey("dob")
        private val KEY_SEX = stringPreferencesKey("sex")
        private val KEY_MARITAL = stringPreferencesKey("marital_status")
        private val KEY_PHONE1 = stringPreferencesKey("phone1")
        private val KEY_PHONE2 = stringPreferencesKey("phone2")
        private val KEY_PRESENT_STREET = stringPreferencesKey("present_street")
        private val KEY_PRESENT_CITY = stringPreferencesKey("present_city")
        private val KEY_PRESENT_STATE = stringPreferencesKey("present_state")
        private val KEY_PERM_SAME = booleanPreferencesKey("is_perm_same")
        private val KEY_PERM_STREET = stringPreferencesKey("perm_street")
        private val KEY_PERM_CITY = stringPreferencesKey("perm_city")
        private val KEY_PERM_STATE = stringPreferencesKey("perm_state")
        private val KEY_TARGET_ROLES = stringPreferencesKey("target_roles")
        private val KEY_PREF_DISTRICTS = stringPreferencesKey("pref_districts")
        private val KEY_LANGUAGES = stringPreferencesKey("languages")
        private val KEY_SALARY = stringPreferencesKey("salary")
    }
}
