package com.aram.ftc.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BusinessCenter
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.PersonSearch
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.aram.ftc.ui.theme.AramAnim
import com.aram.ftc.ui.theme.AramColors
import com.aram.ftc.ui.theme.AramRadius
import com.aram.ftc.ui.theme.ThemeViewModel

@Composable
fun RoleSelectionScreen(navController: NavController, themeViewModel: ThemeViewModel) {
    var selectedRole by remember { mutableStateOf<String?>(null) } // "candidate" or "employer"
    var selectedLanguage by remember { mutableStateOf("English") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(AramColors.SlateDeep)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 40.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(20.dp))

            // Branding Emblem
            Surface(
                modifier = Modifier.size(64.dp),
                shape = RoundedCornerShape(18.dp),
                color = AramColors.IndigoPrimary
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = "A",
                        style = MaterialTheme.typography.headlineLarge,
                        color = Color.White,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Branding Section
            Text(
                text = "ARAM",
                style = MaterialTheme.typography.displayLarge,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                letterSpacing = 2.sp
            )
            
            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Welcome to ARAM",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Who are you? Select your role to get started.",
                style = MaterialTheme.typography.bodyMedium,
                color = AramColors.TextOnDarkMuted,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(40.dp))

            // Candidate Role Card
            RoleCard(
                title = "I'm Looking for Work",
                subtitle = "Enroll as a Candidate & get matched with top employers",
                icon = Icons.Default.PersonSearch,
                isSelected = selectedRole == "candidate",
                onClick = { selectedRole = "candidate" }
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Employer Role Card
            RoleCard(
                title = "I'm Hiring Workforce",
                subtitle = "Register as an Employer & post job requisitions",
                icon = Icons.Default.BusinessCenter,
                isSelected = selectedRole == "employer",
                onClick = { selectedRole = "employer" }
            )

            Spacer(modifier = Modifier.height(40.dp))

            // Animated Continue CTA Button
            AnimatedVisibility(
                visible = selectedRole != null,
                enter = fadeIn() + slideInVertically(initialOffsetY = { 40 }),
                exit = fadeOut() + slideOutVertically(targetOffsetY = { 40 })
            ) {
                Button(
                    onClick = {
                        if (selectedRole == "candidate") {
                            navController.navigate("candidate_login")
                        } else {
                            navController.navigate("employer_auth")
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(AramRadius.Full),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AramColors.IndigoPrimary,
                        contentColor = Color.White
                    )
                ) {
                    Text(
                        text = "Continue",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun RoleCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val borderColor by animateColorAsState(
        targetValue = if (isSelected) AramColors.IndigoPrimary else AramColors.BorderDefault.copy(alpha = 0.3f),
        animationSpec = spring(dampingRatio = 0.6f, stiffness = 350f),
        label = "borderColor"
    )
    val cardBg by animateColorAsState(
        targetValue = if (isSelected) AramColors.IndigoDeep else AramColors.SlateMedium,
        label = "cardBg"
    )

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(AramRadius.XL))
            .border(
                border = BorderStroke(if (isSelected) 2.5.dp else 1.dp, borderColor),
                shape = RoundedCornerShape(AramRadius.XL)
            )
            .clickable { onClick() },
        color = cardBg,
        shape = RoundedCornerShape(AramRadius.XL)
    ) {
        Box(modifier = Modifier.padding(20.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Surface(
                    color = if (isSelected) AramColors.IndigoPrimary.copy(alpha = 0.2f) else Color.White.copy(alpha = 0.08f),
                    shape = RoundedCornerShape(AramRadius.MD),
                    modifier = Modifier.size(52.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = icon,
                            contentDescription = null,
                            tint = if (isSelected) AramColors.IndigoPrimary else Color.White,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodyMedium,
                        color = AramColors.TextOnDarkMuted
                    )
                }

                if (isSelected) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Surface(
                        color = AramColors.EmeraldPrimary,
                        shape = CircleShape,
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            tint = AramColors.SlateDeep,
                            modifier = Modifier
                                .padding(4.dp)
                                .size(16.dp)
                        )
                    }
                }
            }
        }
    }
}
