package com.aram.ftc.ui.theme

import androidx.compose.animation.core.spring
import androidx.compose.ui.unit.dp

object AramSpacing {
    val XXS  = 4.dp
    val XS   = 8.dp
    val SM   = 12.dp
    val MD   = 16.dp
    val LG   = 20.dp
    val XL   = 24.dp
    val XXL  = 32.dp
    val XXXL = 48.dp
}

object AramRadius {
    val XS   = 6.dp
    val SM   = 10.dp
    val MD   = 14.dp
    val LG   = 18.dp
    val XL   = 24.dp
    val XXL  = 28.dp
    val Full = 100.dp
}

object AramAnim {
    const val MICRO    = 150
    const val FAST     = 220
    const val NORMAL   = 320
    const val SLOW     = 450
    const val VERY_SLOW = 600

    val SnapSpring    = spring<Float>(dampingRatio = 1.0f, stiffness = 400f)
    val SoftSpring    = spring<Float>(dampingRatio = 0.8f, stiffness = 300f)
    val BounceSpring  = spring<Float>(dampingRatio = 0.6f, stiffness = 350f)
}
