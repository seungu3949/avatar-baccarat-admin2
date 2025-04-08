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

// 메모리 기반 저장소 초기화
if (typeof window !== 'undefined') {
    window.MemoryStorage = window.MemoryStorage || {
        db: null,
        session: null
    };
}

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
            console.log('새로운 데이터베이스 생성');
            MemoryStorage.db = JSON.parse(JSON.stringify(initialData));
        } else {
            console.log('기존 데이터베이스 사용');
        }
        
        // 사용자 데이터 확인 및 복구
        if (!MemoryStorage.db.users || !Array.isArray(MemoryStorage.db.users) || MemoryStorage.db.users.length === 0) {
            console.log('사용자 데이터 복구');
            MemoryStorage.db.users = JSON.parse(JSON.stringify(initialData.users));
        }
        
        console.log('데이터베이스 초기화 완료:', {
            hasDB: !!MemoryStorage.db,
            hasUsers: !!MemoryStorage.db?.users,
            userCount: MemoryStorage.db?.users?.length || 0
        });
        
        return MemoryStorage.db;
    } catch (error) {
        console.error('데이터베이스 초기화 중 오류 발생:', error);
        // 오류 발생 시 초기 데이터로 복구
        MemoryStorage.db = JSON.parse(JSON.stringify(initialData));
        return MemoryStorage.db;
    }
}

// 데이터베이스 가져오기
function getDB(tableName) {
    try {
        if (!MemoryStorage.db) {
            console.log('데이터베이스가 없어 초기화 시도');
            initDB();
        }
        
        if (tableName) {
            return MemoryStorage.db[tableName] || [];
        }
        return MemoryStorage.db;
    } catch (error) {
        console.error('데이터베이스 조회 중 오류 발생:', error);
        return tableName ? [] : initialData;
    }
}

// 데이터베이스 업데이트
function updateDB(tableName, data) {
    try {
        if (!MemoryStorage.db) {
            console.log('데이터베이스가 없어 초기화 시도');
            initDB();
        }
        
        if (tableName) {
            MemoryStorage.db[tableName] = data;
        } else {
            MemoryStorage.db = data;
        }
        
        console.log('데이터베이스 업데이트 완료:', {
            tableName,
            dataLength: Array.isArray(data) ? data.length : 'object'
        });
        
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