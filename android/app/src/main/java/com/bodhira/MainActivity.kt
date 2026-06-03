package com.bodhira

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "bodhira"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // RN 0.73+ new architecture (ReactHost / Fabric) forwards config changes
  // automatically via super.onConfigurationChanged — no manual bridge call needed.
  // The old reactInstanceManager?.onConfigurationChanged pattern was Bridge-only
  // and causes a crash on the new arch when an orientation change triggers it.
}
