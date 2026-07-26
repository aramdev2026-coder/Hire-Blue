package com.aram.ftc.ui.theme

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel

class ThemeViewModel : ViewModel() {
    // We use a nullable boolean to detect if the user has manually toggled.
    // null = use system default, true = dark, false = light.
    private val _isDarkMode = mutableStateOf<Boolean?>(null) 
    val isDarkMode: State<Boolean?> = _isDarkMode

    fun toggleTheme(systemDark: Boolean) {
        val current = _isDarkMode.value ?: systemDark
        _isDarkMode.value = !current
    }
}
