// 데이터베이스 구조
const Database = {
    tables: {
        tableHistory: [],
        users: [],
        bettingLimitsHistory: [],
        gameResults: [],
        systemLogs: [],
        anomalyDetections: [],
        statistics: {
            daily: {},
            weekly: {},
            monthly: {}
        }
    }
};

// 초기 데이터
const initialData = {
    users: [
        {
            id: 1,
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            status: 'active',
            lastLogin: null
        }
    ],
    tableHistory: [],
    bettingLimitsHistory: [],
    gameResults: [],
    systemLogs: [],
    anomalyDetections: [],
    statistics: {
        daily: {},
        weekly: {},
        monthly: {}
    }
};

// 데이터베이스 초기화
function initDB() {
    console.log('데이터베이스 초기화 시작');
    
    try {
        // 로컬 스토리지에서 데이터베이스 가져오기
        let db = localStorage.getItem('avatarBaccaratDB');
        
        if (!db) {
            console.log('새로운 데이터베이스 생성');
            // 데이터베이스가 없으면 초기 데이터로 생성
            db = JSON.stringify(initialData);
            try {
                localStorage.setItem('avatarBaccaratDB', db);
            } catch (e) {
                console.error('로컬 스토리지 저장 실패:', e);
                // 로컬 스토리지 저장 실패 시 메모리에 저장
                window.tempDB = initialData;
            }
        } else {
            console.log('기존 데이터베이스 사용');
            try {
                const parsedDB = JSON.parse(db);
                if (!parsedDB.users || !parsedDB.users.length) {
                    console.log('사용자 데이터가 없어 초기화');
                    parsedDB.users = initialData.users;
                    db = JSON.stringify(parsedDB);
                    try {
                        localStorage.setItem('avatarBaccaratDB', db);
                    } catch (e) {
                        console.error('로컬 스토리지 업데이트 실패:', e);
                        window.tempDB = parsedDB;
                    }
                }
            } catch (error) {
                console.error('데이터베이스 파싱 오류:', error);
                db = JSON.stringify(initialData);
                try {
                    localStorage.setItem('avatarBaccaratDB', db);
                } catch (e) {
                    console.error('로컬 스토리지 재설정 실패:', e);
                    window.tempDB = initialData;
                }
            }
        }
        
        console.log('데이터베이스 초기화 완료');
        return JSON.parse(db);
    } catch (error) {
        console.error('데이터베이스 초기화 중 오류 발생:', error);
        return initialData;
    }
}

// 데이터베이스 업데이트
function updateDB(table, data) {
    const db = JSON.parse(localStorage.getItem('avatarBaccaratDB'));
    if (!db[table]) {
        db[table] = [];
    }
    db[table].push(data);
    localStorage.setItem('avatarBaccaratDB', JSON.stringify(db));
}

// 데이터베이스 조회
function getDB(table) {
    try {
        const db = JSON.parse(localStorage.getItem('avatarBaccaratDB')) || window.tempDB;
        return db[table] || [];
    } catch (error) {
        console.error('데이터베이스 조회 중 오류 발생:', error);
        return window.tempDB?.[table] || [];
    }
}

// 활동 로그 기록
function logActivity(action, description, userId = null) {
    const log = {
        timestamp: new Date().toISOString(),
        action,
        description,
        userId: userId || (Security.session?.user?.id || 'system')
    };
    updateDB('systemLogs', log);
}

// 이상 징후 감지
function detectAnomaly(type, description, severity = 'medium') {
    const anomaly = {
        timestamp: new Date().toISOString(),
        type,
        description,
        severity
    };
    updateDB('anomalyDetections', anomaly);
}

// 통계 업데이트
function updateStatistics(timeframe, data) {
    const db = JSON.parse(localStorage.getItem('avatarBaccaratDB'));
    db.statistics[timeframe] = data;
    localStorage.setItem('avatarBaccaratDB', JSON.stringify(db));
}

// 페이지 로드 시 데이터베이스 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드됨 - 데이터베이스 초기화 시작'); // 디버깅용
    initDB();
    console.log('데이터베이스 초기화 완료'); // 디버깅용
}); 