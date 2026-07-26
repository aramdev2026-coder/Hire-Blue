package com.aram.ftc.ui.screens

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.navigation.NavController
import com.aram.ftc.data.api.NoConnectivityException
import com.aram.ftc.data.model.EmployerLoginRequest
import com.aram.ftc.data.model.EmployerSignupRequest
import com.aram.ftc.data.pref.SessionManager
import com.aram.ftc.ui.components.AramHeader
import com.aram.ftc.ui.components.AramToastBanner
import com.aram.ftc.ui.components.ModernPasswordField
import com.aram.ftc.ui.components.ModernTextField
import com.aram.ftc.ui.theme.AramColors
import com.aram.ftc.ui.theme.AramRadius
import com.aram.ftc.ui.theme.ThemeViewModel
import com.aram.ftc.util.ValidationUtils
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployerAuthScreen(navController: NavController, themeViewModel: ThemeViewModel, showToast: (String, Boolean) -> Unit = { _, _ -> }) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val sessionManager = remember { SessionManager(context) }
    val apiService = remember { com.aram.ftc.data.api.RetrofitClient.service }

    var mode by remember { mutableStateOf("login") } // "login" | "signup"
    var loading by remember { mutableStateOf(false) }

    var companyName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    var identifier by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var showErrors by remember { mutableStateOf(false) }
    var toastMessage by remember { mutableStateOf<String?>(null) }
    var isToastError by remember { mutableStateOf(true) }

    fun validate(): Boolean {
        if (mode == "signup") {
            if (companyName.isBlank()) return false
            if (!ValidationUtils.isValidPhone(phoneNumber)) return false
            if (!ValidationUtils.isValidEmail(email)) return false
            if (password.length < 6) return false
            if (password != confirmPassword) return false
        } else {
            if (identifier.isBlank()) return false
            if (password.isBlank()) return false
        }
        return true
    }

    Scaffold(
        topBar = {
            AramHeader(
                title = "ARAM Employer Portal",
                themeViewModel = themeViewModel,
                onBack = { navController.navigateUp() }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(AramRadius.XL),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(24.dp)) {
                        Text(
                            text = if (mode == "login") "Welcome Back" else "Partner Registration",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Access the verified blue-collar workforce network across Tamil Nadu.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 20.dp),
                            textAlign = TextAlign.Center
                        )

                        // Mode Selector Toggle
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 20.dp)
                        ) {
                            Button(
                                onClick = { mode = "login"; showErrors = false },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(50.dp),
                                contentPadding = PaddingValues(horizontal = 4.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (mode == "login") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                    contentColor = if (mode == "login") Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                ),
                                shape = RoundedCornerShape(topStart = 12.dp, bottomStart = 12.dp, topEnd = 0.dp, bottomEnd = 0.dp)
                            ) {
                                Text(
                                    "Employer Login",
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }

                            Button(
                                onClick = { mode = "signup"; showErrors = false },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(50.dp),
                                contentPadding = PaddingValues(horizontal = 4.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (mode == "signup") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                    contentColor = if (mode == "signup") Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                ),
                                shape = RoundedCornerShape(topStart = 0.dp, bottomStart = 0.dp, topEnd = 12.dp, bottomEnd = 12.dp)
                            ) {
                                Text(
                                    "New Register",
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        }

                        if (mode == "signup") {
                            ModernTextField(
                                value = companyName,
                                onValueChange = { companyName = it },
                                label = "Company Name *",
                                errorMessage = if (showErrors && companyName.isBlank()) "Company Name is required" else null
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            ModernTextField(
                                value = email,
                                onValueChange = { email = it },
                                label = "Official Email *",
                                errorMessage = if (showErrors && !ValidationUtils.isValidEmail(email)) "Valid official email required" else null
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            ModernTextField(
                                value = phoneNumber,
                                onValueChange = { phoneNumber = it },
                                label = "Contact Phone Number *",
                                errorMessage = if (showErrors && !ValidationUtils.isValidPhone(phoneNumber)) "Valid 10-digit phone required" else null
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            ModernPasswordField(
                                value = password,
                                onValueChange = { password = it },
                                label = "Password *",
                                errorMessage = if (showErrors && password.length < 6) "At least 6 characters required" else null
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            ModernPasswordField(
                                value = confirmPassword,
                                onValueChange = { confirmPassword = it },
                                label = "Confirm Password *",
                                errorMessage = if (showErrors && password != confirmPassword) "Passwords do not match" else null
                            )
                        } else {
                            ModernTextField(
                                value = identifier,
                                onValueChange = { identifier = it },
                                label = "Official Email or Phone *",
                                errorMessage = if (showErrors && identifier.isBlank()) "Email or Phone is required" else null
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            ModernPasswordField(
                                value = password,
                                onValueChange = { password = it },
                                label = "Password *",
                                errorMessage = if (showErrors && password.isBlank()) "Password is required" else null
                            )
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Button(
                            onClick = {
                                showErrors = true
                                if (!validate()) return@Button
                                loading = true
                                coroutineScope.launch {
                                    try {
                                        if (mode == "signup") {
                                            val res = apiService.signupEmployer(EmployerSignupRequest(companyName.trim(), email.trim(), phoneNumber.trim(), password))
                                            if (res.isSuccessful && res.body()?.success == true) {
                                                toastMessage = "Registration Success! Welcome email sent to your inbox."
                                                isToastError = false
                                                mode = "login"; identifier = phoneNumber; password = ""; confirmPassword = ""
                                            } else {
                                                toastMessage = "Error: ${res.message()}"
                                                isToastError = true
                                            }
                                        } else {
                                            val res = apiService.loginEmployer(EmployerLoginRequest(identifier.trim(), password))
                                            if (res.isSuccessful && res.body()?.success == true) {
                                                val body = res.body()!!
                                                sessionManager.saveEmployerSession(body.token, body.employerId, body.companyName, body.email, body.phoneNumber)
                                                showToast("Welcome back, ${body.companyName ?: "Employer"}!", false)
                                                navController.navigate("employer_dashboard") { popUpTo("role_selection") { inclusive = false } }
                                            } else {
                                                toastMessage = "Invalid email/phone or password. Please try again."
                                                isToastError = true
                                            }
                                        }
                                    } catch (e: NoConnectivityException) {
                                        toastMessage = "No Internet Connection."
                                        isToastError = true
                                    } catch (e: Exception) {
                                        toastMessage = "Error: ${e.message}"
                                        isToastError = true
                                    } finally {
                                        loading = false
                                    }
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp),
                            shape = RoundedCornerShape(AramRadius.Full),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = AramColors.IndigoPrimary,
                                contentColor = Color.White
                            ),
                            enabled = !loading
                        ) {
                            if (loading) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(22.dp), strokeWidth = 2.dp)
                            } else {
                                Text(
                                    if (mode == "login") "Sign In" else "Create Account",
                                    style = MaterialTheme.typography.labelLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }
            AnimatedVisibility(
                visible = toastMessage != null,
                enter = slideInVertically() + fadeIn(),
                exit = slideOutVertically() + fadeOut(),
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 8.dp)
                    .zIndex(10f)
            ) {
                AramToastBanner(
                    message = toastMessage ?: "",
                    isError = isToastError,
                    onDismiss = { toastMessage = null }
                )
            }
        }
    }
}
