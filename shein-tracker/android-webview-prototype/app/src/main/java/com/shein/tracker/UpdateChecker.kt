package com.shein.tracker

import android.content.Context
import android.util.Log
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Data class representing the latest version info from server
 */
data class LatestVersionInfo(
    val versionName: String,
    val versionCode: Int,
    val downloadUrl: String,
    val sha256: String,
    val releaseNotes: String? = null,
    val forceUpdate: Boolean = false,
    val minSupportedVersion: Int? = null
)

/**
 * Handles checking for app updates against /downloads/latest.json
 */
class UpdateChecker(private val context: Context) {

    companion object {
        private const val TAG = "UpdateChecker"
        private const val UPDATE_CHECK_URL = "https://your-domain.com/downloads/latest.json"
        private const val UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    }

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val keystoreHelper = KeystoreHelper(context)

    /**
     * Check if an update is available
     * Returns null if no update or on error
     */
    suspend fun checkForUpdate(): LatestVersionInfo? = withContext(Dispatchers.IO) {
        try {
            // Check if we've recently checked for updates
            val lastCheck = keystoreHelper.getLastUpdateCheck()
            val now = System.currentTimeMillis()

            if (now - lastCheck < UPDATE_CHECK_INTERVAL) {
                Log.d(TAG, "Update check skipped - checked recently")
                return@withContext null
            }

            // Perform the update check
            val request = Request.Builder()
                .url(UPDATE_CHECK_URL)
                .build()

            val response = client.newCall(request).execute()

            if (!response.isSuccessful) {
                Log.e(TAG, "Update check failed: ${response.code}")
                return@withContext null
            }

            val body = response.body?.string()
            if (body.isNullOrEmpty()) {
                Log.e(TAG, "Empty response body")
                return@withContext null
            }

            val versionInfo = gson.fromJson(body, LatestVersionInfo::class.java)

            // Save the check timestamp
            keystoreHelper.saveLastUpdateCheck(now)

            // Check if update is needed
            val currentVersionCode = getCurrentVersionCode()
            if (versionInfo.versionCode > currentVersionCode) {
                Log.d(TAG, "Update available: ${versionInfo.versionName} (current: $currentVersionCode)")
                return@withContext versionInfo
            } else {
                Log.d(TAG, "No update available (current: $currentVersionCode, latest: ${versionInfo.versionCode})")
                return@withContext null
            }
        } catch (e: IOException) {
            Log.e(TAG, "Network error during update check", e)
            return@withContext null
        } catch (e: Exception) {
            Log.e(TAG, "Error during update check", e)
            return@withContext null
        }
    }

    /**
     * Get current app version code
     */
    private fun getCurrentVersionCode(): Int {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                packageInfo.longVersionCode.toInt()
            } else {
                @Suppress("DEPRECATION")
                packageInfo.versionCode
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting version code", e)
            1
        }
    }

    /**
     * Get current app version name
     */
    fun getCurrentVersionName(): String {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            packageInfo.versionName ?: "Unknown"
        } catch (e: Exception) {
            Log.e(TAG, "Error getting version name", e)
            "Unknown"
        }
    }

    /**
     * Check if current version is below minimum supported version
     */
    suspend fun isVersionDeprecated(): Boolean = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(UPDATE_CHECK_URL)
                .build()

            val response = client.newCall(request).execute()

            if (!response.isSuccessful) {
                return@withContext false
            }

            val body = response.body?.string()
            if (body.isNullOrEmpty()) {
                return@withContext false
            }

            val versionInfo = gson.fromJson(body, LatestVersionInfo::class.java)
            val minSupported = versionInfo.minSupportedVersion ?: return@withContext false

            getCurrentVersionCode() < minSupported
        } catch (e: Exception) {
            Log.e(TAG, "Error checking version deprecation", e)
            false
        }
    }
}
