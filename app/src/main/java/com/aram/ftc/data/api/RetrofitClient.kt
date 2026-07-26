package com.aram.ftc.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import android.content.Context

/**
 * Centralized Retrofit client configuration.
 */
object RetrofitClient {
    private const val BASE_URL = "http://localhost:5000/api/"
    
    private var appContext: Context? = null

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    private val okHttpClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        OkHttpClient.Builder()
            .addInterceptor(logging)
            .apply {
                appContext?.let {
                    addInterceptor(ConnectivityInterceptor(it))
                }
            }
            .addInterceptor { chain ->
                val request = chain.request()
                val response = chain.proceed(request)
                
                if (response.code == 401) {
                    throw SessionExpiredException()
                }
                response
            }
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    val instance: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val service: AramApiService by lazy {
        instance.create(AramApiService::class.java)
    }
}
