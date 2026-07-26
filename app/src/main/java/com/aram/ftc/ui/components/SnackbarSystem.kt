package com.aram.ftc.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class SnackbarVariant {
    SUCCESS, ERROR, WARNING, INFO
}

data class SnackbarData(
    val message: String,
    val variant: SnackbarVariant,
    val actionLabel: String? = null,
    val onAction: (() -> Unit)? = null
)

class AramSnackbarState {
    var currentData by mutableStateOf<SnackbarData?>(null)
        private set

    fun show(
        message: String,
        variant: SnackbarVariant = SnackbarVariant.INFO,
        actionLabel: String? = null,
        onAction: (() -> Unit)? = null
    ) {
        currentData = SnackbarData(message, variant, actionLabel, onAction)
    }

    fun dismiss() {
        currentData = null
    }
}

@Composable
fun rememberAramSnackbarState(): AramSnackbarState {
    return remember { AramSnackbarState() }
}

@Composable
fun TypedSnackbarHost(
    state: AramSnackbarState,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current
    val data = state.currentData

    LaunchedEffect(data) {
        if (data != null) {
            when (data.variant) {
                SnackbarVariant.SUCCESS -> haptic.performHapticFeedback(HapticFeedbackType.Confirm)
                SnackbarVariant.ERROR -> haptic.performHapticFeedback(HapticFeedbackType.Reject)
                else -> {}
            }

            val timeout = when (data.variant) {
                SnackbarVariant.SUCCESS -> 2500L
                SnackbarVariant.ERROR -> 5000L
                SnackbarVariant.WARNING -> 4000L
                SnackbarVariant.INFO -> 3000L
            }

            delay(timeout)
            if (state.currentData == data) {
                state.dismiss()
            }
        }
    }

    AnimatedVisibility(
        visible = data != null,
        enter = slideInVertically { -it } + fadeIn(),
        exit = slideOutVertically { -it } + fadeOut(),
        modifier = modifier
    ) {
        data?.let { snackbarData ->
            val (bgColor, icon, iconTint) = when (snackbarData.variant) {
                SnackbarVariant.SUCCESS -> Triple(Color(0xFF10B981), Icons.Default.CheckCircle, Color.White)
                SnackbarVariant.ERROR -> Triple(Color(0xFFEF4444), Icons.Default.Error, Color.White)
                SnackbarVariant.WARNING -> Triple(Color(0xFFF59E0B), Icons.Default.Warning, Color.White)
                SnackbarVariant.INFO -> Triple(Color(0xFF6366F1), Icons.Default.Info, Color.White)
            }

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = bgColor),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconTint,
                        modifier = Modifier.size(24.dp)
                    )

                    Spacer(modifier = Modifier.width(12.dp))

                    Text(
                        text = snackbarData.message,
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.weight(1f)
                    )

                    if (!snackbarData.actionLabel.isNullOrBlank()) {
                        Spacer(modifier = Modifier.width(8.dp))
                        TextButton(
                            onClick = {
                                snackbarData.onAction?.invoke()
                                state.dismiss()
                            },
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = snackbarData.actionLabel.uppercase(),
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
