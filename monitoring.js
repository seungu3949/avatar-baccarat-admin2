// 모니터링 설정
const Monitoring = {
    // 실시간 데이터
    realtimeData: {
        tableStatus: '대기 중',
        activePlayers: 0,
        totalBets: 0,
        lastUpdate: null
    },
    
    // 알림 설정
    alerts: {
        bettingThreshold: 10000,
        statusChangeDelay: 300000, // 5분
        anomalyDetection: true
    },
    
    // 모니터링 인터벌
    intervals: {
        statusCheck: null,
        dataUpdate: null
    }
};

// 실시간 데이터 업데이트
function updateRealtimeData() {
    const db = getDatabase();
    
    // 활성 플레이어 수 계산
    const activePlayers = db.users.filter(user => 
        user.status === 'active' && 
        user.lastLogin > new Date(Date.now() - 3600000) // 1시간 이내 로그인
    ).length;
    
    // 총 베팅 금액 계산
    const totalBets = db.gameResults.reduce((sum, game) => 
        sum + (game.bets || 0), 0
    );
    
    Monitoring.realtimeData = {
        ...Monitoring.realtimeData,
        activePlayers,
        totalBets,
        lastUpdate: new Date()
    };
    
    // 대시보드 업데이트
    updateDashboard();
}

// 테이블 상태 모니터링
function monitorTableStatus() {
    const db = getDatabase();
    const lastStatus = db.tableHistory[db.tableHistory.length - 1];
    
    if (lastStatus) {
        const timeInStatus = new Date() - new Date(lastStatus.timestamp);
        
        // 상태 변경 지연 알림
        if (timeInStatus > Monitoring.alerts.statusChangeDelay) {
            showAlert('주의', `테이블 상태 "${lastStatus.status}"가 ${Math.floor(timeInStatus/60000)}분 동안 유지되고 있습니다.`);
        }
    }
}

// 이상 징후 감지
function detectAnomalies() {
    const db = getDatabase();
    
    // 대규모 베팅 감지
    const recentBets = db.gameResults
        .filter(game => new Date() - new Date(game.timestamp) < 3600000) // 1시간 이내
        .map(game => game.bets || 0);
    
    const avgBet = recentBets.reduce((a, b) => a + b, 0) / recentBets.length;
    const largeBets = recentBets.filter(bet => bet > avgBet * 3);
    
    if (largeBets.length > 0) {
        detectAnomaly('betting', {
            amount: largeBets[0],
            average: avgBet,
            timestamp: new Date()
        });
    }
    
    // 비정상적인 상태 변경 감지
    const statusChanges = db.tableHistory
        .filter(change => new Date() - new Date(change.timestamp) < 300000) // 5분 이내
        .length;
    
    if (statusChanges > 5) {
        detectAnomaly('status', {
            changes: statusChanges,
            timestamp: new Date()
        });
    }
}

// 대시보드 업데이트
function updateDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;
    
    dashboard.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">현재 상태</h3>
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${Monitoring.realtimeData.tableStatus}
                </p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">활성 플레이어</h3>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${Monitoring.realtimeData.activePlayers}
                </p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">총 베팅</h3>
                <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${Monitoring.realtimeData.totalBets.toLocaleString()}
                </p>
            </div>
        </div>
    `;
}

// 모니터링 시작
function startMonitoring() {
    // 상태 체크 (1분마다)
    Monitoring.intervals.statusCheck = setInterval(() => {
        monitorTableStatus();
        detectAnomalies();
    }, 60000);
    
    // 실시간 데이터 업데이트 (10초마다)
    Monitoring.intervals.dataUpdate = setInterval(updateRealtimeData, 10000);
    
    // 초기 데이터 업데이트
    updateRealtimeData();
}

// 모니터링 중지
function stopMonitoring() {
    clearInterval(Monitoring.intervals.statusCheck);
    clearInterval(Monitoring.intervals.dataUpdate);
}

// 페이지 로드 시 모니터링 시작
document.addEventListener('DOMContentLoaded', () => {
    if (checkPermission('monitor')) {
        startMonitoring();
    }
});

// 페이지 종료 시 모니터링 중지
window.addEventListener('beforeunload', stopMonitoring); 