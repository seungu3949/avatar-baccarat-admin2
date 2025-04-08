// 전역 변수 선언
let currentResult = 'N/A'; // 현재 선택된 기본 결과 (뱅커/플레이어/타이)
let isBankerPair = false;
let isPlayerPair = false;
let nextUserId = 3; // 다음 사용자 ID

// 다크모드 관련 변수
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const html = document.documentElement;

// 다크모드 토글 함수
function toggleTheme() {
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

// 테마 아이콘 업데이트 함수
function updateThemeIcon(isDark) {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.setAttribute('d', isDark ? 
            'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' : 
            'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
        );
    }
}

// 초기 테마 설정
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        html.classList.add('dark');
    }
    updateThemeIcon(savedTheme === 'dark');
}

// 메시지 박스 표시 함수
function showMessage(message, isError = false) {
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = message;
    messageBox.classList.remove('error');
    if (isError) {
        messageBox.classList.add('error');
    }
    messageBox.classList.add('show');

    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000);
}

// 테이블 상태 설정 함수
function setTableStatus(statusText, statusClass) {
    const statusElement = document.getElementById('table-status');
    statusElement.textContent = statusText;
    statusElement.className = `ml-2 inline-block px-3 py-1 text-sm font-semibold rounded-full ${statusClass}`;
    showMessage(`테이블 상태가 "${statusText}"(으)로 변경되었습니다.`);
}

// 게임 결과 선택 함수
function recordResult(result) {
    currentResult = result;
    showMessage(`결과 "${result}"이(가) 선택되었습니다.`);
}

// 최종 결과 확정 및 기록 함수
function confirmRecordedResult() {
    const bankerPairCheckbox = document.getElementById('banker-pair');
    const playerPairCheckbox = document.getElementById('player-pair');
    isBankerPair = bankerPairCheckbox.checked;
    isPlayerPair = playerPairCheckbox.checked;

    if (currentResult === 'N/A') {
        showMessage("기본 결과(뱅커/플레이어/타이)를 먼저 선택해주세요.", true);
        return;
    }

    let finalResultText = currentResult;
    if (isBankerPair) finalResultText += " + 뱅커 페어";
    if (isPlayerPair) finalResultText += " + 플레이어 페어";

    document.getElementById('last-result').textContent = finalResultText;
    showMessage(`결과 "${finalResultText}" 이(가) 기록되었습니다.`);

    // 결과 기록 후 선택 초기화
    currentResult = 'N/A';
    bankerPairCheckbox.checked = false;
    playerPairCheckbox.checked = false;
}

// 베팅 한도 업데이트 함수
function updateBetLimits() {
    const minBetInput = document.getElementById('min-bet');
    const maxBetInput = document.getElementById('max-bet');
    const minBet = parseInt(minBetInput.value);
    const maxBet = parseInt(maxBetInput.value);

    if (isNaN(minBet) || isNaN(maxBet) || minBet < 0 || maxBet < 0) {
        showMessage("유효한 최소 및 최대 베팅 금액을 입력하세요.", true);
        return;
    }
    if (minBet >= maxBet) {
        showMessage("최소 베팅 금액은 최대 베팅 금액보다 작아야 합니다.", true);
        return;
    }

    document.getElementById('current-limits').textContent = `최소: ${minBet}, 최대: ${maxBet}`;
    showMessage(`베팅 한도가 업데이트되었습니다: 최소 ${minBet}, 최대 ${maxBet}`);
}

// 회원 추가 함수
function addUser() {
    const usernameInput = document.getElementById('new-username');
    const passwordInput = document.getElementById('new-password');
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showMessage("사용자명과 초기 비밀번호를 입력하세요.", true);
        return;
    }

    const userList = document.getElementById('user-list');
    const newRow = document.createElement('tr');
    newRow.id = `user-${nextUserId}`;
    newRow.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${nextUserId}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${username}</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span class="status-badge px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">활성</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
            <button onclick="toggleUserStatus(${nextUserId}, this)" class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300" title="비활성화">
                <span class="lucide icon-ban"></span>
            </button>
            <button onclick="deleteUser(${nextUserId})" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="삭제">
                <span class="lucide icon-trash"></span>
            </button>
        </td>
    `;
    userList.appendChild(newRow);

    showMessage(`회원 "${username}" (ID: ${nextUserId}) 이(가) 추가되었습니다.`);
    nextUserId++;
    usernameInput.value = '';
    passwordInput.value = '';
}

// 회원 상태 토글 함수
function toggleUserStatus(userId, buttonElement) {
    const userRow = document.getElementById(`user-${userId}`);
    if (!userRow) return;

    const statusBadge = userRow.querySelector('.status-badge');
    const iconSpan = buttonElement.querySelector('.lucide');
    const currentStatus = statusBadge.textContent;
    
    let newStatus, newBadgeClass, newButtonClass, newIconClass, newTitle;

    if (currentStatus === '활성') {
        newStatus = '비활성';
        newBadgeClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        newButtonClass = 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300';
        newIconClass = 'icon-check-circle';
        newTitle = '활성화';
    } else {
        newStatus = '활성';
        newBadgeClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        newButtonClass = 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300';
        newIconClass = 'icon-ban';
        newTitle = '비활성화';
    }

    statusBadge.textContent = newStatus;
    statusBadge.className = `status-badge px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${newBadgeClass}`;
    buttonElement.className = newButtonClass;
    buttonElement.title = newTitle;
    iconSpan.className = `lucide ${newIconClass}`;

    showMessage(`회원 ID ${userId}의 상태가 "${newStatus}"(으)로 변경되었습니다.`);
}

// 회원 삭제 함수
function deleteUser(userId) {
    if (confirm(`정말로 회원 ID ${userId}을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
        const userRow = document.getElementById(`user-${userId}`);
        if (userRow) {
            userRow.remove();
            showMessage(`회원 ID ${userId}이(가) 삭제되었습니다.`);
        } else {
            showMessage(`회원 ID ${userId}를 찾을 수 없습니다.`, true);
        }
    }
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    themeToggle.addEventListener('click', toggleTheme);
}); 