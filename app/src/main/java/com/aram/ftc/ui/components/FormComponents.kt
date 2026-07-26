package com.aram.ftc.ui.components

import android.app.DatePickerDialog
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import com.aram.ftc.ui.theme.ThemeViewModel
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aram.ftc.data.model.AppConstants
import com.aram.ftc.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun AramShimmer(
    modifier: Modifier = Modifier,
    radius: androidx.compose.ui.unit.Dp = AramRadius.LG
) {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val shimmerX by transition.animateFloat(
        initialValue = -600f, targetValue = 600f,
        animationSpec = infiniteRepeatable(tween(1400, easing = LinearEasing)),
        label = "shimmerX"
    )
    val shimmerBrush = Brush.linearGradient(
        colors = listOf(
            Color(0xFFE2E8F0),
            Color(0xFFF1F5F9),
            Color(0xFFE2E8F0),
        ),
        start = androidx.compose.ui.geometry.Offset(shimmerX - 300f, 0f),
        end = androidx.compose.ui.geometry.Offset(shimmerX + 300f, 200f)
    )
    Box(modifier.clip(RoundedCornerShape(radius)).background(shimmerBrush))
}

@Composable
fun AnimatedStepDot(isCompleted: Boolean, isActive: Boolean) {
    val width by animateDpAsState(
        targetValue = if (isActive) 28.dp else 8.dp,
        animationSpec = spring(dampingRatio = 0.8f, stiffness = 300f),
        label = "dotWidth"
    )
    val color by animateColorAsState(
        targetValue = when {
            isCompleted -> AramColors.EmeraldPrimary
            isActive -> Color.White
            else -> Color.White.copy(alpha = 0.35f)
        },
        label = "dotColor"
    )
    Box(
        modifier = Modifier
            .width(width)
            .height(8.dp)
            .clip(RoundedCornerShape(AramRadius.Full))
            .background(color)
    ) {
        if (isCompleted) {
            Icon(
                Icons.Default.Check,
                contentDescription = null,
                modifier = Modifier.size(6.dp).align(Alignment.Center),
                tint = AramColors.SlateDeep
            )
        }
    }
}

@Composable
fun WizardHeader(
    currentStep: Int,
    totalSteps: Int = 3,
    themeViewModel: ThemeViewModel? = null,
    onBack: (() -> Unit)? = null
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                brush = Brush.horizontalGradient(
                    listOf(AramColors.IndigoPrimary, AramColors.IndigoDark)
                )
            )
            .statusBarsPadding()
            .padding(horizontal = 20.dp, vertical = 14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (onBack != null) {
                IconButton(onClick = onBack, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Spacer(Modifier.width(8.dp))
            }
            Text(
                "ARAM",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White,
                letterSpacing = 1.sp
            )
            Spacer(Modifier.weight(1f))
            if (themeViewModel != null) {
                val isDarkModeState by themeViewModel.isDarkMode
                val systemDark = isSystemInDarkTheme()
                val isDark = isDarkModeState ?: systemDark
                ThemeSwitch(
                    isDark = isDark,
                    onToggle = { themeViewModel.toggleTheme(systemDark) }
                )
                Spacer(Modifier.width(8.dp))
            }
            Text(
                "Step $currentStep of $totalSteps",
                style = MaterialTheme.typography.labelMedium,
                color = AramColors.TextOnDarkMuted,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(Modifier.height(10.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            repeat(totalSteps) { index ->
                val isCompleted = index < currentStep - 1
                val isActive = index == currentStep - 1
                AnimatedStepDot(isCompleted, isActive)
            }
        }

        Spacer(Modifier.height(6.dp))

        Text(
            text = when(currentStep) {
                1 -> "Personal & Contact Details"
                2 -> "Job Preferences"
                3 -> "Education & Experience"
                else -> ""
            },
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = Color.White
        )
    }
}

@Composable
fun WizardSection(
    title: String,
    icon: ImageVector,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        shape = RoundedCornerShape(AramRadius.LG),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(Modifier.padding(horizontal = 20.dp, vertical = 20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier
                        .width(4.dp)
                        .height(20.dp)
                        .background(AramColors.IndigoPrimary, RoundedCornerShape(2.dp))
                )
                Spacer(Modifier.width(10.dp))
                Icon(icon, contentDescription = null, tint = AramColors.IndigoPrimary, modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
            }
            Spacer(Modifier.height(16.dp))
            content()
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun StatePillGroup(
    label: String,
    options: List<String>,
    selectedOption: String?,
    onOptionSelected: (String) -> Unit,
    errorMessage: String? = null
) {
    val safeSelected = selectedOption ?: ""
    val hasError = !errorMessage.isNullOrBlank()
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Text(
            text = label, 
            style = MaterialTheme.typography.labelLarge, 
            color = if (hasError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(start = 4.dp, bottom = 8.dp)
        )
        
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            options.forEach { option ->
                val isSelected = safeSelected == option
                val backgroundColor by animateColorAsState(
                    if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    animationSpec = spring(stiffness = Spring.StiffnessLow),
                    label = "bg"
                )
                val borderColor by animateColorAsState(
                    when {
                        isSelected -> MaterialTheme.colorScheme.primary
                        hasError -> MaterialTheme.colorScheme.error
                        else -> MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                    },
                    label = "border"
                )
                val textColor by animateColorAsState(
                    if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant,
                    label = "text"
                )
                
                Surface(
                    modifier = Modifier
                        .clip(RoundedCornerShape(AramRadius.SM))
                        .clickable { onOptionSelected(option) },
                    color = backgroundColor,
                    border = BorderStroke(if (isSelected || hasError) 2.dp else 1.dp, borderColor),
                    shape = RoundedCornerShape(AramRadius.SM)
                ) {
                    Text(
                        text = option,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = textColor,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)
                    )
                }
            }
        }
        if (hasError) {
            Text(
                text = errorMessage!!,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier.padding(start = 4.dp, top = 4.dp)
            )
        }
    }
}

@Composable
fun ModernTextField(
    value: String?,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    readOnly: Boolean = false,
    enabled: Boolean = true,
    errorMessage: String? = null,
    trailingIcon: @Composable (() -> Unit)? = null,
    leadingIcon: @Composable (() -> Unit)? = null,
    placeholder: String? = null,
    textAlign: TextAlign = TextAlign.Start,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default,
    maxLength: Int? = null,
    singleLine: Boolean = true
) {
    val safeValue = value ?: ""
    val interactionSource = remember { MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()
    val hasError = !errorMessage.isNullOrBlank()
    
    val borderColor by animateColorAsState(
        targetValue = when {
            hasError -> MaterialTheme.colorScheme.error
            isFocused -> MaterialTheme.colorScheme.primary
            else -> MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
        },
        label = "border"
    )

    Column(modifier = modifier.padding(vertical = 6.dp)) {
        OutlinedTextField(
            value = safeValue,
            onValueChange = { newValue ->
                if (maxLength == null || newValue.length <= maxLength) {
                    onValueChange(newValue)
                }
            },
            label = { Text(label) },
            placeholder = placeholder?.let { { Text(it) } },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(AramRadius.MD),
            readOnly = readOnly,
            enabled = enabled,
            isError = hasError,
            singleLine = singleLine,
            interactionSource = interactionSource,
            textStyle = LocalTextStyle.current.copy(textAlign = textAlign, color = MaterialTheme.colorScheme.onSurface),
            visualTransformation = visualTransformation,
            keyboardOptions = keyboardOptions,
            keyboardActions = keyboardActions,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = if (hasError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = if (hasError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
                focusedLabelColor = if (hasError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                unfocusedLabelColor = if (hasError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
                cursorColor = MaterialTheme.colorScheme.primary,
                focusedContainerColor = MaterialTheme.colorScheme.surface,
                unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                disabledContainerColor = MaterialTheme.colorScheme.surface,
                disabledBorderColor = if (hasError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                disabledTextColor = MaterialTheme.colorScheme.onSurface,
                disabledLabelColor = if (hasError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f),
                disabledTrailingIconColor = MaterialTheme.colorScheme.primary,
                errorBorderColor = MaterialTheme.colorScheme.error,
                errorLabelColor = MaterialTheme.colorScheme.error
            ),
            trailingIcon = trailingIcon,
            leadingIcon = leadingIcon
        )

        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 2.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (hasError) {
                Text(
                    text = errorMessage ?: "",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.labelSmall,
                    modifier = Modifier.weight(1f)
                )
            } else {
                Spacer(modifier = Modifier.weight(1f))
            }

            if (maxLength != null) {
                val currentLength = safeValue.length
                val isNearLimit = currentLength >= (maxLength * 0.9)
                Text(
                    text = "$currentLength / $maxLength",
                    style = MaterialTheme.typography.labelSmall,
                    color = if (isNearLimit) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                )
            }
        }
    }
}

@Composable
fun ModernPasswordField(
    value: String?,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    errorMessage: String? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default
) {
    var isPasswordVisible by remember { mutableStateOf(false) }
    ModernTextField(
        value = value,
        onValueChange = onValueChange,
        label = label,
        modifier = modifier,
        errorMessage = errorMessage,
        keyboardOptions = keyboardOptions,
        keyboardActions = keyboardActions,
        visualTransformation = if (isPasswordVisible) VisualTransformation.None else androidx.compose.ui.text.input.PasswordVisualTransformation(),
        trailingIcon = {
            IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                Icon(
                    imageVector = if (isPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                    contentDescription = if (isPasswordVisible) "Hide password" else "Show password",
                    tint = if (!errorMessage.isNullOrBlank()) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    )
}

@Composable
fun DatePickerField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    errorMessage: String? = null
) {
    val context = LocalContext.current
    val calendar = Calendar.getInstance()

    val displayValue = remember(value) {
        com.aram.ftc.util.ValidationUtils.formatCleanDob(value)
    }

    val maxDateCalendar = Calendar.getInstance().apply {
        add(Calendar.YEAR, -18) // Candidate must be at least 18 years old
    }

    val datePickerDialog = DatePickerDialog(
        context,
        { _, year, month, dayOfMonth ->
            val formattedDate = String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, dayOfMonth)
            onValueChange(formattedDate)
        },
        maxDateCalendar.get(Calendar.YEAR),
        maxDateCalendar.get(Calendar.MONTH),
        maxDateCalendar.get(Calendar.DAY_OF_MONTH)
    ).apply {
        datePicker.maxDate = maxDateCalendar.timeInMillis
    }

    ModernTextField(
        value = displayValue,
        onValueChange = { },
        label = label,
        readOnly = true,
        enabled = false,
        errorMessage = errorMessage,
        modifier = Modifier.clickable { datePickerDialog.show() },
        trailingIcon = {
            IconButton(onClick = { datePickerDialog.show() }) {
                Icon(Icons.Default.CalendarToday, contentDescription = null, tint = if (!errorMessage.isNullOrBlank()) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary)
            }
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchableDropdownField(
    label: String,
    options: List<String>,
    selectedOption: String?,
    onOptionSelected: (String) -> Unit,
    errorMessage: String? = null
) {
    val safeSelected = selectedOption ?: ""
    var showSheet by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    val filteredOptions = remember(searchQuery) {
        options.filter { it.contains(searchQuery, ignoreCase = true) }
    }

    ModernTextField(
        value = safeSelected,
        onValueChange = { },
        label = label,
        readOnly = true,
        enabled = false,
        errorMessage = errorMessage,
        modifier = Modifier.clickable { showSheet = true },
        trailingIcon = {
            Icon(Icons.Default.KeyboardArrowDown, contentDescription = null, tint = if (!errorMessage.isNullOrBlank()) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary)
        }
    )

    if (showSheet) {
        ModalBottomSheet(
            onDismissRequest = { showSheet = false; searchQuery = "" },
            containerColor = MaterialTheme.colorScheme.surface,
            dragHandle = { BottomSheetDefaults.DragHandle() }
        ) {
            Column(modifier = Modifier.fillMaxWidth().padding(16.dp).fillMaxHeight(0.8f)) {
                Text(
                    text = "Select $label", 
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(bottom = 20.dp)
                )
                
                ModernTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    label = "Search",
                    placeholder = "Type to filter...",
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) { Icon(Icons.Default.Close, contentDescription = null) }
                        }
                    }
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                LazyColumn(modifier = Modifier.weight(1f)) {
                    items(filteredOptions) { option ->
                        val isSelected = option == selectedOption
                        ListItem(
                            headlineContent = { 
                                Text(
                                    text = option, 
                                    style = if (isSelected) MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold) else MaterialTheme.typography.bodyLarge
                                ) 
                            },
                            trailingContent = {
                                if (isSelected) Icon(Icons.Default.Check, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            },
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .clickable {
                                    onOptionSelected(option)
                                    showSheet = false
                                    searchQuery = ""
                                },
                            colors = ListItemDefaults.colors(
                                containerColor = if (isSelected) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f) else Color.Transparent
                            )
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun SearchableMultiSelectField(
    label: String,
    options: List<String>,
    selectedOptions: List<String>,
    onToggleOption: (String) -> Unit,
    errorMessage: String? = null
) {
    var showSheet by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    val hasError = !errorMessage.isNullOrBlank()
    val filteredOptions = remember(searchQuery) {
        options.filter { it.contains(searchQuery, ignoreCase = true) }
    }

    Column(modifier = Modifier.padding(vertical = 12.dp)) {
        Text(
            text = label, 
            style = MaterialTheme.typography.labelLarge, 
            color = if (hasError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(start = 4.dp, bottom = 8.dp)
        )
        
        Surface(
            onClick = { showSheet = true },
            modifier = Modifier.fillMaxWidth().wrapContentHeight().defaultMinSize(minHeight = 56.dp),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(
                if (hasError) 2.dp else 1.dp,
                if (hasError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
            )
        ) {
            Box(modifier = Modifier.padding(12.dp).fillMaxWidth()) {
                if (selectedOptions.isEmpty()) {
                    Text(
                        "Select options...", 
                        color = if (hasError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                    )
                } else {
                    androidx.compose.foundation.layout.FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        selectedOptions.forEach { option ->
                            InputChip(
                                selected = true,
                                onClick = { onToggleOption(option) },
                                label = { Text(option) },
                                trailingIcon = { Icon(Icons.Default.Close, contentDescription = null, modifier = Modifier.size(16.dp)) },
                                shape = RoundedCornerShape(12.dp),
                                colors = InputChipDefaults.inputChipColors(
                                    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                    selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer,
                                    selectedTrailingIconColor = MaterialTheme.colorScheme.primary
                                )
                            )
                        }
                    }
                }
            }
        }
        if (hasError) {
            Text(
                text = errorMessage!!,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier.padding(start = 4.dp, top = 4.dp)
            )
        }
    }

    if (showSheet) {
        ModalBottomSheet(
            onDismissRequest = { showSheet = false; searchQuery = "" },
            containerColor = MaterialTheme.colorScheme.surface
        ) {
            Column(modifier = Modifier.fillMaxWidth().padding(16.dp).fillMaxHeight(0.8f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Select $label",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.weight(1f).padding(end = 8.dp)
                    )
                    Button(
                        onClick = { showSheet = false },
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text("Done", maxLines = 1, fontWeight = FontWeight.Bold)
                    }
                }
                
                Spacer(modifier = Modifier.height(20.dp))

                ModernTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    label = "Search",
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) }
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                LazyColumn(modifier = Modifier.weight(1f)) {
                    items(filteredOptions) { option ->
                        val isSelected = selectedOptions.contains(option)
                        ListItem(
                            headlineContent = { 
                                Text(
                                    text = option,
                                    style = if (isSelected) MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold) else MaterialTheme.typography.bodyLarge
                                ) 
                            },
                            trailingContent = { 
                                Checkbox(
                                    checked = isSelected, 
                                    onCheckedChange = { onToggleOption(option) },
                                    colors = CheckboxDefaults.colors(checkedColor = MaterialTheme.colorScheme.primary)
                                ) 
                            },
                            modifier = Modifier.clip(RoundedCornerShape(12.dp)).clickable { onToggleOption(option) }
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SalaryRangeSlider(
    value: String,
    onValueChange: (String) -> Unit
) {
    val steps = AppConstants.SALARY_STEPS
    
    val currentIndices = remember(value) {
        val numbers = Regex("\\d+").findAll(value.replace(",", "")).map { it.value.toInt() }.toList()
        if (numbers.size >= 2) {
            val minIdx = steps.indexOfFirst { it >= numbers[0] }.coerceAtLeast(0)
            val maxIdx = steps.indexOfFirst { it >= numbers[1] }.coerceAtLeast(0)
            minIdx.toFloat()..maxIdx.toFloat()
        } else {
            2f..4f // Default 15k - 20k
        }
    }

    var sliderPosition by remember(currentIndices) { mutableStateOf(currentIndices) }

    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text(text = "Salary Expectation", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Surface(
                color = MaterialTheme.colorScheme.primaryContainer,
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "₹${steps[sliderPosition.start.toInt()].toLocaleString()} - ₹${steps[sliderPosition.endInclusive.toInt()].toLocaleString()}",
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }
        
        Spacer(modifier = Modifier.height(14.dp))

        // Quick Preset Chips
        Text(text = "Quick Presets:", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(modifier = Modifier.height(6.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            val presets = listOf(
                "₹15,000 - ₹20,000" to (2f..4f),
                "₹20,000 - ₹30,000" to (4f..8f),
                "₹30,000 - ₹50,000" to (8f..13f),
                "₹50,000 - ₹1,00,000" to (13f..18f),
                "₹1,00,000 - ₹5,00,000" to (18f..34f)
            )
            items(presets) { (label, range) ->
                val isSelected = (sliderPosition.start == range.start && sliderPosition.endInclusive == range.endInclusive) || (value == label)
                FilterChip(
                    selected = isSelected,
                    onClick = {
                        sliderPosition = range
                        val minVal = steps[range.start.toInt()]
                        val maxVal = steps[range.endInclusive.toInt()]
                        onValueChange("₹${minVal.toLocaleString()} - ₹${maxVal.toLocaleString()}")
                    },
                    label = { Text(label, style = MaterialTheme.typography.labelSmall, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.primary,
                        selectedLabelColor = Color.White,
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        labelColor = MaterialTheme.colorScheme.onSurface
                    ),
                    shape = RoundedCornerShape(12.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        
        RangeSlider(
            value = sliderPosition,
            onValueChange = { sliderPosition = it },
            valueRange = 0f..(steps.size - 1).toFloat(),
            onValueChangeFinished = {
                val minVal = steps[sliderPosition.start.toInt()]
                val maxVal = steps[sliderPosition.endInclusive.toInt()]
                onValueChange("₹${minVal.toLocaleString()} - ₹${maxVal.toLocaleString()}")
            },
            startThumb = {
                Surface(
                    modifier = Modifier.size(24.dp),
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.primary,
                    border = BorderStroke(2.dp, Color.White),
                    shadowElevation = 4.dp
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Box(modifier = Modifier.size(8.dp).background(Color.White, CircleShape))
                    }
                }
            },
            endThumb = {
                Surface(
                    modifier = Modifier.size(24.dp),
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.primary,
                    border = BorderStroke(2.dp, Color.White),
                    shadowElevation = 4.dp
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Box(modifier = Modifier.size(8.dp).background(Color.White, CircleShape))
                    }
                }
            },
            colors = SliderDefaults.colors(
                thumbColor = MaterialTheme.colorScheme.primary,
                activeTrackColor = MaterialTheme.colorScheme.primary,
                inactiveTrackColor = MaterialTheme.colorScheme.outlineVariant
            )
        )
        
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = "Min: ₹10,000", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(text = "Max: ₹5,00,000", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
fun ReviewSection(title: String, icon: ImageVector, content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(20.dp)
    ) {
        Column(Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.size(36.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                    }
                }
                Spacer(Modifier.width(12.dp))
                Text(text = title, style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary)
            }
            HorizontalDivider(Modifier.padding(vertical = 16.dp), color = MaterialTheme.colorScheme.outlineVariant)
            content()
        }
    }
}

@Composable
fun ReviewRow(label: String, value: String?) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(
            text = value ?: "—", 
            style = MaterialTheme.typography.bodyLarge, 
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.End,
            modifier = Modifier.weight(1f).padding(start = 16.dp)
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ReviewChips(label: String, tags: List<String>) {
    if (tags.isEmpty()) return
    Column(Modifier.padding(vertical = 8.dp)) {
        Text(text = label, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(8.dp))
        androidx.compose.foundation.layout.FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            tags.forEach { tag ->
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        tag, 
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp), 
                        style = MaterialTheme.typography.bodyMedium, 
                        fontWeight = FontWeight.Bold, 
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        }
    }
}

fun Int.toLocaleString(): String {
    return java.text.NumberFormat.getNumberInstance(Locale("en", "IN")).format(this)
}
