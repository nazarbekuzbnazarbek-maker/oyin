let currentUser = null;

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.authenticated) {
            currentUser = data.user;
            updateUI();
            showLobby();
        } else {
            showAuthModal();
        }
    } catch (e) {
        showAuthModal();
    }
});

function updateUI() {
    if (!currentUser) return;
    document.getElementById('userIdDisplay').textContent = `ID: ${currentUser.id}`;
    document.getElementById('userPhoneDisplay').textContent = currentUser.phone;
    document.getElementById('userBalanceDisplay').textContent = `${currentUser.balance.toLocaleString()} UZS`;
}

function switchAuthTab(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (type === 'login') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('loginForm').classList.add('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPass').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
    });
    const data = await res.json();

    if (data.success) {
        currentUser = data.user;
        updateUI();
        hideAuthModal();
        showLobby();
    } else {
        alert(data.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPass').value;

    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
    });
    const data = await res.json();

    if (data.success) {
        currentUser = data.user;
        updateUI();
        hideAuthModal();
        showLobby();
    } else {
        alert(data.message);
    }
}

async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    currentUser = null;
    showAuthModal();
}

async function updateBalanceOnServer(amount) {
    const res = await fetch('/api/update_balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });
    const data = await res.json();
    if (data.success) {
        currentUser.balance = data.new_balance;
        updateUI();
    }
}

function showAuthModal() {
    document.getElementById('authOverlay').classList.remove('hidden');
    document.getElementById('topBar').classList.add('hidden');
    hideAllSections();
}

function hideAuthModal() {
    document.getElementById('authOverlay').classList.add('hidden');
    document.getElementById('topBar').classList.remove('hidden');
}

function hideAllSections() {
    document.getElementById('lobbySection').classList.add('hidden');
    document.getElementById('swampSection').classList.add('hidden');
    document.getElementById('aviatorSection').classList.add('hidden');
}

function showLobby() {
    hideAllSections();
    document.getElementById('lobbySection').classList.remove('hidden');
}

function openGame(gameType) {
    hideAllSections();
    if (gameType === 'swamp') {
        document.getElementById('swampSection').classList.remove('hidden');
        if (typeof initSwampGame === 'function') initSwampGame();
    } else if (gameType === 'aviator') {
        document.getElementById('aviatorSection').classList.remove('hidden');
        if (typeof initAviatorGame === 'function') initAviatorGame();
    }
}

function openDepositModal() {
    document.getElementById('depositModal').classList.remove('hidden');
}

function closeDepositModal() {
    document.getElementById('depositModal').classList.add('hidden');
}

async function sendDepositRequest() {
    const amount = parseFloat(document.getElementById('depositAmountInput').value);
    if (!amount || amount <= 0) {
        alert("Iltimos, to'g'ri summani kiriting!");
        return;
    }

    const res = await fetch('/api/deposit_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });
    const data = await res.json();

    if (data.success) {
        currentUser.balance = data.new_balance;
        updateUI();
        alert(data.message);
        closeDepositModal();
    } else {
        alert(data.message);
    }
}

function openWithdrawModal() {
    document.getElementById('withdrawModal').classList.remove('hidden');
}

function closeWithdrawModal() {
    document.getElementById('withdrawModal').classList.add('hidden');
}

async function sendWithdrawRequest() {
    const cardNumber = document.getElementById('withdrawCardInput').value.trim();
    const amount = parseFloat(document.getElementById('withdrawAmountInput').value);

    if (!cardNumber || cardNumber.length < 16) {
        alert("Iltimos, to'g'ri karta raqamini kiriting!");
        return;
    }
    if (!amount || amount < 50000) {
        alert("Minimal yechish summasi 50,000 UZS!");
        return;
    }

    if (currentUser.balance < amount) {
        alert("Balansingizda yetarli mablag' mavjud emas!");
        return;
    }

    const res = await fetch('/api/withdraw_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_number: cardNumber, amount: amount })
    });
    const data = await res.json();

    if (data.success) {
        currentUser.balance = data.new_balance;
        updateUI();
        alert(data.message);
        closeWithdrawModal();
    } else {
        alert(data.message);
    }
}