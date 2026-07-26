package com.aram.ftc.data.network

import com.aram.ftc.data.api.NoConnectivityException

sealed class ApiError(val message: String) {
    object BadRequest : ApiError("Something went wrong with your request.")
    object Unauthorized : ApiError("Session expired. Please sign in again.")
    object NotFound : ApiError("Email not registered with ARAM.")
    object Conflict : ApiError("This account already exists.")
    object TooManyRequests : ApiError("Too many attempts. Wait a moment and try again.")
    object ServerError : ApiError("Server is busy. Try again in a moment.")
    object NoConnection : ApiError("Check your internet connection and try again.")
    data class Unknown(val customMessage: String) : ApiError(customMessage)

    companion object {
        fun fromCode(code: Int, defaultMsg: String? = null): ApiError {
            return when (code) {
                400 -> BadRequest
                401 -> Unauthorized
                404 -> NotFound
                409 -> Conflict
                429 -> TooManyRequests
                in 500..599 -> ServerError
                else -> Unknown(defaultMsg ?: "An unexpected error occurred.")
            }
        }

        fun fromThrowable(throwable: Throwable): ApiError {
            return when (throwable) {
                is NoConnectivityException -> NoConnection
                else -> Unknown(throwable.message ?: "An unexpected error occurred.")
            }
        }
    }
}
