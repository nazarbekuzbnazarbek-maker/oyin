function initAviatorGame() {
    const canvas = document.getElementById('aviatorCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

async function handleAviatorBet(panelId) {
    let betVal = parseFloat(document.getElementById(`aviBet${panelId}`).value);
    if (currentUser.balance < betVal) {
        alert("Balansda mablag' yetarli emas!");
        return;
    }
    await updateBalanceOnServer(-betVal);
    alert(`Tikish qabul qilindi: ${betVal.toLocaleString()} UZS`);
}