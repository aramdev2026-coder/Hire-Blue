package com.aram.ftc.data.pref

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class EncryptedSessionManager(context: Context) {

    private val prefs: SharedPreferences by lazy {
        try {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()

            EncryptedSharedPreferences.create(
                context,
                "aram_encrypted_prefs",
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            context.getSharedPreferences("aram_fallback_prefs", Context.MODE_PRIVATE)
        }
    }

    fun saveToken(token: String) {
        prefs.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }

    fun saveRole(role: String) {
        prefs.edit().putString(KEY_ROLE, role).apply()
    }

    fun getRole(): String? {
        return prefs.getString(KEY_ROLE, null)
    }

    fun saveCandidateId(id: String) {
        prefs.edit().putString(KEY_CANDIDATE_ID, id).apply()
    }

    fun getCandidateId(): String? {
        return prefs.getString(KEY_CANDIDATE_ID, null)
    }

    fun saveCandidateEmail(email: String) {
        prefs.edit().putString(KEY_CANDIDATE_EMAIL, email).apply()
    }

    fun getCandidateEmail(): String? {
        return prefs.getString(KEY_CANDIDATE_EMAIL, null)
    }

    fun saveEmployerId(id: String) {
        prefs.edit().putString(KEY_EMPLOYER_ID, id).apply()
    }

    fun getEmployerId(): String? {
        return prefs.getString(KEY_EMPLOYER_ID, null)
    }

    fun saveEmployerEmail(email: String) {
        prefs.edit().putString(KEY_EMPLOYER_EMAIL, email).apply()
    }

    fun getEmployerEmail(): String? {
        return prefs.getString(KEY_EMPLOYER_EMAIL, null)
    }

    fun saveEmployerSession(token: String, id: String, companyName: String, email: String, phone: String) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_ROLE, "EMPLOYER")
            .putString(KEY_EMPLOYER_ID, id)
            .putString("employer_company", companyName)
            .putString(KEY_EMPLOYER_EMAIL, email)
            .putString("employer_phone", phone)
            .apply()
    }

    fun clearEmployerSession() {
        prefs.edit()
            .remove(KEY_TOKEN)
            .remove(KEY_ROLE)
            .remove(KEY_EMPLOYER_ID)
            .remove("employer_company")
            .remove(KEY_EMPLOYER_EMAIL)
            .remove("employer_phone")
            .apply()
    }

    fun clearAll() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_ROLE = "user_role"
        private const val KEY_CANDIDATE_ID = "candidate_id"
        private const val KEY_CANDIDATE_EMAIL = "candidate_email"
        private const val KEY_EMPLOYER_ID = "employer_id"
        private const val KEY_EMPLOYER_EMAIL = "employer_email"
    }
}
