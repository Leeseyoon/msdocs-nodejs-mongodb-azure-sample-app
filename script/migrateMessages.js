const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const Message = require('../models/message'); // Message 모델 경로

// MySQL 연결 설정
const mysqlConfig = {
    host: 'localhost',
    user: 'root',
    password: 'dbsec123!',
    database: 'chatbot_db'
};

// MongoDB 연결 설정
const mongoUri = "mongodb://localhost:27017/app";

async function migrateMessages() {
    try {
        // MySQL 연결
        const mysqlConnection = await mysql.createConnection(mysqlConfig);
        console.log('Connected to MySQL');

        // MongoDB 연결
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // MySQL에서 모든 메시지 데이터 추출
        const [rows] = await mysqlConnection.query('SELECT * FROM messages');

        // MongoDB에 데이터 삽입
        for (const row of rows) {
            await Message.updateOne(
                { id: row.id }, // 조건
                { $set: {
                    chat_id: row.chat_id,
                    sender: row.sender,
                    text: row.text,
                    timestamp: row.timestamp,
                    flag: row.flag
                }},
                { upsert: true } // 없으면 새로 생성
            );
        }

        console.log('Messages migrated successfully');
    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        // 연결 종료
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// 실행
migrateMessages();