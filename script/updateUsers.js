const mongoose = require('mongoose');
const User = require('../models/user'); // User 모델 경로

// MongoDB 연결
const mongoUri = "mongodb://localhost:27017/app";

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB');

        // 업데이트할 사용자 데이터
        const usersData = [
            {
                username: 'admin',
                password: '1234',
                failed_login_attempts: 0,
                locked_until: null,
                locked: false,
                otp: null,
                created_at: new Date('2025-01-16 15:02:01'),
                updated_at: new Date('2025-02-06 10:47:38'),
                otp_expiry: null,
                auth: 1,
                authorized: 0
            },
            {
                username: 'asdf',
                password: '1234',
                failed_login_attempts: 0,
                locked_until: null,
                locked: false,
                otp: '715965',
                created_at: new Date('2025-01-16 09:21:18'),
                updated_at: new Date('2025-02-20 14:04:37'),
                otp_expiry: new Date('2025-02-20 14:07:37'),
                auth: 2,
                authorized: 0
            },
            {
                username: 'ㅁㄴㅇㄹ',
                password: '1234',
                failed_login_attempts: 0,
                locked_until: null,
                locked: false,
                otp: '790875',
                created_at: new Date('2025-01-16 09:21:19'),
                updated_at: new Date('2025-02-20 13:58:16'),
                otp_expiry: new Date('2025-02-20 14:01:16'),
                auth: 2,
                authorized: 0
            }
        ];

        // 사용자 데이터 업데이트
        for (const userData of usersData) {
            await User.updateOne(
                { username: userData.username }, // 조건
                { $set: userData }, // 업데이트할 데이터
                { upsert: true } // 없으면 새로 생성
            );
        }

        console.log('Users updated successfully');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    })
    .finally(() => {
        mongoose.connection.close(); // 연결 종료
    });