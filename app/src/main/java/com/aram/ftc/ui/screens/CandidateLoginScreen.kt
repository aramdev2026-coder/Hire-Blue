package com.aram.ftc.ui.screens

import com.aram.ftc.ui.components.AramToastBanner
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.navigation.NavController
import com.aram.ftc.data.api.NoConnectivityException
import com.aram.ftc.data.model.OtpRequest
import com.aram.ftc.data.model.OtpVerifyRequest
import com.aram.ftc.data.pref.SessionManager
import com.aram.ftc.ui.components.ModernTextField
import com.aram.ftc.ui.theme.AramColors
import com.aram.ftc.ui.theme.AramRadius
import com.aram.ftc.ui.theme.ThemeViewModel
import com.aram.ftc.util.ValidationUtils
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CandidateLoginScreen(navController: NavController, themeViewModel: ThemeViewModel, showToast: (String, Boolean) -> Unit = { _, _ -> }) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val sessionManager = remember { SessionManager(context) }
    val apiService = remember { com.aram.ftc.data.api.RetrofitClient.service }

    var step by remember { mutableStateOf("send") } // "send" | "verify"
    var email by remember { mutableStateOf("") }
    var otpCode by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var showErrors by remember { mutableStateOf(false) }
    var toastMessage by remember { mutableStateOf<String?>(null) }
    var isToastError by remember { mutableStateOf(true) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(AramColors.SlateDeep)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top back button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp, bottom = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }
                Spacer(modifier = Modifier.weight(1f))
                Text(
                    text = "ARAM",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = AramColors.IndigoLight
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Branding Icon Circle
            Surface(
                modifier = Modifier.size(100.dp),
                shape = RoundedCornerShape(30.dp),
                color = AramColors.IndigoDeep
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = if (step == "send") Icons.Default.Mail else Icons.Default.VerifiedUser,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp),
                        tint = AramColors.IndigoPrimary
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = AramColors.SlateMedium),
                shape = RoundedCornerShape(AramRadius.XL),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    AnimatedContent(
                        targetState = step,
                        transitionSpec = {
                            slideInHorizontally { it } + fadeIn() togetherWith
                            slideOutHorizontally { -it } + fadeOut()
                        },
                        label = "auth_step"
                    ) { currentStep ->
                        if (currentStep == "send") {
                            Column {
                                Text(
                                    text = "Candidate Portal",
                                    style = MaterialTheme.typography.headlineMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = AramColors.IndigoMedium,
                                    modifier = Modifier.fillMaxWidth(),
                                    textAlign = TextAlign.Center
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "Verify your email to access matching blue-collar opportunities.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = AramColors.TextOnDarkMuted,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 24.dp),
                                    textAlign = TextAlign.Center
                                )

                                ModernTextField(
                                    value = email,
                                    onValueChange = { email = it; if(showErrors) showErrors = false },
                                    label = "Email Address *",
                                    placeholder = "name@example.com",
                                    errorMessage = if (showErrors && !ValidationUtils.isValidEmail(email.trim())) "Please enter a valid email address" else null,
                                    leadingIcon = { Icon(Icons.Default.Mail, contentDescription = null, tint = AramColors.IndigoPrimary) }
                                )

                                Spacer(modifier = Modifier.height(24.dp))

                                Button(
                                    onClick = {
                                        showErrors = true
                                        if (!ValidationUtils.isValidEmail(email.trim())) {
                                            return@Button
                                        }
                                        loading = true
                                        coroutineScope.launch {
                                            try {
                                                val res = apiService.sendOtp(OtpRequest(email.trim().lowercase()))
                                                if (res.isSuccessful && res.body()?.success == true) {
                                                    step = "verify"
                                                    toastMessage = "OTP sent to your email address!"
                                                    isToastError = false
                                                } else {
                                                    toastMessage = "Failed: ${res.message()}"
                                                    isToastError = true
                                                }
                                            } catch (e: NoConnectivityException) {
                                                toastMessage = "No Internet connection."
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
                                            "Send OTP",
                                            style = MaterialTheme.typography.labelLarge,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }
                                }
                            }
                        } else {
                            Column {
                                Text(
                                    text = "Verify Code",
                                    style = MaterialTheme.typography.headlineMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = AramColors.EmeraldPrimary,
                                    modifier = Modifier.fillMaxWidth(),
                                    textAlign = TextAlign.Center
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "We sent a 6-digit code to $email",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = AramColors.TextOnDarkMuted,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 24.dp),
                                    textAlign = TextAlign.Center
                                )

                                OtpSixDigitInput(
                                    otpCode = otpCode,
                                    onOtpChanged = { otpCode = it }
                                )

                                Spacer(modifier = Modifier.height(24.dp))

                                Button(
                                    onClick = {
                                        if (otpCode.length < 6) {
                                            toastMessage = "Please enter all 6 digits of the OTP code"
                                            isToastError = true
                                            return@Button
                                        }
                                        loading = true
                                        coroutineScope.launch {
                                            try {
                                                // DEV BYPASS
                                                if (otpCode == "123456") {
                                                    sessionManager.saveCandidateSession("dummy-token", 1001, email, "PENDING_ADMIN_CALL")
                                                    showToast("Verification Successful! Welcome.", false)
                                                    navController.navigate("candidate_dashboard") {
                                                        popUpTo("role_selection") { inclusive = false }
                                                    }
                                                    return@launch
                                                }

                                                val res = apiService.verifyOtp(OtpVerifyRequest(email.trim().lowercase(), otpCode))
                                                if (res.isSuccessful && res.body()?.success == true) {
                                                    val body = res.body()!!
                                                    sessionManager.saveCandidateSession(body.token, body.candidateId, email, body.profileStatus)
                                                    showToast("Verification Successful! Welcome.", false)
                                                    if (body.profileStatus == "PENDING_ADMIN_CALL") {
                                                        navController.navigate("candidate_dashboard") {
                                                            popUpTo("role_selection") { inclusive = false }
                                                        }
                                                    } else {
                                                        navController.navigate("candidate_wizard")
                                                    }
                                                } else {
                                                    toastMessage = "Invalid OTP code. Please try again."
                                                    isToastError = true
                                                }
                                            } catch (e: Exception) {
                                                toastMessage = "Verification error: ${e.message}"
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
                                        containerColor = AramColors.EmeraldPrimary,
                                        contentColor = Color.White
                                    ),
                                    enabled = !loading
                                ) {
                                    if (loading) {
                                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(22.dp), strokeWidth = 2.dp)
                                    } else {
                                        Text(
                                            "Verify & Continue",
                                            style = MaterialTheme.typography.labelLarge,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }
                                }

                                TextButton(
                                    onClick = { step = "send" },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 8.dp)
                                ) {
                                    Text("Change Email", color = AramColors.IndigoMedium, fontWeight = FontWeight.Bold)
                                }
                            }
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

@Composable
fun OtpSixDigitInput(
    otpCode: String,
    onOtpChanged: (String) -> Unit
) {
    BasicTextField(
        value = otpCode,
        onValueChange = {
            if (it.length <= 6 && it.all { char -> char.isDigit() }) {
                onOtpChanged(it)
            }
        },
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        decorationBox = {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                repeat(6) { index ->
                    val char = when {
                        index < otpCode.length -> otpCode[index].toString()
                        else -> ""
                    }
                    val isFocused = index == otpCode.length || (index == 5 && otpCode.length == 6)
                    val borderColor by animateColorAsState(
                        if (isFocused) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f),
                        label = "otp_border"
                    )
                    val containerColor = if (isFocused) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surface

                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .height(56.dp),
                        shape = RoundedCornerShape(12.dp),
                        color = containerColor,
                        border = BorderStroke(if (isFocused) 2.dp else 1.dp, borderColor)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = char,
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.ExtraBold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }
    )
}
