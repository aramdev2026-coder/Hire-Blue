package com.aram.ftc.ui.components

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun ThemeSwitch(
    isDark: Boolean,
    onToggle: () -> Unit
) {
    val handleOffset by animateDpAsState(
        targetValue = if (isDark) 30.dp else 0.dp,
        animationSpec = spring(stiffness = 300f, dampingRatio = 0.7f),
        label = "offset"
    )

    Box(
        modifier = Modifier
            .width(64.dp)
            .height(34.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f))
            .clickable { onToggle() }
            .padding(4.dp)
    ) {
        // Icons for background hint
        Row(
            modifier = Modifier.fillMaxSize().padding(horizontal = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.LightMode,
                contentDescription = null,
                modifier = Modifier.size(16.dp),
                tint = if (isDark) MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.3f) else Color.Transparent
            )
            Icon(
                imageVector = Icons.Default.DarkMode,
                contentDescription = null,
                modifier = Modifier.size(16.dp),
                tint = if (isDark) Color.Transparent else MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.3f)
            )
        }

        // Sliding handle
        Box(
            modifier = Modifier
                .offset(x = handleOffset)
                .size(26.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primary),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (isDark) Icons.Default.DarkMode else Icons.Default.LightMode,
                contentDescription = null,
                modifier = Modifier.size(16.dp),
                tint = MaterialTheme.colorScheme.onPrimary
            )
        }
    }
}
