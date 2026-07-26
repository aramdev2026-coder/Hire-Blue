package com.aram.ftc.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

@Composable
fun ShimmerEffect(
    modifier: Modifier = Modifier,
    radius: Dp = 12.dp
) {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val shimmerX by transition.animateFloat(
        initialValue = -600f,
        targetValue = 600f,
        animationSpec = infiniteRepeatable(tween(1400, easing = LinearEasing)),
        label = "shimmerX"
    )
    val shimmerBrush = Brush.linearGradient(
        colors = listOf(
            Color(0xFFE2E8F0),
            Color(0xFFF1F5F9),
            Color(0xFFE2E8F0),
        ),
        start = Offset(shimmerX - 300f, 0f),
        end = Offset(shimmerX + 300f, 200f)
    )
    Box(
        modifier
            .clip(RoundedCornerShape(radius))
            .background(shimmerBrush)
    )
}

@Composable
fun SkeletonDebouncedContainer(
    isLoading: Boolean,
    skeletonContent: @Composable () -> Unit,
    realContent: @Composable () -> Unit
) {
    var showSkeleton by remember { mutableStateOf(false) }

    LaunchedEffect(isLoading) {
        if (isLoading) {
            delay(100L) // 100ms debounce delay to prevent flash on fast network responses
            if (isLoading) {
                showSkeleton = true
            }
        } else {
            showSkeleton = false
        }
    }

    if (showSkeleton && isLoading) {
        skeletonContent()
    } else if (!isLoading) {
        realContent()
    }
}

@Composable
fun SkeletonCandidateCard() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row {
                ShimmerEffect(modifier = Modifier.size(48.dp), radius = 24.dp)
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    ShimmerEffect(modifier = Modifier.fillMaxWidth(0.6f).height(18.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    ShimmerEffect(modifier = Modifier.fillMaxWidth(0.4f).height(14.dp))
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            ShimmerEffect(modifier = Modifier.fillMaxWidth().height(14.dp))
            Spacer(modifier = Modifier.height(8.dp))
            ShimmerEffect(modifier = Modifier.fillMaxWidth(0.8f).height(14.dp))
        }
    }
}
