// 통계 설정
const Statistics = {
    // 시간대별 통계
    timeframes: {
        daily: '일간',
        weekly: '주간',
        monthly: '월간'
    },
    
    // 차트 설정
    charts: {
        bettingTrend: null,
        playerActivity: null,
        revenue: null
    },
    
    // 통계 데이터
    data: {
        daily: {},
        weekly: {},
        monthly: {}
    }
};

// 통계 데이터 계산
function calculateStatistics(timeframe) {
    const db = getDatabase();
    const now = new Date();
    let startDate, endDate;
    
    switch (timeframe) {
        case 'daily':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'weekly':
            startDate = new Date(now.setDate(now.getDate() - now.getDay()));
            endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
    }
    
    // 게임 결과 필터링
    const games = db.gameResults.filter(game => {
        const gameDate = new Date(game.timestamp);
        return gameDate >= startDate && gameDate <= endDate;
    });
    
    // 통계 계산
    const stats = {
        totalGames: games.length,
        totalBets: games.reduce((sum, game) => sum + (game.bets || 0), 0),
        bankerWins: games.filter(game => game.result === '뱅커 승').length,
        playerWins: games.filter(game => game.result === '플레이어 승').length,
        ties: games.filter(game => game.result === '타이').length,
        revenue: games.reduce((sum, game) => sum + (game.revenue || 0), 0),
        averageBet: 0,
        maxBet: Math.max(...games.map(game => game.bets || 0))
    };
    
    stats.averageBet = stats.totalBets / (stats.totalGames || 1);
    
    // 데이터 저장
    Statistics.data[timeframe] = stats;
    
    return stats;
}

// 차트 생성
function createCharts() {
    const ctx1 = document.getElementById('bettingTrendChart');
    const ctx2 = document.getElementById('playerActivityChart');
    const ctx3 = document.getElementById('revenueChart');
    
    if (ctx1) {
        Statistics.charts.bettingTrend = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: '베팅 추세',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        });
    }
    
    if (ctx2) {
        Statistics.charts.playerActivity = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['월', '화', '수', '목', '금', '토', '일'],
                datasets: [{
                    label: '활성 플레이어',
                    data: [12, 19, 15, 25, 22, 30, 28],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)'
                }]
            }
        });
    }
    
    if (ctx3) {
        Statistics.charts.revenue = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: ['뱅커 승', '플레이어 승', '타이'],
                datasets: [{
                    data: [300, 50, 100],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)'
                    ]
                }]
            }
        });
    }
}

// 통계 리포트 생성
function generateReport(timeframe) {
    const stats = calculateStatistics(timeframe);
    
    return `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">
                ${Statistics.timeframes[timeframe]} 통계 리포트
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">총 게임 수</h4>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">${stats.totalGames}</p>
                </div>
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">총 베팅</h4>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">${stats.totalBets.toLocaleString()}</p>
                </div>
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">평균 베팅</h4>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">${Math.round(stats.averageBet).toLocaleString()}</p>
                </div>
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">최대 베팅</h4>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">${stats.maxBet.toLocaleString()}</p>
                </div>
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">수익</h4>
                    <p class="text-2xl font-bold text-green-600 dark:text-green-400">${stats.revenue.toLocaleString()}</p>
                </div>
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">승률</h4>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">
                        뱅커: ${((stats.bankerWins / stats.totalGames) * 100).toFixed(1)}%<br>
                        플레이어: ${((stats.playerWins / stats.totalGames) * 100).toFixed(1)}%<br>
                        타이: ${((stats.ties / stats.totalGames) * 100).toFixed(1)}%
                    </p>
                </div>
            </div>
        </div>
    `;
}

// 통계 페이지 초기화
function initStatistics() {
    // 권한 체크
    if (!checkPermission('view')) {
        showMessage('통계 조회 권한이 없습니다.', 'error');
        return;
    }

    // 시간대별 통계 계산
    calculateStatistics('daily');
    calculateStatistics('weekly');
    calculateStatistics('monthly');

    // 차트 생성
    createCharts();

    // 리포트 표시
    generateReport('daily');
}

// 페이지 로드 시 통계 초기화
document.addEventListener('DOMContentLoaded', initStatistics); 