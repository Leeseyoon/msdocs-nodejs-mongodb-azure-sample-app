const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const Chat = require('../models/chat'); // Message 모델 경로

// MySQL 연결 설정
const mysqlConfig = {
    host: 'localhost',
    user: 'root',
    password: 'dbsec123!',
    database: 'chatbot_db'
};
// MongoDB 연결 설정
const mongoUri = "mongodb://localhost:27017/app";

async function migrateChats() {
    try {
        // MySQL 연결
        const mysqlConnection = await mysql.createConnection(mysqlConfig);
        console.log('Connected to MySQL');

        // MongoDB 연결
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // MySQL에서 모든 채팅 데이터 추출
        const [rows] = await mysqlConnection.query('SELECT * FROM chats');

        // MongoDB에 데이터 삽입
        for (const row of rows) {
            await Chat.updateOne(
                { id: row.id }, // 조건
                { $set: {
                    username: row.username,
                    title: row.title,
                    created_at: row.created_at,
                    flag: row.flag
                }},
                { upsert: true } // 없으면 새로 생성
            );
        }

        console.log('Chats migrated successfully');
    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        // 연결 종료
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// 실행
migrateChats();