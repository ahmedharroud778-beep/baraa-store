package com.shein.tracker

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.security.KeyStore

/**
 * Helper class for secure storage using Android Keystore
 * Stores tokens and sensitive data securely
 */
class KeystoreHelper(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    companion object {
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_SESSION_DATA = "session_data"
        private const val KEY_LAST_UPDATE_CHECK = "last_update_check"
    }

    /**
     * Save authentication token securely
     */
    fun saveAuthToken(token: String) {
        sharedPreferences.edit().putString(KEY_AUTH_TOKEN, token).apply()
    }

    /**
     * Retrieve authentication token
     */
    fun getAuthToken(): String? {
        return sharedPreferences.getString(KEY_AUTH_TOKEN, null)
    }

    /**
     * Clear authentication token
     */
    fun clearAuthToken() {
        sharedPreferences.edit().remove(KEY_AUTH_TOKEN).apply()
    }

    /**
     * Save user ID
     */
    fun saveUserId(userId: String) {
        sharedPreferences.edit().putString(KEY_USER_ID, userId).apply()
    }

    /**
     * Retrieve user ID
     */
    fun getUserId(): String? {
        return sharedPreferences.getString(KEY_USER_ID, null)
    }

    /**
     * Save session data as JSON
     */
    fun saveSessionData(data: String) {
        sharedPreferences.edit().putString(KEY_SESSION_DATA, data).apply()
    }

    /**
     * Retrieve session data
     */
    fun getSessionData(): String? {
        return sharedPreferences.getString(KEY_SESSION_DATA, null)
    }

    /**
     * Save last update check timestamp
     */
    fun saveLastUpdateCheck(timestamp: Long) {
        sharedPreferences.edit().putLong(KEY_LAST_UPDATE_CHECK, timestamp).apply()
    }

    /**
     * Get last update check timestamp
     */
    fun getLastUpdateCheck(): Long {
        return sharedPreferences.getLong(KEY_LAST_UPDATE_CHECK, 0)
    }

    /**
     * Clear all stored data
     */
    fun clearAll() {
        sharedPreferences.edit().clear().apply()
    }
}
