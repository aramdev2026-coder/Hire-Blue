package com.aram.ftc

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aram.ftc.data.api.RetrofitClient
import com.aram.ftc.ui.components.AramToastBanner
import com.aram.ftc.ui.theme.AppTheme
import com.aram.ftc.data.pref.SessionManager
import com.aram.ftc.ui.theme.ThemeViewModel
import com.aram.ftc.ui.screens.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        RetrofitClient.init(this)

        val sessionManager = SessionManager(this)
        val candidateToken = sessionManager.getCandidateToken()
        val candidateId = sessionManager.getCandidateId()
        val candidateStatus = sessionManager.getCandidateStatus()
        val employerToken = sessionManager.getEmployerToken()

        val initialDestination = when {
            candidateToken != null && candidateId != -1 -> {
                if (candidateStatus == "NEW") "candidate_wizard" else "candidate_dashboard"
            }
            employerToken != null -> "employer_dashboard"
            else -> "role_selection"
        }

        setContent {
            val themeViewModel: ThemeViewModel = viewModel()
            val isDarkModeState by themeViewModel.isDarkMode
            val systemDark = isSystemInDarkTheme()
            val useDarkTheme = isDarkModeState ?: systemDark

            var globalToastMessage by remember { mutableStateOf<String?>(null) }
            var globalToastIsError by remember { mutableStateOf(false) }

            val showToast: (String, Boolean) -> Unit = { message, isError ->
                globalToastMessage = message
                globalToastIsError = isError
            }

            AppTheme(darkTheme = useDarkTheme) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        val navController = rememberNavController()
                        NavHost(navController = navController, startDestination = initialDestination) {
                            composable("role_selection") {
                                RoleSelectionScreen(navController, themeViewModel, showToast)
                            }
                            composable("candidate_login") {
                                CandidateLoginScreen(navController, themeViewModel, showToast)
                            }
                            composable("candidate_wizard") {
                                CandidateWizardScreen(navController, themeViewModel, showToast)
                            }
                            composable("candidate_dashboard") {
                                CandidateDashboardScreen(navController, themeViewModel, showToast)
                            }
                            composable("employer_auth") {
                                EmployerAuthScreen(navController, themeViewModel, showToast)
                            }
                            composable("employer_dashboard") {
                                EmployerDashboardScreen(navController, themeViewModel, showToast)
                            }
                        }

                        AnimatedVisibility(
                            visible = globalToastMessage != null,
                            enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
                            exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut(),
                            modifier = Modifier
                                .align(Alignment.TopCenter)
                                .padding(top = 8.dp)
                                .zIndex(999f)
                        ) {
                            AramToastBanner(
                                message = globalToastMessage ?: "",
                                isError = globalToastIsError,
                                onDismiss = { globalToastMessage = null }
                            )
                        }
                    }
                }
            }
        }
    }
}
