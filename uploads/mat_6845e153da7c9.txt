package com.example.nummo.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.nummo.model.PaymentRequest
import com.example.nummo.data.PaymentRequestDao
import com.example.nummo.model.Transaction
import com.example.nummo.data.TransactionDao
import com.example.nummo.data.UserDao
import com.example.nummo.model.User

@Database(
    entities = [User::class, Transaction::class, PaymentRequest::class],
    version = 3
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun transactionDao(): TransactionDao
    abstract fun paymentRequestDao(): PaymentRequestDao
}