package com.bodhira

import android.content.pm.ActivityInfo
import android.os.Build
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class OrientationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "OrientationModule"

    // ── Orientation — must run on UI thread ───────────────────────────────────

    @ReactMethod
    fun lockToLandscape() {
        runOnUI {
            it.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
        }
    }

    @ReactMethod
    fun lockToPortrait() {
        runOnUI {
            it.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }
    }

    @ReactMethod
    fun unlockAllOrientations() {
        runOnUI {
            it.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_FULL_USER
        }
    }

    // ── Immersive mode — hides status bar + navigation bar ───────────────────

    @ReactMethod
    fun enterImmersiveMode() {
        runOnUI { activity ->
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    activity.window.insetsController?.let { ctrl ->
                        ctrl.hide(
                            WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars()
                        )
                        ctrl.systemBarsBehavior =
                            WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                    }
                } else {
                    @Suppress("DEPRECATION")
                    activity.window.decorView.systemUiVisibility = (
                        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        or View.SYSTEM_UI_FLAG_FULLSCREEN
                        or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    )
                }
            } catch (_: Exception) { /* swallow — never crash the JS thread */ }
        }
    }

    @ReactMethod
    fun exitImmersiveMode() {
        runOnUI { activity ->
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    activity.window.insetsController?.show(
                        WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars()
                    )
                } else {
                    @Suppress("DEPRECATION")
                    activity.window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
                }
            } catch (_: Exception) { /* swallow */ }
        }
    }

    // ── Helper: run block on UI thread, skip if activity is gone ─────────────
    private fun runOnUI(block: (android.app.Activity) -> Unit) {
        val activity = reactContext.currentActivity ?: return
        activity.runOnUiThread { block(activity) }
    }
}
