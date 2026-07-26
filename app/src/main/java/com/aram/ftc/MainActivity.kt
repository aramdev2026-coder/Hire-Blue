package com.aram.ftc

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.aram.ftc.data.api.RetrofitClient
import com.aram.ftc.data.network.StickyOfflineBanner
import com.aram.ftc.data.pref.EncryptedSessionManager
import com.aram.ftc.ui.components.TypedSnackbarHost
import com.aram.ftc.ui.components.rememberAramSnackbarState
import com.aram.ftc.ui.screens.*
import com.aram.ftc.ui.theme.AppTheme
import com.aram.ftc.ui.theme.ThemeViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        RetrofitClient.init(this)

        val encryptedSessionManager = EncryptedSessionManager(this)
        val candidateToken = encryptedSessionManager.getToken()
        val candidateId = encryptedSessionManager.getCandidateId()
        val employerToken = encryptedSessionManager.getToken()

        val initialDestination = when {
            candidateToken != null && !candidateId.isNullOrBlank() -> "candidate_dashboard"
            employerToken != null -> "employer_dashboard"
            else -> "role_selection"
        }

        setContent {
            val themeViewModel: ThemeViewModel = viewModel()
            val isDarkModeState by themeViewModel.isDarkMode
            val systemDark = isSystemInDarkTheme()
            val useDarkTheme = isDarkModeState ?: systemDark

            val view = LocalView.current
            LaunchedEffect(useDarkTheme) {
                val window = (view.context as ComponentActivity).window
                val controller = WindowCompat.getInsetsController(window, view)
                controller.isAppearanceLightStatusBars = !useDarkTheme
            }

            val snackbarState = rememberAramSnackbarState()
            val navController = rememberNavController()

            val navBackStackEntry by navController.currentBackStackEntryAsState()
            val currentRoute = navBackStackEntry?.destination?.route

            // FLAG_SECURE commented out as requested so screenshots can be taken
            LaunchedEffect(currentRoute) {
                // window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)
                window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
            }

            val showToast: (String, Boolean) -> Unit = { message, isError ->
                snackbarState.show(
                    message = message,
                    variant = if (isError) com.aram.ftc.ui.components.SnackbarVariant.ERROR else com.aram.ftc.ui.components.SnackbarVariant.SUCCESS
                )
            }

            AppTheme(darkTheme = useDarkTheme) {
                Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .statusBarsPadding()
                        .navigationBarsPadding(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        Column(modifier = Modifier.fillMaxSize()) {
                            StickyOfflineBanner()

                            NavHost(
                                navController = navController,
                                startDestination = initialDestination,
                                modifier = Modifier.weight(1f),
                                enterTransition = { slideInHorizontally(initialOffsetX = { it }, animationSpec = tween(300)) + fadeIn(animationSpec = tween(300)) },
                                exitTransition = { slideOutHorizontally(targetOffsetX = { -it }, animationSpec = tween(300)) + fadeOut(animationSpec = tween(300)) },
                                popEnterTransition = { slideInHorizontally(initialOffsetX = { -it }, animationSpec = tween(300)) + fadeIn(animationSpec = tween(300)) },
                                popExitTransition = { slideOutHorizontally(targetOffsetX = { it }, animationSpec = tween(300)) + fadeOut(animationSpec = tween(300)) }
                            ) {
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
                        }

                        TypedSnackbarHost(
                            state = snackbarState,
                            modifier = Modifier
                                .align(Alignment.TopCenter)
                                .padding(top = 8.dp)
                                .zIndex(999f)
                        )
                    }
                }
            }
        }
    }
}
