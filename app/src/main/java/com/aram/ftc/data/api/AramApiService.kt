package com.aram.ftc.data.api

import com.aram.ftc.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface AramApiService {

    // ==========================================
    // 1. CANDIDATE AUTH & WIZARD API
    // ==========================================

    @POST("auth/send-otp")
    suspend fun sendOtp(
        @Body request: OtpRequest
    ): Response<OtpResponse>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(
        @Body request: OtpVerifyRequest
    ): Response<OtpVerifyResponse>

    @POST("auth/resend-otp")
    suspend fun resendOtp(
        @Body request: OtpRequest
    ): Response<OtpResponse>

    @POST("candidate/save-wizard-step")
    suspend fun saveWizardStep(
        @Header("Authorization") token: String,
        @Body request: SaveWizardRequest
    ): Response<OtpResponse>

    @POST("candidate/finalize")
    suspend fun finalizeWizard(
        @Header("Authorization") token: String,
        @Body request: FinalizeWizardRequest
    ): Response<FinalizeResponse>

    @GET("candidate/profile/{candidateId}")
    suspend fun getCandidateProfile(
        @Header("Authorization") token: String,
        @Path("candidateId") candidateId: Int
    ): Response<CandidateProfileResponse>

    // ==========================================
    // 2. EMPLOYER PORTAL API
    // ==========================================

    @POST("employer/signup")
    suspend fun signupEmployer(
        @Body request: EmployerSignupRequest
    ): Response<OtpResponse>

    @POST("employer/login")
    suspend fun loginEmployer(
        @Body request: EmployerLoginRequest
    ): Response<EmployerLoginResponse>

    @POST("employer/jobs")
    suspend fun postJobs(
        @Header("Authorization") token: String,
        @Body request: JobPostRequest
    ): Response<OtpResponse>

    @GET("employer/orders/{employerId}")
    suspend fun getEmployerJobsWithMatches(
        @Header("Authorization") token: String,
        @Path("employerId") employerId: String
    ): Response<JobsResponse>

    @GET("employer/profile")
    suspend fun getEmployerProfile(
        @Header("Authorization") token: String
    ): Response<EmployerProfileResponse>

    @PUT("employer/profile")
    suspend fun updateEmployerProfile(
        @Header("Authorization") token: String,
        @Body request: UpdateEmployerProfileRequest
    ): Response<OtpResponse>

    @DELETE("employer/orders/{orderId}")
    suspend fun deleteJob(
        @Header("Authorization") token: String,
        @Path("orderId") orderId: String
    ): Response<OtpResponse>
}
