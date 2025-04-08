// 보안 설정
const Security = {
    // 세션 관리
    session: null,
    
    // 권한 정의
    roles: {
        admin: ['view', 'edit', 'delete', 'manage_users', 'manage_settings'],
        manager: ['view', 'edit', 'manage_users'],
        operator: ['view', 'edit']
    },
    
    // IP 화이트리스트
    ipWhitelist: ['127.0.0.1', 'localhost'],
    
    // 로그인 시도 제한
    loginAttempts: {},
    
    // 보안 설정
    config: {
        maxLoginAttempts: 5,
        sessionTimeout: 30 * 60 * 1000, // 30분
        minPasswordLength: 8,
        requireSpecialChar: true
    }
};

// 권한 체크 함수
function checkPermission(permission) {
    if (!Security.session || !Security.session.user) {
        return false;
    }
    
    const userRole = Security.session.user.role;
    return Security.roles[userRole]?.includes(permission) || false;
}

// 로그인 함수
function login(username, password) {
    console.log('로그인 시도:', username); // 디버깅용
    
    const db = JSON.parse(localStorage.getItem('avatarBaccaratDB'));
    console.log('데이터베이스:', db); // 디버깅용
    
    if (!db || !db.users) {
        showMessage('데이터베이스 초기화가 필요합니다.', 'error');
        return false;
    }
    
    const user = db.users.find(u => u.username === username && u.password === password);
    console.log('찾은 사용자:', user); // 디버깅용
    
    if (user) {
        // 로그인 성공
        Security.session = {
            token: generateToken(),
            expires: Date.now() + Security.config.sessionTimeout,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        };
        
        // 세션 저장
        localStorage.setItem('session', JSON.stringify(Security.session));
        
        // 로그인 모달 숨기기
        document.getElementById('loginModal').style.display = 'none';
        
        // 메인 컨텐츠 표시
        document.querySelector('main').style.display = 'block';
        
        // 로그 기록
        logActivity('login', `사용자 ${username} 로그인`);
        
        // 모니터링 시작
        if (typeof startMonitoring === 'function') {
            startMonitoring();
        }
        
        // 통계 초기화
        if (typeof initStatistics === 'function') {
            initStatistics();
        }
        
        return true;
    }
    
    // 로그인 실패
    showMessage('로그인 실패: 사용자명 또는 비밀번호가 올바르지 않습니다.', 'error');
    return false;
}

// 로그인 폼 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드됨'); // 디버깅용
    
    const loginForm = document.getElementById('loginForm');
    console.log('로그인 폼:', loginForm); // 디버깅용
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('폼 제출됨'); // 디버깅용
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            console.log('입력된 값:', { username, password }); // 디버깅용
            
            login(username, password);
        });
    } else {
        console.error('로그인 폼을 찾을 수 없습니다.'); // 디버깅용
    }
    
    // 데이터베이스 초기화
    initDB();
    
    // 세션 확인
    const savedSession = localStorage.getItem('session');
    if (savedSession) {
        Security.session = JSON.parse(savedSession);
        if (Security.session.expires > Date.now()) {
            // 유효한 세션이 있으면 메인 컨텐츠 표시
            document.getElementById('loginModal').style.display = 'none';
            document.querySelector('main').style.display = 'block';
            if (typeof startMonitoring === 'function') {
                startMonitoring();
            }
            if (typeof initStatistics === 'function') {
                initStatistics();
            }
        } else {
            // 세션 만료
            logout();
        }
    } else {
        // 로그인 모달 표시
        document.getElementById('loginModal').style.display = 'flex';
        document.querySelector('main').style.display = 'none';
    }
});

// 로그아웃 함수
function logout() {
    if (Security.session.user) {
        logActivity('logout', `사용자 ${Security.session.user.username} 로그아웃`, Security.session.user.id);
    }
    Security.session = null;
    localStorage.removeItem('session');
}

// 토큰 생성 함수
function generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 세션 유효성 체크
function checkSession() {
    if (!Security.session || !Security.session.token || !Security.session.expires) {
        return false;
    }
    
    if (new Date() > Security.session.expires) {
        logout();
        return false;
    }
    
    return true;
}

// 비밀번호 유효성 검사
function validatePassword(password) {
    if (password.length < Security.config.minPasswordLength) {
        return false;
    }
    
    if (Security.config.requireSpecialChar) {
        const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialChars.test(password)) {
            return false;
        }
    }
    
    return true;
}

// IP 체크
function checkIP(ip) {
    return Security.ipWhitelist.includes(ip);
}

// 보안 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    // 세션 체크
    setInterval(checkSession, 60000); // 1분마다 체크
    
    // 페이지 새로고침 시 세션 복원
    if (localStorage.getItem('session')) {
        Security.session = JSON.parse(localStorage.getItem('session'));
    }
    
    // 페이지 종료 시 세션 저장
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('session', JSON.stringify(Security.session));
    });
}); 