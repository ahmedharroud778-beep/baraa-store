package com.shein.tracker

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Splash screen activity that shows on app launch
 * Handles initial setup and transitions to main activity
 */
class SplashActivity : AppCompatActivity() {

    private val SPLASH_DELAY: Long = 2000 // 2 seconds

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        // Check if version is deprecated and proceed
        checkVersionAndProceed()
    }

    private fun checkVersionAndProceed() {
        val updateChecker = UpdateChecker(this)

        lifecycleScope.launch {
            val startTime = System.currentTimeMillis()
            
            // Check if version is deprecated
            val isDeprecated = updateChecker.isVersionDeprecated()
            
            if (isDeprecated) {
                val updateInfo = updateChecker.checkForUpdate()
                if (updateInfo != null) {
                    showUpdateDialog(updateInfo)
                    return@launch
                }
            }

            // Ensure splash shows for at least SPLASH_DELAY
            val elapsedTime = System.currentTimeMillis() - startTime
            if (elapsedTime < SPLASH_DELAY) {
                delay(SPLASH_DELAY - elapsedTime)
            }

            // Navigate to main activity
            val intent = Intent(this@SplashActivity, MainActivity::class.java)
            startActivity(intent)
            finish()
        }
    }

    private fun showUpdateDialog(updateInfo: LatestVersionInfo) {
        val intent = Intent(this, UpdateActivity::class.java).apply {
            putExtra("versionName", updateInfo.versionName)
            putExtra("downloadUrl", updateInfo.downloadUrl)
            putExtra("sha256", updateInfo.sha256)
            putExtra("releaseNotes", updateInfo.releaseNotes)
            putExtra("forceUpdate", true) // Force update if deprecated
        }
        startActivity(intent)
        finish()
    }

    override fun onPause() {
        super.onPause()
        // Prevent going back to splash screen
        overridePendingTransition(0, 0)
    }
}
