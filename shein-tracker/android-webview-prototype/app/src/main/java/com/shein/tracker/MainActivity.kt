package com.shein.tracker

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

/**
 * Main activity that hosts the WebView for the web application
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var offlineView: LinearLayout
    private lateinit var retryButton: Button

    private lateinit var keystoreHelper: KeystoreHelper
    private lateinit var networkHelper: NetworkHelper
    private lateinit var updateChecker: UpdateChecker

    private val WEB_URL = "https://baraa-store-1.onrender.com"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize helpers
        keystoreHelper = KeystoreHelper(this)
        networkHelper = NetworkHelper(this)
        updateChecker = UpdateChecker(this)

        // Initialize views
        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        offlineView = findViewById(R.id.offlineView)
        retryButton = findViewById(R.id.retryButton)

        // Setup WebView
        setupWebView()

        // Setup retry button
        retryButton.setOnClickListener {
            loadUrl()
        }

        // Check for updates
        checkForUpdates()

        // Load the URL
        loadUrl()

        // Handle back button for WebView
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        // Enable JavaScript
        webView.settings.javaScriptEnabled = true

        // Enable DOM storage
        webView.settings.domStorageEnabled = true

        // Enable responsive design
        webView.settings.useWideViewPort = true
        webView.settings.loadWithOverviewMode = true

        // Enable zoom
        webView.settings.setSupportZoom(true)
        webView.settings.builtInZoomControls = true
        webView.settings.displayZoomControls = false

        // Enable caching for offline support
        webView.settings.cacheMode = WebViewSettings.LOAD_DEFAULT
        webView.settings.allowFileAccess = true
        webView.settings.allowContentAccess = true
        webView.settings.allowFileAccessFromFileURLs = true
        webView.settings.allowUniversalAccessFromFileURLs = true

        // Set custom user agent
        webView.settings.userAgentString = getUserAgent()

        // Setup WebViewClient for page loading
        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                showLoading()
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                hideLoading()
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: android.webkit.WebResourceError
            ) {
                super.onReceivedError(view, request, error)

                // Check if it's a network error
                if (!networkHelper.isOnline()) {
                    showOfflineView()
                }
            }

            // For older Android versions
            @Suppress("DEPRECATION")
            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                super.onReceivedError(view, errorCode, description, failingUrl)

                // Check if it's a network error
                if (!networkHelper.isOnline()) {
                    showOfflineView()
                }
            }
        }

        // Setup WebChromeClient for progress
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                // Update progress if needed
            }
        }
    }

    private fun loadUrl() {
        if (networkHelper.isOnline()) {
            // Online - load from network with cache
            webView.settings.cacheMode = WebViewSettings.LOAD_DEFAULT
            webView.loadUrl(WEB_URL)
            hideOfflineView()
        } else {
            // Offline - try to load from cache
            webView.settings.cacheMode = WebViewSettings.LOAD_CACHE_ONLY
            webView.loadUrl(WEB_URL)

            // Show offline message after a delay
            webView.postDelayed({
                if (!networkHelper.isOnline()) {
                    showOfflineView()
                }
            }, 3000)
        }
    }

    private fun showLoading() {
        progressBar.visibility = View.VISIBLE
    }

    private fun hideLoading() {
        progressBar.visibility = View.GONE
    }

    private fun showOfflineView() {
        webView.visibility = View.GONE
        offlineView.visibility = View.VISIBLE
        hideLoading()
    }

    private fun hideOfflineView() {
        webView.visibility = View.VISIBLE
        offlineView.visibility = View.GONE
    }

    private fun checkForUpdates() {
        lifecycleScope.launch {
            val updateInfo = updateChecker.checkForUpdate()
            if (updateInfo != null) {
                showUpdateDialog(updateInfo)
            }
        }
    }

    private fun showUpdateDialog(updateInfo: LatestVersionInfo) {
        val intent = Intent(this, UpdateActivity::class.java).apply {
            putExtra("versionName", updateInfo.versionName)
            putExtra("downloadUrl", updateInfo.downloadUrl)
            putExtra("sha256", updateInfo.sha256)
            putExtra("releaseNotes", updateInfo.releaseNotes)
            putExtra("forceUpdate", updateInfo.forceUpdate)
        }
        startActivity(intent)
    }

    private fun getUserAgent(): String {
        val originalUserAgent = webView.settings.userAgentString
        return "$originalUserAgent SheinTrackerApp/${updateChecker.getCurrentVersionName()}"
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()

        // Check network state on resume
        if (networkHelper.isOnline() && offlineView.visibility == View.VISIBLE) {
            loadUrl()
        }
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        webView.destroy()
    }

    companion object {
        private const val TAG = "MainActivity"

        object WebViewSettings {
            const val LOAD_DEFAULT = -1
            const val LOAD_CACHE_ELSE_NETWORK = 1
            const val LOAD_NO_CACHE = 2
            const val LOAD_CACHE_ONLY = 3
        }
    }
}
