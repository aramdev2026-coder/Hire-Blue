package com.aram.ftc

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aram.ftc.data.api.RetrofitClient
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

            AppTheme(darkTheme = useDarkTheme) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    NavHost(navController = navController, startDestination = initialDestination) {
                        composable("role_selection") {
                            RoleSelectionScreen(navController, themeViewModel)
                        }
                        composable("candidate_login") {
                            CandidateLoginScreen(navController, themeViewModel)
                        }
                        composable("candidate_wizard") {
                            CandidateWizardScreen(navController, themeViewModel)
                        }
                        composable("candidate_dashboard") {
                            CandidateDashboardScreen(navController, themeViewModel)
                        }
                        composable("employer_auth") {
                            EmployerAuthScreen(navController, themeViewModel)
                        }
                        composable("employer_dashboard") {
                            EmployerDashboardScreen(navController, themeViewModel)
                        }
                    }
                }
            }
        }
    }
}
