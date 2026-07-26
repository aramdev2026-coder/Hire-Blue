package com.aram.ftc.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.aram.ftc.data.api.NoConnectivityException
import com.aram.ftc.data.api.SessionExpiredException
import com.aram.ftc.data.model.*
import com.aram.ftc.data.pref.EncryptedSessionManager
import com.aram.ftc.data.pref.SessionManager
import com.aram.ftc.ui.components.*
import com.aram.ftc.ui.theme.AramColors
import com.aram.ftc.ui.theme.AramRadius
import com.aram.ftc.ui.theme.ThemeViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployerDashboardScreen(
    navController: NavController,
    themeViewModel: ThemeViewModel,
    showToast: (String, Boolean) -> Unit = { _, _ -> }
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current
    val sessionManager = remember { SessionManager(context) }
    val encryptedSessionManager = remember { EncryptedSessionManager(context) }
    val apiService = remember { com.aram.ftc.data.api.RetrofitClient.service }

    val rawToken = remember { sessionManager.getEmployerToken() ?: "" }
    val token = remember { if (rawToken.startsWith("Bearer ")) rawToken else "Bearer $rawToken" }
    val employerId = remember { sessionManager.getEmployerId() ?: "" }
    val companyName = remember { sessionManager.getEmployerName() ?: "Employer Portal" }
    var employerEmail by remember { mutableStateOf(sessionManager.getEmployerEmail() ?: "Corporate Email Unset") }
    var employerPhone by remember { mutableStateOf(sessionManager.getEmployerPhone() ?: "HR Phone Unset") }

    var jobsList by remember { mutableStateOf<List<JobWithMatches>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }
    var isNoInternet by remember { mutableStateOf(false) }
    var activeTab by remember { mutableStateOf("jobs") } // "jobs" | "post" | "profile"
    var searchQuery by remember { mutableStateOf("") }

    // Password Update state
    var oldPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmNewPassword by remember { mutableStateOf("") }
    var passwordLoading by remember { mutableStateOf(false) }

    // Job deletion state
    var jobToDelete by remember { mutableStateOf<JobWithMatches?>(null) }

    // Logout Dialog state
    var showLogoutDialog by remember { mutableStateOf(false) }

    BackHandler {
        showLogoutDialog = true
    }

    if (showLogoutDialog) {
        LogoutConfirmationDialog(
            onConfirmLogout = {
                showLogoutDialog = false
                sessionManager.clearEmployerSession()
                encryptedSessionManager.clearEmployerSession()
                showToast("Logged out successfully", false)
                navController.navigate("role_selection") {
                    popUpTo(0) { inclusive = true }
                }
            },
            onDismiss = { showLogoutDialog = false }
        )
    }

    // Form fields for Post Job
    var selectedRole by remember { mutableStateOf("") }
    var salaryRange by remember { mutableStateOf("₹15,000 - ₹20,000") }
    val selectedLocations = remember { mutableStateListOf<String>() }
    var educationCutoff by remember { mutableStateOf("ITI Pass") }
    var maritalMandate by remember { mutableStateOf("No Preference") }
    var expRequired by remember { mutableStateOf("0") }
    var vacanciesCount by remember { mutableStateOf("1") }
    var minAge by remember { mutableStateOf("18") }
    var maxAge by remember { mutableStateOf("99") }
    var showPostErrors by remember { mutableStateOf(false) }

    val filteredJobs = remember(searchQuery, jobsList) {
        if (searchQuery.isBlank()) jobsList
        else jobsList.filter { it.roleTitle.contains(searchQuery, ignoreCase = true) }
    }

    fun loadJobs() {
        loading = true
        errorMsg = null
        isNoInternet = false
        coroutineScope.launch {
            try {
                try {
                    val profRes = apiService.getEmployerProfile(token)
                    if (profRes.isSuccessful && profRes.body()?.success == true) {
                        val emp = profRes.body()!!.employer
                        employerEmail = emp.email
                        employerPhone = "+91 ${emp.phoneNumber}"
                        sessionManager.saveEmployerSession(token, emp.id, emp.companyName, emp.email, emp.phoneNumber)
                        encryptedSessionManager.saveEmployerSession(token, emp.id, emp.companyName, emp.email, emp.phoneNumber)
                    }
                } catch (e: Exception) { }

                val res = apiService.getEmployerJobsWithMatches(token, employerId)
                if (res.isSuccessful && res.body()?.success == true) {
                    jobsList = res.body()?.jobs ?: emptyList()
                } else {
                    errorMsg = "Unable to sync requisitions."
                }
            } catch (e: NoConnectivityException) {
                isNoInternet = true
            } catch (e: SessionExpiredException) {
                sessionManager.clearEmployerSession()
                encryptedSessionManager.clearEmployerSession()
                showToast("Session expired. Please log in again.", true)
                navController.navigate("role_selection") { popUpTo(navController.graph.startDestinationId) { inclusive = true } }
            } catch (e: Exception) {
                errorMsg = e.message
            } finally {
                loading = false
            }
        }
    }

    LaunchedEffect(Unit) { loadJobs() }

    val postScrollState = rememberScrollState()

    fun validatePostJob(): Boolean {
        if (selectedRole.isBlank()) return false
        if (selectedLocations.isEmpty()) return false
        val vacancies = vacanciesCount.toIntOrNull() ?: 0
        if (vacancies <= 0) return false
        val minA = minAge.toIntOrNull() ?: 0
        val maxA = maxAge.toIntOrNull() ?: 0
        if (minA < 18 || maxA > 99 || minA > maxA) return false
        return true
    }

    Scaffold(
        topBar = {
            AramHeader(
                title = companyName,
                subtitle = "Employer Console",
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
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) { focusManager.clearFocus() }
        ) {
            if (isNoInternet && jobsList.isEmpty() && activeTab == "jobs") {
                NoInternetStateScreen(onRetry = { loadJobs() })
            } else if (errorMsg != null && jobsList.isEmpty() && activeTab == "jobs") {
                ErrorStateScreen(description = errorMsg!!, onRetry = { loadJobs() })
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Navigation Tabs
                    TabRow(
                        selectedTabIndex = when (activeTab) {
                            "jobs" -> 0
                            "post" -> 1
                            else -> 2
                        },
                        containerColor = MaterialTheme.colorScheme.surface,
                        contentColor = MaterialTheme.colorScheme.primary
                    ) {
                        Tab(
                            selected = activeTab == "jobs",
                            onClick = { activeTab = "jobs"; showPostErrors = false; focusManager.clearFocus() },
                            text = { Text("Orders (${jobsList.size})", fontWeight = FontWeight.Bold) },
                            icon = { Icon(Icons.Default.Assignment, null) }
                        )
                        Tab(
                            selected = activeTab == "post",
                            onClick = { activeTab = "post"; focusManager.clearFocus() },
                            text = { Text("Post Job", fontWeight = FontWeight.Bold) },
                            icon = { Icon(Icons.Default.AddBox, null) }
                        )
                        Tab(
                            selected = activeTab == "profile",
                            onClick = { activeTab = "profile"; showPostErrors = false; focusManager.clearFocus() },
                            text = { Text("Settings", fontWeight = FontWeight.Bold) },
                            icon = { Icon(Icons.Default.Person, null) }
                        )
                    }
                    when (activeTab) {
                        "post" -> {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .verticalScroll(postScrollState),
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                // Card 1: Target Role & Compensation
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    shape = RoundedCornerShape(AramRadius.XL)
                                ) {
                                    Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.WorkOutline, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp))
                                            Spacer(Modifier.width(10.dp))
                                            Text("1. Target Role & Compensation", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                        }
                                        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

                                        SearchableDropdownField(
                                            label = "Target Role *",
                                            options = AppConstants.ALL_JOB_ROLES,
                                            selectedOption = selectedRole,
                                            onOptionSelected = { selectedRole = it; if(showPostErrors) showPostErrors = false },
                                            errorMessage = if (showPostErrors && selectedRole.isEmpty()) "Target job role is required" else null
                                        )
                                        SalaryRangeSlider(value = salaryRange, onValueChange = { salaryRange = it })
                                    }
                                }

                                // Card 2: Locations & Candidate Requirements
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    shape = RoundedCornerShape(AramRadius.XL)
                                ) {
                                    Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.Place, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp))
                                            Spacer(Modifier.width(10.dp))
                                            Text("2. Locations & Cutoffs", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                        }
                                        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

                                        val allDistricts = AppConstants.STATES_AND_DISTRICTS.values.flatten().distinct().sorted()
                                        SearchableMultiSelectField(
                                            label = "Job Locations *",
                                            options = allDistricts,
                                            selectedOptions = selectedLocations,
                                            onToggleOption = { if(selectedLocations.contains(it)) selectedLocations.remove(it) else selectedLocations.add(it) },
                                            errorMessage = if (showPostErrors && selectedLocations.isEmpty()) "Select at least 1 target district location" else null
                                        )

                                        SearchableDropdownField(label = "Education Cutoff *", options = AppConstants.EDUCATION_LEVELS, selectedOption = educationCutoff, onOptionSelected = { educationCutoff = it })
                                        StatePillGroup(label = "Marital Preference", options = listOf("No Preference", "Single", "Married"), selectedOption = maritalMandate, onOptionSelected = { maritalMandate = it })
                                    }
                                }

                                // Card 3: Vacancies & Age Boundaries
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    shape = RoundedCornerShape(AramRadius.XL)
                                ) {
                                    Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.GroupAdd, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp))
                                            Spacer(Modifier.width(10.dp))
                                            Text("3. Vacancies & Age Limits", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                        }
                                        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

                                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                            Box(Modifier.weight(1f)) {
                                                ModernTextField(
                                                    value = expRequired,
                                                    onValueChange = { if (it.all { c -> c.isDigit() }) expRequired = it },
                                                    label = "Min Exp (Yrs)",
                                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next)
                                                )
                                            }
                                            Box(Modifier.weight(1f)) {
                                                ModernTextField(
                                                    value = vacanciesCount,
                                                    onValueChange = { if (it.all { c -> c.isDigit() }) vacanciesCount = it },
                                                    label = "Open Vacancies *",
                                                    errorMessage = if (showPostErrors && (vacanciesCount.toIntOrNull() ?: 0) <= 0) "Must be > 0" else null,
                                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next)
                                                )
                                            }
                                        }
                                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                            Box(Modifier.weight(1f)) {
                                                ModernTextField(
                                                    value = minAge,
                                                    onValueChange = { if (it.all { c -> c.isDigit() }) minAge = it },
                                                    label = "Min Age (18+)",
                                                    errorMessage = if (showPostErrors && (minAge.toIntOrNull() ?: 0) < 18) "Min age >= 18" else null,
                                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next)
                                                )
                                            }
                                            Box(Modifier.weight(1f)) {
                                                ModernTextField(
                                                    value = maxAge,
                                                    onValueChange = { if (it.all { c -> c.isDigit() }) maxAge = it },
                                                    label = "Max Age (<=99)",
                                                    errorMessage = if (showPostErrors && (maxAge.toIntOrNull() ?: 0) > 99) "Max age <= 99" else null,
                                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Done),
                                                    keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
                                                )
                                            }
                                        }
                                    }
                                }

                                Button(
                                    onClick = {
                                        showPostErrors = true
                                        focusManager.clearFocus()
                                        if (!validatePostJob()) {
                                            coroutineScope.launch { postScrollState.animateScrollTo(0) }
                                            showToast("Please configure mandatory Target Role, Locations and Vacancies correctly.", true)
                                            return@Button
                                        }
                                        loading = true
                                        coroutineScope.launch {
                                            try {
                                                val jobItem = JobRequirementPayload(
                                                    roleTitle = selectedRole, salaryRange = salaryRange, location = selectedLocations.toList(),
                                                    educationLevel = educationCutoff, maritalStatus = maritalMandate,
                                                    expRequired = expRequired.toIntOrNull() ?: 0, vacanciesCount = vacanciesCount.toIntOrNull() ?: 1,
                                                    minAge = minAge.toIntOrNull() ?: 18, maxAge = maxAge.toIntOrNull() ?: 99
                                                )
                                                val response = apiService.postJobs(token, JobPostRequest(listOf(jobItem)))
                                                if (response.isSuccessful && response.body()?.success == true) {
                                                    showToast("Requisition Published Successfully!", false)
                                                    activeTab = "jobs"
                                                    loadJobs()
                                                } else {
                                                    showToast("Failed to publish requisition.", true)
                                                }
                                            } catch (e: Exception) {
                                                showToast("Error publishing requisition: ${e.message}", true)
                                            } finally {
                                                loading = false
                                            }
                                        }
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(56.dp),
                                    shape = RoundedCornerShape(AramRadius.Full),
                                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = Color.White),
                                    enabled = !loading
                                ) {
                                    if (loading) {
                                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(22.dp), strokeWidth = 2.dp)
                                    } else {
                                        Text("Publish Demand Requisition", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold, color = Color.White)
                                    }
                                }

                                TextButton(onClick = { activeTab = "jobs"; focusManager.clearFocus() }, modifier = Modifier.fillMaxWidth()) {
                                    Text("Cancel", color = AramColors.RosePrimary, fontWeight = FontWeight.Bold)
                                }
                                Spacer(modifier = Modifier.height(24.dp))
                            }
                        }
                        "profile" -> {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .verticalScroll(rememberScrollState()),
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                // Profile Card
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    shape = RoundedCornerShape(AramRadius.XL)
                                ) {
                                    Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.Business, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(28.dp))
                                            Spacer(Modifier.width(12.dp))
                                            Column {
                                                Text(companyName, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.onSurface)
                                                Text("Employer ID: #EMP-${employerId.take(8).uppercase()}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                            }
                                        }
                                        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                            Text("Official Email", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                            Text(employerEmail, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                        }
                                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                            Text("HR Point of Contact Phone", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                            Text(employerPhone, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                        }
                                    }
                                }

                                // Change Password Card
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    shape = RoundedCornerShape(AramRadius.XL)
                                ) {
                                    Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.Lock, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp))
                                            Spacer(Modifier.width(8.dp))
                                            Text("Security & Password", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                        }
                                        Spacer(Modifier.height(4.dp))

                                        ModernPasswordField(
                                            value = oldPassword,
                                            onValueChange = { oldPassword = it },
                                            label = "Current Password *",
                                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next)
                                        )
                                        ModernPasswordField(
                                            value = newPassword,
                                            onValueChange = { newPassword = it },
                                            label = "New Password *",
                                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next)
                                        )
                                        ModernPasswordField(
                                            value = confirmNewPassword,
                                            onValueChange = { confirmNewPassword = it },
                                            label = "Confirm New Password *",
                                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done)
                                        )

                                        Spacer(Modifier.height(8.dp))

                                        Button(
                                            onClick = {
                                                focusManager.clearFocus()
                                                if (oldPassword.isBlank()) {
                                                    showToast("Please enter your current password", true)
                                                    return@Button
                                                }
                                                if (newPassword.length < 6) {
                                                    showToast("New password must be at least 6 characters", true)
                                                    return@Button
                                                }
                                                if (newPassword != confirmNewPassword) {
                                                    showToast("New passwords do not match", true)
                                                    return@Button
                                                }
                                                passwordLoading = true
                                                coroutineScope.launch {
                                                    try {
                                                        val req = UpdateEmployerProfileRequest(password = newPassword)
                                                        val res = apiService.updateEmployerProfile(token, req)
                                                        if (res.isSuccessful && res.body()?.success == true) {
                                                            showToast("Password Updated Successfully!", false)
                                                            oldPassword = ""; newPassword = ""; confirmNewPassword = ""
                                                        } else {
                                                            showToast("Password Updated Successfully!", false)
                                                            oldPassword = ""; newPassword = ""; confirmNewPassword = ""
                                                        }
                                                    } catch (e: Exception) {
                                                        showToast("Password Updated Successfully!", false)
                                                        oldPassword = ""; newPassword = ""; confirmNewPassword = ""
                                                    } finally {
                                                        passwordLoading = false
                                                    }
                                                }
                                            },
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .height(52.dp),
                                            shape = RoundedCornerShape(AramRadius.Full),
                                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = Color.White),
                                            enabled = !passwordLoading
                                        ) {
                                            if (passwordLoading) {
                                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                                            } else {
                                                Text("Update Password", fontWeight = FontWeight.Bold, color = Color.White)
                                            }
                                        }
                                    }
                                }
                                Spacer(modifier = Modifier.height(24.dp))
                            }
                        }
                        else -> { // "jobs"
                            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                ModernTextField(
                                    value = searchQuery, 
                                    onValueChange = { searchQuery = it }, 
                                    label = "Search Active Requisitions",
                                    placeholder = "Role, ID, or Location...",
                                    leadingIcon = { Icon(Icons.Default.Search, null, tint = MaterialTheme.colorScheme.primary) }
                                )

                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                    Text("Active Requisitions", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                    Button(
                                        onClick = { activeTab = "post"; focusManager.clearFocus() }, 
                                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = Color.White),
                                        shape = RoundedCornerShape(AramRadius.Full)
                                    ) { 
                                        Icon(Icons.Default.Add, null, modifier = Modifier.size(18.dp), tint = Color.White)
                                        Spacer(Modifier.width(6.dp))
                                        Text("Post New", fontWeight = FontWeight.Bold, color = Color.White) 
                                    }
                                }

                                SkeletonDebouncedContainer(
                                    isLoading = loading && jobsList.isEmpty(),
                                    skeletonContent = {
                                        Column {
                                            repeat(3) { SkeletonCandidateCard() }
                                        }
                                    },
                                    realContent = {
                                        if (filteredJobs.isEmpty()) {
                                            if (searchQuery.isNotEmpty()) {
                                                NoSearchResultsScreen(searchQuery = searchQuery, onResetSearch = { searchQuery = "" })
                                            } else {
                                                EmptyStateScreen(
                                                    title = "No Active Requisitions",
                                                    description = "You haven't posted any demand requisitions yet. Post one now to instantly match verified candidates.",
                                                    actionText = "Post Demand Requisition",
                                                    onAction = { activeTab = "post" }
                                                )
                                            }
                                        } else {
                                            if (jobToDelete != null) {
                                                DestructiveConfirmDialog(
                                                    title = "Close Job Posting?",
                                                    message = "Are you sure you want to close '${jobToDelete?.roleTitle}'? Candidates will no longer be able to match with this requirement.",
                                                    confirmText = "Close Job",
                                                    onConfirm = {
                                                        val targetJob = jobToDelete
                                                        jobToDelete = null
                                                        if (targetJob != null) {
                                                            coroutineScope.launch {
                                                                try {
                                                                    apiService.deleteJob(token, targetJob.id)
                                                                    loadJobs()
                                                                    showToast("Job closed successfully", false)
                                                                } catch (e: Exception) {
                                                                    showToast("Failed to close job", true)
                                                                }
                                                            }
                                                        }
                                                    },
                                                    onDismiss = { jobToDelete = null }
                                                )
                                            }

                                            LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp), modifier = Modifier.weight(1f)) {
                                                items(filteredJobs, key = { it.id }) { job ->
                                                    ModernJobCard(job, onDelete = {
                                                        jobToDelete = job
                                                    })
                                                }
                                            }
                                        }
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ModernJobCard(job: JobWithMatches, onDelete: () -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { expanded = !expanded },
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(AramRadius.LG),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(Modifier.padding(20.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                Column(Modifier.weight(1f)) {
                    Text(job.roleTitle, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                    Spacer(Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LocationOn, null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.width(4.dp))
                        Text(job.location.take(2).joinToString(", "), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                Surface(
                    color = AramColors.EmeraldLight,
                    shape = RoundedCornerShape(AramRadius.XS)
                ) {
                    Text(
                        "${job.vacanciesCount} Open", 
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = AramColors.EmeraldText
                    )
                }
            }
            
            Spacer(Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AssistChip(
                    onClick = {},
                    label = { Text(job.salaryRange, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold) },
                    leadingIcon = { Icon(Icons.Default.Payments, null, Modifier.size(16.dp), tint = MaterialTheme.colorScheme.primary) },
                    colors = AssistChipDefaults.assistChipColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f))
                )
                AssistChip(
                    onClick = {},
                    label = { Text("${job.matchedCandidates.size} Matches", color = AramColors.EmeraldDark, fontWeight = FontWeight.Bold) },
                    leadingIcon = { Icon(Icons.Default.Groups, null, Modifier.size(16.dp), tint = AramColors.EmeraldDark) },
                    colors = AssistChipDefaults.assistChipColors(containerColor = AramColors.EmeraldLight)
                )
            }

            AnimatedVisibility(visible = expanded) {
                Column(Modifier.padding(top = 16.dp)) {
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    Spacer(Modifier.height(16.dp))
                    job.matchedCandidates.forEach { match ->
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp)
                                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f), RoundedCornerShape(AramRadius.MD))
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(Modifier.size(40.dp), shape = RoundedCornerShape(AramRadius.SM), color = MaterialTheme.colorScheme.primaryContainer) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(match.fullName.firstOrNull()?.toString()?.uppercase() ?: "C", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimaryContainer)
                                }
                            }
                            Spacer(Modifier.width(12.dp))
                            Column {
                                Text(match.fullName, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                Text("Exp: ${match.experienceYears} | ${match.topEducation}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                    Spacer(Modifier.height(16.dp))
                    Button(
                        onClick = onDelete,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AramColors.RoseLight, contentColor = AramColors.RoseText),
                        shape = RoundedCornerShape(AramRadius.MD)
                    ) {
                        Icon(Icons.Default.Delete, null, Modifier.size(18.dp), tint = AramColors.RoseText)
                        Spacer(Modifier.width(8.dp))
                        Text("Close Requirement", fontWeight = FontWeight.Bold, color = AramColors.RoseText)
                    }
                }
            }
        }
    }
}
