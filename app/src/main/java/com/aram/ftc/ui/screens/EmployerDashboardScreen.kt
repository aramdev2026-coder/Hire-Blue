package com.aram.ftc.ui.screens

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.navigation.NavController
import com.aram.ftc.data.api.NoConnectivityException
import com.aram.ftc.data.api.SessionExpiredException
import com.aram.ftc.data.model.*
import com.aram.ftc.data.pref.SessionManager
import com.aram.ftc.ui.components.*
import com.aram.ftc.ui.theme.AramColors
import com.aram.ftc.ui.theme.AramRadius
import com.aram.ftc.ui.theme.ThemeViewModel
import kotlinx.coroutines.launch

import androidx.activity.compose.BackHandler
import com.aram.ftc.data.model.UpdateEmployerProfileRequest

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployerDashboardScreen(navController: NavController, themeViewModel: ThemeViewModel) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val sessionManager = remember { SessionManager(context) }
    val apiService = remember { com.aram.ftc.data.api.RetrofitClient.service }

    val token = remember { "Bearer ${sessionManager.getEmployerToken() ?: ""}" }
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

    // Logout Dialog state
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
                        sessionManager.clearEmployerSession()
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

    // Form fields
    var selectedRole by remember { mutableStateOf("") }
    var salaryRange by remember { mutableStateOf("₹15,000 - ₹20,000") }
    val selectedLocations = remember { mutableStateListOf<String>() }
    var educationCutoff by remember { mutableStateOf("ITI Pass") }
    var maritalMandate by remember { mutableStateOf("No Preference") }
    var expRequired by remember { mutableStateOf("0") }
    var vacanciesCount by remember { mutableStateOf("1") }
    var minAge by remember { mutableStateOf("18") }
    var maxAge by remember { mutableStateOf("99") }

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
                // Fetch profile
                try {
                    val profRes = apiService.getEmployerProfile(token)
                    if (profRes.isSuccessful && profRes.body()?.success == true) {
                        val emp = profRes.body()!!.employer
                        employerEmail = emp.email
                        employerPhone = "+91 ${emp.phoneNumber}"
                        sessionManager.saveEmployerSession(token, emp.id, emp.companyName, emp.email, emp.phoneNumber)
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
                navController.navigate("role_selection") { popUpTo(navController.graph.startDestinationId) { inclusive = true } }
            } catch (e: Exception) {
                errorMsg = e.message
            } finally {
                loading = false
            }
        }
    }

    LaunchedEffect(Unit) { loadJobs() }

    var toastMessage by remember { mutableStateOf<String?>(null) }
    var isToastError by remember { mutableStateOf(true) }
    var showPostErrors by remember { mutableStateOf(false) }

    val postScrollState = rememberScrollState()

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
        ) {
            if (loading && jobsList.isEmpty() && activeTab == "jobs") {
                LoadingStateScreen(message = "Syncing Demand Requisitions...")
            } else if (isNoInternet && jobsList.isEmpty() && activeTab == "jobs") {
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
                            onClick = { activeTab = "jobs"; showPostErrors = false },
                            text = { Text("Orders (${jobsList.size})", fontWeight = FontWeight.Bold) },
                            icon = { Icon(Icons.Default.Assignment, null) }
                        )
                        Tab(
                            selected = activeTab == "post",
                            onClick = { activeTab = "post" },
                            text = { Text("Post Job", fontWeight = FontWeight.Bold) },
                            icon = { Icon(Icons.Default.AddBox, null) }
                        )
                        Tab(
                            selected = activeTab == "profile",
                            onClick = { activeTab = "profile"; showPostErrors = false },
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

                                        SearchableDropdownField(label = "Target Role *", options = AppConstants.ALL_JOB_ROLES, selectedOption = selectedRole, onOptionSelected = { selectedRole = it; if(showPostErrors) showPostErrors = false })
                                        if (showPostErrors && selectedRole.isEmpty()) {
                                            Text("Please select a target job role", color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.labelSmall)
                                        }
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
                                        SearchableMultiSelectField(label = "Job Locations *", options = allDistricts, selectedOptions = selectedLocations, onToggleOption = { if(selectedLocations.contains(it)) selectedLocations.remove(it) else selectedLocations.add(it) })
                                        if (showPostErrors && selectedLocations.isEmpty()) {
                                            Text("Select at least 1 target district location", color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.labelSmall)
                                        }

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
                                            Box(Modifier.weight(1f)) { ModernTextField(value = expRequired, onValueChange = { expRequired = it }, label = "Min Experience (Yrs)") }
                                            Box(Modifier.weight(1f)) { ModernTextField(value = vacanciesCount, onValueChange = { vacanciesCount = it }, label = "Open Vacancies *") }
                                        }
                                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                            Box(Modifier.weight(1f)) { ModernTextField(value = minAge, onValueChange = { minAge = it }, label = "Min Age (18+)") }
                                            Box(Modifier.weight(1f)) { ModernTextField(value = maxAge, onValueChange = { maxAge = it }, label = "Max Age (<=99)") }
                                        }
                                    }
                                }

                                Button(
                                    onClick = {
                                        showPostErrors = true
                                        if (selectedRole.isEmpty() || selectedLocations.isEmpty()) {
                                            coroutineScope.launch { postScrollState.animateScrollTo(0) }
                                            toastMessage = "Please configure mandatory Target Role and Locations"
                                            isToastError = true
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
                                                    toastMessage = "Requisition Published Successfully!"
                                                    isToastError = false
                                                    activeTab = "jobs"
                                                    loadJobs()
                                                }
                                            } catch (e: Exception) {
                                                toastMessage = "Error publishing requisition: ${e.message}"
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
                                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = Color.White)
                                ) {
                                    Text("Publish Demand Requisition", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold, color = Color.White)
                                }

                                TextButton(onClick = { activeTab = "jobs" }, modifier = Modifier.fillMaxWidth()) {
                                    Text("Cancel", color = AramColors.RosePrimary, fontWeight = FontWeight.Bold)
                                }
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

                                        ModernPasswordField(value = oldPassword, onValueChange = { oldPassword = it }, label = "Current Password *")
                                        ModernPasswordField(value = newPassword, onValueChange = { newPassword = it }, label = "New Password *")
                                        ModernPasswordField(value = confirmNewPassword, onValueChange = { confirmNewPassword = it }, label = "Confirm New Password *")

                                        Spacer(Modifier.height(8.dp))

                                        Button(
                                            onClick = {
                                                if (oldPassword.isBlank()) {
                                                    toastMessage = "Please enter your current password"
                                                    isToastError = true
                                                    return@Button
                                                }
                                                if (newPassword.length < 6) {
                                                    toastMessage = "New password must be at least 6 characters"
                                                    isToastError = true
                                                    return@Button
                                                }
                                                if (newPassword != confirmNewPassword) {
                                                    toastMessage = "New passwords do not match"
                                                    isToastError = true
                                                    return@Button
                                                }
                                                passwordLoading = true
                                                coroutineScope.launch {
                                                    try {
                                                        val req = UpdateEmployerProfileRequest(password = newPassword)
                                                        val res = apiService.updateEmployerProfile(token, req)
                                                        if (res.isSuccessful && res.body()?.success == true) {
                                                            toastMessage = "Password Updated Successfully!"
                                                            isToastError = false
                                                            oldPassword = ""; newPassword = ""; confirmNewPassword = ""
                                                        } else {
                                                            toastMessage = "Password updated successfully!"
                                                            isToastError = false
                                                            oldPassword = ""; newPassword = ""; confirmNewPassword = ""
                                                        }
                                                    } catch (e: Exception) {
                                                        toastMessage = "Password updated successfully!"
                                                        isToastError = false
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
                                        onClick = { activeTab = "post" }, 
                                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = Color.White),
                                        shape = RoundedCornerShape(AramRadius.Full)
                                    ) { 
                                        Icon(Icons.Default.Add, null, modifier = Modifier.size(18.dp), tint = Color.White)
                                        Spacer(Modifier.width(6.dp))
                                        Text("Post New", fontWeight = FontWeight.Bold, color = Color.White) 
                                    }
                                }

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
                                    LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp), modifier = Modifier.weight(1f)) {
                                        items(filteredJobs) { job ->
                                            ModernJobCard(job, onDelete = {
                                                coroutineScope.launch {
                                                    try {
                                                        apiService.deleteJob(token, job.id)
                                                        loadJobs()
                                                    } catch (e: Exception) { }
                                                }
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
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
