package com.aram.ftc.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.aram.ftc.data.api.NoConnectivityException
import com.aram.ftc.data.api.SessionExpiredException
import com.aram.ftc.data.model.CandidatePayload
import com.aram.ftc.data.pref.SessionManager
import com.aram.ftc.ui.components.*
import com.aram.ftc.ui.theme.AramColors
import com.aram.ftc.ui.theme.AramRadius
import com.aram.ftc.ui.theme.ThemeViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CandidateDashboardScreen(navController: NavController, themeViewModel: ThemeViewModel, showToast: (String, Boolean) -> Unit = { _, _ -> }) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val sessionManager = remember { SessionManager(context) }
    val apiService = remember { com.aram.ftc.data.api.RetrofitClient.service }

    val token = remember { "Bearer ${sessionManager.getCandidateToken() ?: ""}" }
    val candidateId = remember { sessionManager.getCandidateId() }

    var profile by remember { mutableStateOf<CandidatePayload?>(null) }
    var loading by remember { mutableStateOf(true) }
    var errorMsg by remember { mutableStateOf<String?>(null) }
    var isNoInternet by remember { mutableStateOf(false) }
    var showLogoutDialog by remember { mutableStateOf(false) }

    BackHandler {
        showLogoutDialog = true
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Confirm Logout", fontWeight = FontWeight.Bold) },
            text = { Text("Do you want to log out of your account and return to the main screen?") },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        sessionManager.clearCandidateSession()
                        showToast("Logged out successfully", false)
                        navController.navigate("role_selection") {
                            popUpTo(0) { inclusive = true }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AramColors.RosePrimary)
                ) {
                    Text("Logout", fontWeight = FontWeight.Bold, color = Color.White)
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel")
                }
            },
            containerColor = MaterialTheme.colorScheme.surface,
            titleContentColor = MaterialTheme.colorScheme.onSurface,
            textContentColor = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }

    fun loadProfile() {
        loading = true
        errorMsg = null
        isNoInternet = false
        coroutineScope.launch {
            try {
                val res = apiService.getCandidateProfile(token, candidateId)
                if (res.isSuccessful && res.body()?.success == true) {
                    profile = res.body()?.candidate
                } else if (res.code() == 404) {
                    errorMsg = "Profile not found. Please complete your registration."
                } else {
                    errorMsg = "Failed to fetch profile: ${res.message()}"
                }
            } catch (e: NoConnectivityException) {
                isNoInternet = true
            } catch (e: SessionExpiredException) {
                sessionManager.clearCandidateSession()
                showToast("Session expired. Please log in again.", true)
                navController.navigate("role_selection") {
                    popUpTo(navController.graph.startDestinationId) { inclusive = true }
                }
            } catch (e: Exception) {
                errorMsg = "Error: ${e.message}"
            } finally {
                loading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        loadProfile()
    }

    Scaffold(
        topBar = {
            AramHeader(
                title = "Candidate Dashboard",
                themeViewModel = themeViewModel,
                onBack = null,
                onLogout = { showLogoutDialog = true }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            if (loading) {
                LoadingStateScreen(message = "Syncing Verified Candidate Profile...")
            } else if (isNoInternet) {
                NoInternetStateScreen(onRetry = { loadProfile() })
            } else if (errorMsg != null) {
                ErrorStateScreen(description = errorMsg!!, onRetry = { loadProfile() })
            } else if (profile == null) {
                EmptyStateScreen(
                    title = "Profile Incomplete",
                    description = "Your candidate profile is not registered or set up yet.",
                    actionText = "Start Profile Setup",
                    onAction = { navController.navigate("candidate_wizard") }
                )
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Profile Header Card (Indigo Primary Gradient)
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = AramColors.IndigoPrimary),
                        shape = RoundedCornerShape(AramRadius.XL),
                        elevation = CardDefaults.cardElevation(4.dp)
                    ) {
                        Column(modifier = Modifier.padding(24.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    modifier = Modifier.size(64.dp),
                                    shape = CircleShape,
                                    color = Color.White.copy(alpha = 0.2f)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            text = profile?.fullName?.firstOrNull()?.toString()?.uppercase() ?: "C",
                                            style = MaterialTheme.typography.displayLarge,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.width(16.dp))
                                Column {
                                    Text(
                                        text = profile?.fullName ?: "Candidate Name",
                                        style = MaterialTheme.typography.headlineMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Surface(
                                        color = AramColors.EmeraldLight,
                                        shape = RoundedCornerShape(AramRadius.XS)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Box(modifier = Modifier.size(6.dp).background(AramColors.EmeraldPrimary, CircleShape))
                                            Spacer(Modifier.width(6.dp))
                                            Text("Verified Candidate", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = AramColors.EmeraldText)
                                        }
                                    }
                                }
                            }
                            
                            HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp), color = Color.White.copy(alpha = 0.2f))
                            
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Column {
                                    Text("Primary Contact", style = MaterialTheme.typography.labelSmall, color = Color.White.copy(alpha = 0.75f))
                                    Text("+91 ${profile?.phoneNumber1 ?: "N/A"}", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold, color = Color.White)
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text("Preferred Location", style = MaterialTheme.typography.labelSmall, color = Color.White.copy(alpha = 0.75f))
                                    Text(profile?.presentDistrict ?: "Tamil Nadu", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold, color = Color.White)
                                }
                            }
                        }
                    }

                    // Preferences Section
                    ReviewSection(title = "Work Preferences", icon = Icons.Default.Work) {
                        ReviewRow(label = "Target Salary", value = profile?.expectedSalary)
                        ReviewChips(label = "Job Roles", tags = profile?.jobRoles ?: emptyList())
                        ReviewChips(label = "Districts", tags = profile?.preferredDistricts ?: emptyList())
                    }

                    // Education & Experience
                    if (profile?.education?.isNotEmpty() == true) {
                        ReviewSection(title = "Education", icon = Icons.Default.School) {
                            profile?.education?.forEach { edu ->
                                ReviewRow(label = edu.course, value = edu.institution)
                            }
                        }
                    }

                    if (profile?.experience?.isNotEmpty() == true) {
                        ReviewSection(title = "Work Experience", icon = Icons.Default.History) {
                            profile?.experience?.forEach { exp ->
                                ReviewRow(label = "${exp.role} at ${exp.institution}", value = "${exp.fromYear} - ${exp.toYear}")
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = { navController.navigate("candidate_wizard") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(AramRadius.Full),
                        colors = ButtonDefaults.buttonColors(containerColor = AramColors.IndigoPrimary, contentColor = Color.White)
                    ) {
                        Icon(Icons.Default.Edit, null, tint = Color.White)
                        Spacer(Modifier.width(8.dp))
                        Text("Update Professional Details", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold, color = Color.White)
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }
}
