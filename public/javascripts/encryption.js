// 암호화 관련 설정과 함수들
const key = CryptoJS.enc.Hex.parse('12345678901234567890123456789012');
const iv = CryptoJS.enc.Hex.parse('1234567890123456');

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}