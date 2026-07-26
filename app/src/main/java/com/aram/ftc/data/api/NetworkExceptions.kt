package com.aram.ftc.data.api

import java.io.IOException

class NoConnectivityException : IOException("No internet connection")

class SessionExpiredException : IOException("Session expired. Please log in again.")
