package com.shein.tracker

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.security.MessageDigest

/**
 * Activity for handling app updates
 * Shows update dialog and manages download/installation
 */
class UpdateActivity : AppCompatActivity() {

    private lateinit var updateMessage: TextView
    private lateinit var updateProgress: ProgressBar
    private lateinit var buttonContainer: View
    private lateinit var updateLaterButton: Button
    private lateinit var updateNowButton: Button

    private var versionName: String = ""
    private var downloadUrl: String = ""
    private var expectedSha256: String = ""
    private var releaseNotes: String? = null
    private var forceUpdate: Boolean = false

    private var downloadId: Long = -1

    private val downloadReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val id = intent?.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1) ?: -1
            if (id == downloadId) {
                handleDownloadComplete(id)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_update)

        // Get update info from intent
        versionName = intent.getStringExtra("versionName") ?: ""
        downloadUrl = intent.getStringExtra("downloadUrl") ?: ""
        expectedSha256 = intent.getStringExtra("sha256") ?: ""
        releaseNotes = intent.getStringExtra("releaseNotes")
        forceUpdate = intent.getBooleanExtra("forceUpdate", false)

        // Initialize views
        updateMessage = findViewById(R.id.updateMessage)
        updateProgress = findViewById(R.id.updateProgress)
        buttonContainer = findViewById(R.id.buttonContainer)
        updateLaterButton = findViewById(R.id.updateLaterButton)
        updateNowButton = findViewById(R.id.updateNowButton)

        // Setup update message
        updateMessage.text = getString(R.string.update_message, versionName)

        // Hide "Later" button if force update
        if (forceUpdate) {
            updateLaterButton.visibility = View.GONE
        }

        // Setup button listeners
        updateLaterButton.setOnClickListener {
            finish()
        }

        updateNowButton.setOnClickListener {
            startUpdateDownload()
        }

        // Register download receiver
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(
                downloadReceiver,
                IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                Context.RECEIVER_EXPORTED
            )
        } else {
            registerReceiver(
                downloadReceiver,
                IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
            )
        }
    }

    private fun startUpdateDownload() {
        // Show progress, hide buttons
        updateProgress.visibility = View.VISIBLE
        buttonContainer.visibility = View.GONE
        updateNowButton.isEnabled = false

        lifecycleScope.launch {
            try {
                downloadAndInstallUpdate()
            } catch (e: Exception) {
                showError()
            }
        }
    }

    private suspend fun downloadAndInstallUpdate() = withContext(Dispatchers.IO) {
        val downloadManager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

        val request = DownloadManager.Request(Uri.parse(downloadUrl)).apply {
            setTitle("Shein Tracker Update")
            setDescription("Downloading version $versionName")
            setDestinationInExternalFilesDir(
                this@UpdateActivity,
                Environment.DIRECTORY_DOWNLOADS,
                "shein-tracker-update.apk"
            )
            setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI or DownloadManager.Request.NETWORK_MOBILE)
        }

        downloadId = downloadManager.enqueue(request)
    }

    private fun handleDownloadComplete(id: Long) {
        val downloadManager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val query = DownloadManager.Query().setFilterById(id)

        val cursor = downloadManager.query(query)
        if (cursor.moveToFirst()) {
            val statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
            val status = cursor.getInt(statusIndex)

            if (status == DownloadManager.STATUS_SUCCESSFUL) {
                val uri = downloadManager.getUriForDownloadedFile(id)

                if (uri != null) {
                    // Verify SHA-256 checksum
                    if (verifyChecksum(uri)) {
                        // Install the APK
                        installApk(uri)
                    } else {
                        showError("Checksum verification failed")
                    }
                } else {
                    showError("Download failed: URI is null")
                }
            } else {
                showError("Download failed")
            }
        }
        cursor.close()
    }

    private fun verifyChecksum(uri: Uri): Boolean {
        return try {
            val digest = MessageDigest.getInstance("SHA-256")
            contentResolver.openInputStream(uri)?.use { input ->
                val buffer = ByteArray(8192)
                var bytesRead: Int
                while (input.read(buffer).also { bytesRead = it } != -1) {
                    digest.update(buffer, 0, bytesRead)
                }
            } ?: return false

            val checksum = digest.digest().joinToString("") { "%02x".format(it) }
            checksum.equals(expectedSha256, ignoreCase = true)
        } catch (e: Exception) {
            false
        }
    }

    private fun installApk(uri: Uri) {
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                            Intent.FLAG_GRANT_READ_URI_PERMISSION or
                            Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                }
            }
            startActivity(intent)
            finish()
        } catch (e: Exception) {
            showError("Failed to install update")
        }
    }

    private fun showError(message: String = getString(R.string.update_failed)) {
        runOnUiThread {
            updateProgress.visibility = View.GONE
            buttonContainer.visibility = View.VISIBLE
            updateNowButton.isEnabled = true
            updateNowButton.text = getString(R.string.retry)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            unregisterReceiver(downloadReceiver)
        } catch (e: Exception) {
            // Receiver might not be registered
        }
    }
}
