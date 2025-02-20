const config = {
    development: {
        apiUrl: 'http://localhost:5001'
    },
    production: {
        apiUrl: 'https://your-production-domain.com'
    }
};

const environment = window.location.hostname === 'localhost' ? 'development' : 'production';
const BASE_URL = config[environment].apiUrl;

export { BASE_URL };