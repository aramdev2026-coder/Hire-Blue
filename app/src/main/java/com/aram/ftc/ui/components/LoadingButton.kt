package com.aram.ftc.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.aram.ftc.ui.theme.AramColors
import com.aram.ftc.ui.theme.AramRadius

@Composable
fun LoadingButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    isSuccess: Boolean = false,
    enabled: Boolean = true,
    height: Dp = 56.dp,
    containerColor: Color = AramColors.IndigoPrimary,
    contentColor: Color = Color.White
) {
    val haptic = LocalHapticFeedback.current

    val popScale by animateFloatAsState(
        targetValue = if (isSuccess) 1.25f else 1.0f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow),
        label = "popScale"
    )

    Button(
        onClick = {
            if (!isLoading && enabled) {
                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                onClick()
            }
        },
        enabled = enabled && !isLoading,
        modifier = modifier
            .fillMaxWidth()
            .height(height),
        shape = RoundedCornerShape(AramRadius.Full),
        colors = ButtonDefaults.buttonColors(
            containerColor = containerColor,
            contentColor = contentColor,
            disabledContainerColor = containerColor.copy(alpha = 0.4f),
            disabledContentColor = contentColor.copy(alpha = 0.6f)
        ),
        contentPadding = PaddingValues(0.dp)
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            AnimatedContent(
                targetState = when {
                    isSuccess -> "success"
                    isLoading -> "loading"
                    else -> "text"
                },
                transitionSpec = {
                    fadeIn(tween(200)) togetherWith fadeOut(tween(200))
                },
                label = "button_content"
            ) { targetState ->
                when (targetState) {
                    "loading" -> {
                        CircularProgressIndicator(
                            color = contentColor,
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.5.dp
                        )
                    }
                    "success" -> {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Success",
                            tint = contentColor,
                            modifier = Modifier
                                .size(28.dp)
                                .scale(popScale)
                        )
                    }
                    else -> {
                        Text(
                            text = text,
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = if (enabled && !isLoading) contentColor else contentColor.copy(alpha = 0.7f)
                        )
                    }
                }
            }
        }
    }
}
