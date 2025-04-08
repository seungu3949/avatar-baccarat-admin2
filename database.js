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

// 메모리 기반 저장소
const MemoryStorage = {
    db: null,
    session: null
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
        },
        {
            id: 2,
            username: 'manager',
            password: 'manager123',
            role: 'manager',
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
        // 메모리 기반 저장소 초기화
        if (!MemoryStorage.db) {
            MemoryStorage.db = { ...initialData };
            console.log('메모리 기반 데이터베이스 생성:', MemoryStorage.db);
        } else {
            console.log('기존 데이터베이스 사용:', MemoryStorage.db);
        }
        
        // 사용자 데이터 확인
        if (!MemoryStorage.db.users || MemoryStorage.db.users.length === 0) {
            console.log('사용자 데이터가 없어 초기 데이터로 복구');
            MemoryStorage.db.users = [...initialData.users];
        }
        
        console.log('데이터베이스 초기화 완료');
        return MemoryStorage.db;
    } catch (error) {
        console.error('데이터베이스 초기화 중 오류 발생:', error);
        return initialData;
    }
}

// 데이터베이스 조회
function getDB(table) {
    try {
        return MemoryStorage.db?.[table] || [];
    } catch (error) {
        console.error('데이터베이스 조회 중 오류 발생:', error);
        return [];
    }
}

// 데이터베이스 업데이트
function updateDB(table, data) {
    try {
        if (!MemoryStorage.db[table]) {
            MemoryStorage.db[table] = [];
        }
        MemoryStorage.db[table].push(data);
        return true;
    } catch (error) {
        console.error('데이터베이스 업데이트 중 오류 발생:', error);
        return false;
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
    try {
        if (!MemoryStorage.db.statistics) {
            MemoryStorage.db.statistics = {
                daily: {},
                weekly: {},
                monthly: {}
            };
        }
        MemoryStorage.db.statistics[timeframe] = data;
        return true;
    } catch (error) {
        console.error('통계 업데이트 중 오류 발생:', error);
        return false;
    }
}

// 페이지 로드 시 데이터베이스 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드됨 - 데이터베이스 초기화 시작'); // 디버깅용
    initDB();
    console.log('데이터베이스 초기화 완료'); // 디버깅용
}); 