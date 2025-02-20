import { BASE_URL } from './config.js';

// 폼 제출 처리
async function handleSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 데이터 암호화
    const encryptedUsername = encrypt(username);
    const encryptedPassword = encrypt(password);

    try {
        const response = await fetch(`http://localhost:5001/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: encryptedUsername,
                password: encryptedPassword
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.requireOtp) {
                openModal('otpModal');
                startOtpTimer();
            } else {
                window.location.href = '/chatbot';
            }
        } else {
            const error = await response.json();
            document.getElementById('errorMessage').textContent = error.message;
            openModal('errorModal');
        }
    } catch (error) {
        console.error('로그인 처리 중 오류:', error);
    }
}

// 모달 관련 함수들
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// OTP 타이머 관련 함수들
let timeLeft = 180; // 3분
let timer;

function startOtpTimer() {
    clearInterval(timer);
    timeLeft = 180;
    timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timeLeft').textContent =
            `유효 시간: ${minutes}분 ${seconds}초 ${timeLeft <= 0 ? '(유효시간이 만료되었습니다. 재요청 버튼을 눌러주세요)' : ''}`;

        if (timeLeft <= 0) {
            document.getElementById('submitButton').style.display = 'none';
            document.getElementById('resendButton').style.display = 'inline-block';
            document.getElementById('otpInput').disabled = true;
            clearInterval(timer);
        }
    }, 1000);
}

// ai-foundry 버튼 클릭 처리
function handleTestClick() {
    // ai-foundry 관련 로직 구현
    console.log('ai-foundry button clicked');
}

// 권한 요청 처리
async function handleAuthorize() {
    try {
        const response = await fetch(`${BASE_URL}/request-authorization`, {
            method: 'POST'
        });
        if (response.ok) {
            closeModal('firstLoginModal');
        }
    } catch (error) {
        console.error('권한 요청 중 오류:', error);
    }
}

// OTP 제출 처리
async function handleOtpSubmit() {
    const otp = document.getElementById('otpInput').value;
    try {
        const response = await fetch(`${BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otp })
        });

        if (response.ok) {
            window.location.href = '/chatbot';
        } else {
            const error = await response.json();
            document.getElementById('errorMessage').textContent = error.message;
            openModal('errorModal');
        }
    } catch (error) {
        console.error('OTP 검증 중 오류:', error);
    }
}

// OTP 재요청 처리
async function handleResendOtp() {
    try {
        const response = await fetch(`${BASE_URL}/resend-otp`, {
            method: 'POST'
        });

        if (response.ok) {
            startOtpTimer();
            document.getElementById('submitButton').style.display = 'inline-block';
            document.getElementById('resendButton').style.display = 'none';
            document.getElementById('otpInput').disabled = false;
            document.getElementById('otpInput').value = '';
        }
    } catch (error) {
        console.error('OTP 재요청 중 오류:', error);
    }
}