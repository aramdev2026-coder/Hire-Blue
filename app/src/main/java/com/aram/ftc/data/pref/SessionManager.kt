package com.aram.ftc.data.pref

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SessionManager(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    // Secure encrypted shared preferences to prevent credentials theft
    private val prefs: SharedPreferences = try {
        EncryptedSharedPreferences.create(
            context,
            "aram_secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    } catch (e: Exception) {
        context.getSharedPreferences("aram_fallback_prefs", Context.MODE_PRIVATE)
    }

    companion object {
        private const val KEY_CANDIDATE_TOKEN = "candidate_token"
        private const val KEY_CANDIDATE_ID = "candidate_id"
        private const val KEY_CANDIDATE_EMAIL = "candidate_email"
        private const val KEY_CANDIDATE_STATUS = "candidate_status"

        private const val KEY_EMPLOYER_TOKEN = "employer_token"
        private const val KEY_EMPLOYER_ID = "employer_id"
        private const val KEY_EMPLOYER_NAME = "employer_name"
        private const val KEY_EMPLOYER_EMAIL = "employer_email"
        private const val KEY_EMPLOYER_PHONE = "employer_phone"
    }

    // ==========================================
    // CANDIDATE SESSION MANAGEMENT
    // ==========================================

    fun saveCandidateSession(token: String, id: Int, email: String, status: String) {
        prefs.edit().apply {
            putString(KEY_CANDIDATE_TOKEN, token)
            putInt(KEY_CANDIDATE_ID, id)
            putString(KEY_CANDIDATE_EMAIL, email)
            putString(KEY_CANDIDATE_STATUS, status)
            apply()
        }
    }

    fun getCandidateToken(): String? = prefs.getString(KEY_CANDIDATE_TOKEN, null)
    fun getCandidateId(): Int = prefs.getInt(KEY_CANDIDATE_ID, -1)
    fun getCandidateEmail(): String? = prefs.getString(KEY_CANDIDATE_EMAIL, null)
    fun getCandidateStatus(): String? = prefs.getString(KEY_CANDIDATE_STATUS, null)

    fun clearCandidateSession() {
        prefs.edit().apply {
            remove(KEY_CANDIDATE_TOKEN)
            remove(KEY_CANDIDATE_ID)
            remove(KEY_CANDIDATE_EMAIL)
            remove(KEY_CANDIDATE_STATUS)
            apply()
        }
    }

    // ==========================================
    // EMPLOYER SESSION MANAGEMENT
    // ==========================================

    fun saveEmployerSession(token: String, id: String, name: String, email: String? = null, phone: String? = null) {
        prefs.edit().apply {
            putString(KEY_EMPLOYER_TOKEN, token)
            putString(KEY_EMPLOYER_ID, id)
            putString(KEY_EMPLOYER_NAME, name)
            if (email != null) putString(KEY_EMPLOYER_EMAIL, email)
            if (phone != null) putString(KEY_EMPLOYER_PHONE, phone)
            apply()
        }
    }

    fun getEmployerToken(): String? = prefs.getString(KEY_EMPLOYER_TOKEN, null)
    fun getEmployerId(): String? = prefs.getString(KEY_EMPLOYER_ID, null)
    fun getEmployerName(): String? = prefs.getString(KEY_EMPLOYER_NAME, null)
    fun getEmployerEmail(): String? = prefs.getString(KEY_EMPLOYER_EMAIL, null)
    fun getEmployerPhone(): String? = prefs.getString(KEY_EMPLOYER_PHONE, null)

    fun clearEmployerSession() {
        prefs.edit().apply {
            remove(KEY_EMPLOYER_TOKEN)
            remove(KEY_EMPLOYER_ID)
            remove(KEY_EMPLOYER_NAME)
            remove(KEY_EMPLOYER_EMAIL)
            remove(KEY_EMPLOYER_PHONE)
            apply()
        }
    }

    // ==========================================
    // OFFLINE WIZARD DRAFT STORE
    // ==========================================

    fun saveWizardDraft(draftJson: String) {
        val id = getCandidateId()
        if (id != -1) {
            prefs.edit().putString("wiz_draft_$id", draftJson).apply()
        }
    }

    fun getWizardDraft(): String? {
        val id = getCandidateId()
        return if (id != -1) prefs.getString("wiz_draft_$id", null) else null
    }

    fun clearWizardDraft() {
        val id = getCandidateId()
        if (id != -1) {
            prefs.edit().remove("wiz_draft_$id").apply()
        }
    }
}
