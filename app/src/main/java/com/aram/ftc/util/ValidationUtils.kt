package com.aram.ftc.util

import android.util.Patterns
import java.util.*

object ValidationUtils {

    fun isValidEmail(email: String): Boolean {
        val emailTrimmed = email.trim().lowercase()
        if (emailTrimmed.isBlank()) return false
        if (!Patterns.EMAIL_ADDRESS.matcher(emailTrimmed).matches()) return false

        val localPart = emailTrimmed.substringBefore("@")
        val domain = emailTrimmed.substringAfter("@")

        // Reject common domain typos
        val typos = listOf("gamil.com", "yaho.com", "hotmal.com", "outlok.com", "gmaill.com")
        if (typos.contains(domain)) return false

        // Local part rules: if > 5 chars, must contain a vowel
        if (localPart.length > 5 && !localPart.any { it in "aeiou" }) return false

        // Reject 5+ repeated characters (e.g. aaaaa@)
        for (i in 0..localPart.length - 5) {
            val sub = localPart.substring(i, i + 5)
            if (sub.all { it == sub[0] }) return false
        }

        return true
    }

    fun isValidPhone(phone: String): Boolean {
        return phone.length == 10 && phone.matches(Regex("^[6-9]\\d{9}$"))
    }

    fun isAtLeast18(dob: String): Boolean {
        // Handle ISO strings like 2002-06-04T00:00:00.000Z
        val datePart = if (dob.contains("T")) dob.substringBefore("T") else dob
        val parts = datePart.split("-")
        if (parts.size != 3) return false
        val year = parts[0].toIntOrNull() ?: return false
        val month = parts[1].toIntOrNull() ?: return false
        val day = parts[2].toIntOrNull() ?: return false

        if (year < 1900) return false

        val today = Calendar.getInstance()
        val birth = Calendar.getInstance().apply { set(year, month - 1, day) }
        
        var age = today.get(Calendar.YEAR) - birth.get(Calendar.YEAR)
        if (today.get(Calendar.DAY_OF_YEAR) < birth.get(Calendar.DAY_OF_YEAR)) {
            age--
        }
        return age >= 18
    }

    fun isNotBlank(value: String): Boolean {
        return value.isNotBlank()
    }
}
