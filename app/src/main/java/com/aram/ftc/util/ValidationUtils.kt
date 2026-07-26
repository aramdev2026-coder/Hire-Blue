package com.aram.ftc.util

import android.util.Patterns
import java.util.*

object ValidationUtils {

    fun isValidFullName(name: String): Boolean {
        val trimmed = name.trim()
        if (trimmed.length < 2) return false
        return trimmed.matches(Regex("^[a-zA-Z\\s]+$"))
    }

    fun isValidIndianPhone(phone: String): Boolean {
        val clean = phone.trim()
        return clean.length == 10 && clean.matches(Regex("^[6-9]\\d{9}$"))
    }

    fun isValidEmail(email: String): Boolean {
        val emailTrimmed = email.trim().lowercase()
        if (emailTrimmed.isBlank()) return false
        if (!Patterns.EMAIL_ADDRESS.matcher(emailTrimmed).matches()) return false

        val localPart = emailTrimmed.substringBefore("@")
        val domain = emailTrimmed.substringAfter("@")

        val typos = listOf("gamil.com", "yaho.com", "hotmal.com", "outlok.com", "gmaill.com")
        if (typos.contains(domain)) return false

        if (localPart.length > 5 && !localPart.any { it in "aeiou" }) return false

        for (i in 0..localPart.length - 5) {
            val sub = localPart.substring(i, i + 5)
            if (sub.all { it == sub[0] }) return false
        }

        return true
    }

    fun isAtLeast18(dob: String): Boolean {
        if (dob.isBlank()) return false
        val datePart = if (dob.contains("T")) dob.substringBefore("T") else dob
        val parts = datePart.split("-")
        if (parts.size != 3) return false
        val year = parts[0].toIntOrNull() ?: return false
        val month = parts[1].toIntOrNull() ?: return false
        val day = parts[2].toIntOrNull() ?: return false

        if (year < 1900) return false

        val today = Calendar.getInstance()
        val birth = Calendar.getInstance().apply { set(year, month - 1, day) }
        
        if (birth.after(today)) return false

        var age = today.get(Calendar.YEAR) - birth.get(Calendar.YEAR)
        if (today.get(Calendar.DAY_OF_YEAR) < birth.get(Calendar.DAY_OF_YEAR)) {
            age--
        }
        return age >= 18
    }

    fun formatCleanDob(dob: String?): String {
        if (dob.isNullOrBlank()) return "—"
        val datePart = if (dob.contains("T")) dob.substringBefore("T") else dob.trim()
        val parts = datePart.split("-")
        if (parts.size == 3 && parts[0].length == 4) {
            val year = parts[0]
            val month = parts[1].toIntOrNull() ?: 1
            val day = parts[2].toIntOrNull() ?: 1
            val monthNames = arrayOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
            val monthStr = if (month in 1..12) monthNames[month - 1] else parts[1]
            return "$day $monthStr $year"
        }
        return datePart
    }

    fun isValidOtp(otp: String): Boolean {
        val clean = otp.trim()
        return clean.length == 6 && clean.all { it.isDigit() }
    }

    fun isValidPincode(pincode: String): Boolean {
        val clean = pincode.trim()
        return clean.length == 6 && clean.all { it.isDigit() }
    }

    fun isValidSalaryRange(minSalary: Int, maxSalary: Int): Boolean {
        return minSalary <= maxSalary
    }

    fun sanitizeSalaryRange(minSalary: Int, maxSalary: Int): Pair<Int, Int> {
        return if (minSalary > maxSalary) {
            Pair(maxSalary, minSalary)
        } else {
            Pair(minSalary, maxSalary)
        }
    }
}
