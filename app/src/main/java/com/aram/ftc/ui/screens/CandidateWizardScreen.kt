package com.aram.ftc.ui.screens

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.navigation.NavController
import com.aram.ftc.data.model.*
import com.aram.ftc.data.pref.SessionManager
import com.aram.ftc.ui.components.*
import com.aram.ftc.ui.theme.AramColors
import com.aram.ftc.ui.theme.AramRadius
import com.aram.ftc.ui.theme.ThemeViewModel
import com.aram.ftc.util.ValidationUtils
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CandidateWizardScreen(navController: NavController, themeViewModel: ThemeViewModel) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val sessionManager = remember { SessionManager(context) }
    val apiService = remember { com.aram.ftc.data.api.RetrofitClient.service }

    val token = remember { "Bearer ${sessionManager.getCandidateToken() ?: ""}" }
    val candidateId = remember { sessionManager.getCandidateId() }

    var step by remember { mutableStateOf(1) }
    var loading by remember { mutableStateOf(false) }
    var isNewUser by remember { mutableStateOf(false) }
    var isReviewMode by remember { mutableStateOf(false) }
    var showErrors by remember { mutableStateOf(false) }

    // State Variables
    var fullName by remember { mutableStateOf("") }
    var dob by remember { mutableStateOf("") }
    var sex by remember { mutableStateOf("") }
    var maritalStatus by remember { mutableStateOf("") }
    var phoneNumber1 by remember { mutableStateOf("") }
    var phoneNumber2 by remember { mutableStateOf("") }
    var emailId by remember { mutableStateOf(sessionManager.getCandidateEmail() ?: "") }
    var secondaryEmailId by remember { mutableStateOf("") }
    
    var presentStreet1 by remember { mutableStateOf("") }
    var presentCity by remember { mutableStateOf("") }
    var presentState by remember { mutableStateOf("Tamil Nadu") }
    
    var permanentStreet1 by remember { mutableStateOf("") }
    var permanentCity by remember { mutableStateOf("") }
    var permanentState by remember { mutableStateOf("Tamil Nadu") }

    var isPermanentSame by remember { mutableStateOf(false) }

    var expectedSalary by remember { mutableStateOf("₹15,000 - ₹25,000") }
    val selectedRoles = remember { mutableStateListOf<String>() }
    val selectedDistricts = remember { mutableStateListOf<String>() }
    val selectedLanguages = remember { mutableStateListOf<String>() }

    val educationList = remember { mutableStateListOf(EducationItem("", "")) }
    val experienceList = remember { mutableStateListOf(ExperienceItem("", "", "", "")) }

    LaunchedEffect(Unit) {
        loading = true
        try {
            val response = apiService.getCandidateProfile(token, candidateId)
            if (response.isSuccessful && response.body()?.success == true) {
                val db = response.body()?.candidate
                if (db != null) {
                    if (db.fullName.isNullOrBlank()) isNewUser = true
                    fullName = db.fullName ?: ""
                    dob = db.dob ?: ""
                    sex = db.sex ?: ""
                    maritalStatus = db.maritalStatus ?: ""
                    phoneNumber1 = if (db.phoneNumber1?.startsWith("EMAIL_AUTO_") == true) "" else (db.phoneNumber1 ?: "")
                    phoneNumber2 = db.phoneNumber2 ?: ""
                    emailId = db.emailId ?: emailId
                    presentStreet1 = db.presentAddress ?: ""
                    presentCity = db.presentDistrict ?: ""
                    presentState = db.presentState ?: "Tamil Nadu"
                    permanentStreet1 = db.permanentAddress ?: ""
                    permanentCity = db.permanentDistrict ?: ""
                    permanentState = db.permanentState ?: "Tamil Nadu"
                    isPermanentSame = (db.presentAddress == db.permanentAddress && 
                                     db.presentDistrict == db.permanentDistrict && 
                                     db.presentState == db.permanentState &&
                                     db.presentAddress?.isNotEmpty() == true)
                    selectedRoles.clear(); selectedRoles.addAll(db.jobRoles)
                    selectedDistricts.clear(); selectedDistricts.addAll(db.preferredDistricts)
                    selectedLanguages.clear(); selectedLanguages.addAll(db.languagesKnown)
                    if (db.education.isNotEmpty()) { educationList.clear(); educationList.addAll(db.education) }
                    if (db.experience.isNotEmpty()) { experienceList.clear(); experienceList.addAll(db.experience) }
                    expectedSalary = db.expectedSalary ?: "₹15,000 - ₹25,000"
                }
            } else if (response.code() == 404) {
                isNewUser = true
            }
        } catch (e: Exception) { 
            isNewUser = true
        } finally {
            loading = false
        }
    }

    var toastMessage by remember { mutableStateOf<String?>(null) }
    var isToastError by remember { mutableStateOf(true) }

    val scrollState = rememberScrollState()

    fun validateStep(): Boolean {
        when (step) {
            1 -> {
                if (fullName.isBlank()) return false
                if (dob.isBlank()) return false
                if (sex.isBlank()) return false
                if (maritalStatus.isBlank()) return false
                if (!ValidationUtils.isValidPhone(phoneNumber1)) return false
                if (presentStreet1.isBlank() || presentCity.isBlank()) return false
            }
            2 -> {
                if (selectedRoles.isEmpty()) { toastMessage = "Select at least one job role"; isToastError = true; return false }
                if (selectedDistricts.isEmpty()) { toastMessage = "Select at least one district"; isToastError = true; return false }
                if (selectedLanguages.isEmpty()) { toastMessage = "Select at least one language"; isToastError = true; return false }
            }
        }
        return true
    }

    fun handleNext() {
        showErrors = true
        if (!validateStep()) {
            coroutineScope.launch { scrollState.animateScrollTo(0) }
            if (step == 1) {
                toastMessage = "Please fill all required personal & contact details"
                isToastError = true
            }
            return
        }
        showErrors = false
        if (step < 3) step++
        else isReviewMode = true
    }

    fun finalizeWizard() {
        loading = true
        coroutineScope.launch {
            try {
                val finalPayload = CandidatePayload(
                    fullName = fullName, dob = dob, sex = sex, maritalStatus = maritalStatus,
                    phoneNumber1 = phoneNumber1, phoneNumber2 = phoneNumber2,
                    emailId = emailId, secondaryEmailId = secondaryEmailId,
                    presentAddress = presentStreet1, presentDistrict = presentCity, presentState = presentState,
                    permanentAddress = if (isPermanentSame) presentStreet1 else permanentStreet1,
                    permanentDistrict = if (isPermanentSame) presentCity else permanentCity,
                    permanentState = if (isPermanentSame) presentState else permanentState,
                    jobRoles = selectedRoles.toList(),
                    preferredDistricts = selectedDistricts.toList(),
                    expectedSalary = expectedSalary,
                    languagesKnown = selectedLanguages.toList(),
                    education = educationList.filter { it.institution.isNotBlank() },
                    experience = experienceList.filter { it.institution.isNotBlank() }
                )
                apiService.saveWizardStep(token, SaveWizardRequest(candidateId, 3, finalPayload))
                val fin = apiService.finalizeWizard(token, FinalizeWizardRequest(candidateId, isNewUser))
                if (fin.isSuccessful) {
                    sessionManager.clearWizardDraft()
                    toastMessage = "Profile Secured! Welcome to ARAM."
                    isToastError = false
                    navController.navigate("candidate_dashboard") { popUpTo("role_selection") { inclusive = false } }
                }
            } catch (e: Exception) {
                toastMessage = "Error: ${e.message}"
                isToastError = true
            } finally {
                loading = false
            }
        }
    }

    Scaffold(
        topBar = {
            if (!isReviewMode) {
                WizardHeader(currentStep = step, themeViewModel = themeViewModel, onBack = { if (step > 1) step-- else navController.popBackStack() })
            } else {
                AramHeader(
                    title = "Review Profile",
                    themeViewModel = themeViewModel,
                    onBack = { isReviewMode = false }
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
                AnimatedContent(
                    targetState = isReviewMode to step,
                    transitionSpec = {
                        slideInHorizontally { it } + fadeIn() togetherWith
                        slideOutHorizontally { -it } + fadeOut()
                    },
                    modifier = Modifier.weight(1f),
                    label = "step_animation"
                ) { (isReview, currentStep) ->
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(scrollState)
                            .padding(16.dp)
                    ) {
                        if (isReview) {
                            ReviewPage(
                                fullName = fullName, dob = dob, sex = sex, maritalStatus = maritalStatus,
                                phoneNumber1 = phoneNumber1, phoneNumber2 = phoneNumber2, emailId = emailId,
                                presentState = presentState, presentCity = presentCity, presentStreet1 = presentStreet1,
                                isPermanentSame = isPermanentSame, permanentState = permanentState, permanentCity = permanentCity, permanentStreet1 = permanentStreet1,
                                expectedSalary = expectedSalary, selectedRoles = selectedRoles, selectedDistricts = selectedDistricts, selectedLanguages = selectedLanguages,
                                educationList = educationList, experienceList = experienceList,
                                onFinalize = { finalizeWizard() },
                                onBack = { isReviewMode = false },
                                loading = loading
                            )
                        } else {
                            when (currentStep) {
                                1 -> StepOne(
                                    fullName, { fullName = it }, dob, { dob = it }, sex, { sex = it },
                                    maritalStatus, { maritalStatus = it }, phoneNumber1, { phoneNumber1 = it },
                                    phoneNumber2, { phoneNumber2 = it }, emailId, presentState, { presentState = it },
                                    presentCity, { presentCity = it }, presentStreet1, { presentStreet1 = it },
                                    isPermanentSame, { isPermanentSame = it }, permanentState, { permanentState = it },
                                    permanentCity, { permanentCity = it }, permanentStreet1, { permanentStreet1 = it },
                                    showErrors = showErrors
                                )
                                2 -> StepTwo(
                                    selectedRoles, selectedDistricts, selectedLanguages,
                                    expectedSalary, { expectedSalary = it }
                                )
                                3 -> StepThree(educationList, experienceList)
                            }
                            
                            Spacer(modifier = Modifier.height(24.dp))
                            
                            Button(
                                onClick = { handleNext() },
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
                                        if (currentStep == 3) "Review Profile Details →" else "Next Step →",
                                        style = MaterialTheme.typography.labelLarge,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(16.dp))
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
fun StepOne(
    fullName: String, onFullNameChange: (String) -> Unit,
    dob: String, onDobChange: (String) -> Unit,
    sex: String, onSexChange: (String) -> Unit,
    maritalStatus: String, onMaritalStatusChange: (String) -> Unit,
    phoneNumber1: String, onPhone1Change: (String) -> Unit,
    phoneNumber2: String, onPhone2Change: (String) -> Unit,
    emailId: String,
    presentState: String, onPresentStateChange: (String) -> Unit,
    presentCity: String, onPresentCityChange: (String) -> Unit,
    presentStreet1: String, onPresentStreetChange: (String) -> Unit,
    isPermanentSame: Boolean, onPermanentSameChange: (Boolean) -> Unit,
    permanentState: String, onPermanentStateChange: (String) -> Unit,
    permanentCity: String, onPermanentCityChange: (String) -> Unit,
    permanentStreet1: String, onPermanentStreetChange: (String) -> Unit,
    showErrors: Boolean = false
) {
    WizardSection(title = "Personal Information", icon = Icons.Default.Person) {
        ModernTextField(
            value = fullName,
            onValueChange = onFullNameChange,
            label = "Full Name *",
            errorMessage = if (showErrors && fullName.isBlank()) "Full Name is required" else null
        )
        DatePickerField(label = "Date of Birth *", value = dob, onValueChange = onDobChange)
        StatePillGroup(label = "Gender *", options = AppConstants.GENDER_OPTIONS, selectedOption = sex, onOptionSelected = onSexChange)
        StatePillGroup(label = "Marital Status *", options = AppConstants.MARITAL_OPTIONS, selectedOption = maritalStatus, onOptionSelected = onMaritalStatusChange)
    }

    Spacer(modifier = Modifier.height(8.dp))

    WizardSection(title = "Contact Details", icon = Icons.Default.Call) {
        ModernTextField(
            value = phoneNumber1,
            onValueChange = onPhone1Change,
            label = "Primary Mobile *",
            errorMessage = if (showErrors && !ValidationUtils.isValidPhone(phoneNumber1)) "Enter valid 10-digit mobile number" else null,
            leadingIcon = { Text("+91", modifier = Modifier.padding(start = 12.dp), fontWeight = FontWeight.Bold) }
        )
        ModernTextField(value = phoneNumber2, onValueChange = onPhone2Change, label = "Alternate Mobile")
        ModernTextField(value = emailId, onValueChange = {}, label = "Primary Email *", readOnly = true, enabled = false)
    }

    Spacer(modifier = Modifier.height(8.dp))

    WizardSection(title = "Address Details", icon = Icons.Default.Home) {
        SearchableDropdownField(label = "Present State *", options = AppConstants.STATES_AND_DISTRICTS.keys.toList(), selectedOption = presentState, onOptionSelected = onPresentStateChange)
        SearchableDropdownField(label = "Present District *", options = AppConstants.STATES_AND_DISTRICTS[presentState] ?: emptyList(), selectedOption = presentCity, onOptionSelected = onPresentCityChange)
        ModernTextField(
            value = presentStreet1,
            onValueChange = onPresentStreetChange,
            label = "Street Address *",
            errorMessage = if (showErrors && presentStreet1.isBlank()) "Street Address is required" else null
        )

        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 12.dp)) {
            Checkbox(
                checked = isPermanentSame,
                onCheckedChange = onPermanentSameChange,
                colors = CheckboxDefaults.colors(checkedColor = AramColors.IndigoPrimary)
            )
            Text("Permanent address is same as present", style = MaterialTheme.typography.bodyMedium, color = AramColors.TextPrimary)
        }

        AnimatedVisibility(visible = !isPermanentSame) {
            Column(modifier = Modifier.padding(top = 16.dp)) {
                HorizontalDivider(color = AramColors.Divider)
                Spacer(modifier = Modifier.height(16.dp))
                SearchableDropdownField(label = "Permanent State *", options = AppConstants.STATES_AND_DISTRICTS.keys.toList(), selectedOption = permanentState, onOptionSelected = onPermanentStateChange)
                SearchableDropdownField(label = "Permanent District *", options = AppConstants.STATES_AND_DISTRICTS[permanentState] ?: emptyList(), selectedOption = permanentCity, onOptionSelected = { onPermanentCityChange(it) })
                ModernTextField(value = permanentStreet1, onValueChange = onPermanentStreetChange, label = "Permanent Street Address *")
            }
        }
    }
}

@Composable
fun StepTwo(
    selectedRoles: MutableList<String>,
    selectedDistricts: MutableList<String>,
    selectedLanguages: MutableList<String>,
    expectedSalary: String,
    onSalaryChange: (String) -> Unit
) {
    WizardSection(title = "Work Preferences", icon = Icons.Default.Work) {
        SearchableMultiSelectField(label = "Target Job Roles *", options = AppConstants.ALL_JOB_ROLES, selectedOptions = selectedRoles, onToggleOption = { if (selectedRoles.contains(it)) selectedRoles.remove(it) else selectedRoles.add(it) })
        
        val allDistricts = AppConstants.STATES_AND_DISTRICTS.values.flatten().distinct().sorted()
        SearchableMultiSelectField(label = "Preferred Districts *", options = allDistricts, selectedOptions = selectedDistricts, onToggleOption = { if (selectedDistricts.contains(it)) selectedDistricts.remove(it) else selectedDistricts.add(it) })
        
        SearchableMultiSelectField(label = "Languages Known *", options = AppConstants.LANGUAGES, selectedOptions = selectedLanguages, onToggleOption = { if (selectedLanguages.contains(it)) selectedLanguages.remove(it) else selectedLanguages.add(it) })

        Spacer(modifier = Modifier.height(16.dp))
        SalaryRangeSlider(value = expectedSalary, onValueChange = onSalaryChange)
    }
}

@Composable
fun StepThree(
    educationList: MutableList<EducationItem>,
    experienceList: MutableList<ExperienceItem>
) {
    WizardSection(title = "Education History", icon = Icons.Default.School) {
        educationList.forEachIndexed { index, item ->
            Column(Modifier.padding(vertical = 8.dp)) {
                SearchableDropdownField(label = "School/College Name", options = AppConstants.TN_COLLEGES, selectedOption = item.institution ?: "", onOptionSelected = { educationList[index] = item.copy(institution = it) })
                StatePillGroup(label = "Degree", options = listOf("SSLC (10th)", "HSC (12th)", "ITI", "Diploma", "Degree"), selectedOption = item.course ?: "", onOptionSelected = { educationList[index] = item.copy(course = it) })
                if (index < educationList.size - 1) HorizontalDivider(Modifier.padding(vertical = 8.dp), color = AramColors.Divider)
            }
        }
        TextButton(onClick = { educationList.add(EducationItem("", "")) }) {
            Icon(Icons.Default.Add, null, tint = AramColors.IndigoPrimary)
            Spacer(Modifier.width(4.dp))
            Text("Add Education", fontWeight = FontWeight.Bold, color = AramColors.IndigoPrimary)
        }
    }

    Spacer(modifier = Modifier.height(8.dp))

    WizardSection(title = "Work Experience", icon = Icons.Default.History) {
        experienceList.forEachIndexed { index, item ->
            Column(Modifier.padding(vertical = 8.dp)) {
                ModernTextField(value = item.institution ?: "", onValueChange = { experienceList[index] = item.copy(institution = it) }, label = "Company Name")
                ModernTextField(value = item.role ?: "", onValueChange = { experienceList[index] = item.copy(role = it) }, label = "Designation")
                Row {
                    Box(Modifier.weight(1f)) { ModernTextField(value = item.fromYear ?: "", onValueChange = { experienceList[index] = item.copy(fromYear = it) }, label = "From (Year)") }
                    Spacer(Modifier.width(12.dp))
                    Box(Modifier.weight(1f)) { ModernTextField(value = item.toYear ?: "", onValueChange = { experienceList[index] = item.copy(toYear = it) }, label = "To (Year)") }
                }
                if (index < experienceList.size - 1) HorizontalDivider(Modifier.padding(vertical = 8.dp), color = AramColors.Divider)
            }
        }
        TextButton(onClick = { experienceList.add(ExperienceItem("", "", "", "")) }) {
            Icon(Icons.Default.Add, null, tint = AramColors.IndigoPrimary)
            Spacer(Modifier.width(4.dp))
            Text("Add Experience", fontWeight = FontWeight.Bold, color = AramColors.IndigoPrimary)
        }
    }
}

@Composable
fun ReviewPage(
    fullName: String, dob: String, sex: String, maritalStatus: String,
    phoneNumber1: String, phoneNumber2: String, emailId: String,
    presentState: String, presentCity: String, presentStreet1: String,
    isPermanentSame: Boolean, permanentState: String, permanentCity: String, permanentStreet1: String,
    expectedSalary: String, selectedRoles: List<String>, selectedDistricts: List<String>, selectedLanguages: List<String>,
    educationList: List<EducationItem>, experienceList: List<ExperienceItem>,
    onFinalize: () -> Unit, onBack: () -> Unit, loading: Boolean
) {
    ReviewSection(title = "Personal & Contact", icon = Icons.Default.Person) {
        ReviewRow(label = "Full Name", value = fullName)
        ReviewRow(label = "Date of Birth", value = dob)
        ReviewRow(label = "Gender", value = sex)
        ReviewRow(label = "Marital Status", value = maritalStatus)
        ReviewRow(label = "Primary Mobile", value = "+91 $phoneNumber1")
        if (phoneNumber2.isNotBlank()) ReviewRow(label = "Alternate Mobile", value = "+91 $phoneNumber2")
        ReviewRow(label = "Email Address", value = emailId)
    }

    ReviewSection(title = "Address Details", icon = Icons.Default.Home) {
        ReviewRow(label = "Present Address", value = "$presentStreet1, $presentCity, $presentState")
        if (!isPermanentSame) {
            ReviewRow(label = "Permanent Address", value = "$permanentStreet1, $permanentCity, $permanentState")
        } else {
            Text("Permanent address is same as present.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 4.dp))
        }
    }

    ReviewSection(title = "Job Preferences", icon = Icons.Default.Work) {
        ReviewRow(label = "Salary Expectation", value = expectedSalary)
        ReviewChips(label = "Target Roles", tags = selectedRoles)
        ReviewChips(label = "Preferred Districts", tags = selectedDistricts)
        ReviewChips(label = "Languages", tags = selectedLanguages)
    }

    educationList.filter { it.institution.isNotBlank() }.takeIf { it.isNotEmpty() }?.let { list ->
        ReviewSection(title = "Education", icon = Icons.Default.School) {
            list.forEach { edu -> 
                val courseName = if (!edu.course.isNullOrBlank() && edu.course != "null") edu.course else "Education"
                ReviewRow(label = courseName, value = edu.institution) 
            }
        }
    }

    experienceList.filter { it.institution.isNotBlank() }.takeIf { it.isNotEmpty() }?.let { list ->
        ReviewSection(title = "Experience", icon = Icons.Default.History) {
            list.forEach { exp ->
                val roleName = if (!exp.role.isNullOrBlank() && exp.role != "null") exp.role else "Work Experience"
                ReviewRow(label = "$roleName at ${exp.institution}", value = "${exp.fromYear} - ${exp.toYear}") 
            }
        }
    }

    Spacer(modifier = Modifier.height(32.dp))
    Button(
        onClick = onFinalize,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        shape = RoundedCornerShape(AramRadius.Full),
        colors = ButtonDefaults.buttonColors(
            containerColor = AramColors.EmeraldPrimary,
            contentColor = Color.White,
            disabledContainerColor = AramColors.EmeraldPrimary,
            disabledContentColor = Color.White
        ),
        enabled = !loading
    ) {
        if (loading) {
            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp), strokeWidth = 2.5.dp)
        } else {
            Text("Submit & Secure Profile", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold, color = Color.White)
        }
    }
    
    TextButton(onClick = onBack, modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
        Text("Go back to edit", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
    }
    Spacer(modifier = Modifier.height(140.dp))
}
