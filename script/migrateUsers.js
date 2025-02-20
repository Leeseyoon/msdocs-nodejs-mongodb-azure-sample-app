const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const User = require('../models/user'); // User 모델 경로

// MySQL 연결 설정
const mysqlConfig = {
    host: 'localhost',
    user: 'root',
    password: 'dbsec123!',
    database: 'chatbot_db'
};

// MongoDB 연결 설정
const mongoUri = "mongodb://localhost:27017/app";
async function migrateUsers() {
    try {
        // MySQL 연결
        const mysqlConnection = await mysql.createConnection(mysqlConfig);
        console.log('Connected to MySQL');

        // MongoDB 연결
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // MySQL에서 사용자 데이터 추출
        const [rows] = await mysqlConnection.query('SELECT * FROM users');

        // MongoDB에 데이터 삽입
        for (const row of rows) {
            await User.updateOne(
                { username: row.username }, // 조건
                { $set: {
                    password: row.password,
                    failed_login_attempts: row.failed_login_attempts,
                    locked_until: row.locked_until,
                    locked: row.locked,
                    otp: row.otp,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    otp_expiry: row.otp_expiry,
                    auth: row.auth,
                    authorized: row.authorized
                }},
                { upsert: true } // 없으면 새로 생성
            );
        }

        console.log('Users migrated successfully');
    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        // 연결 종료
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// 실행
migrateUsers();