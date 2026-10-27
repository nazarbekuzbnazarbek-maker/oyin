let swampActive = false;
let swampBet = 10000;

function setSwampBet(val) {
    document.getElementById('swampBetInput').value = val;
    swampBet = val;
}

function initSwampGame() {
    console.log("Swamp Land yuklandi");
}

async function handleSwampMainAction() {
    if (!swampActive) {
        if (currentUser.balance < swampBet) {
            alert("Balansda yetarli mablag' yo'q!");
            return;
        }
        await updateBalanceOnServer(-swampBet);
        swampActive = true;
        document.getElementById('swampMainBtn').textContent = "Yutuqni Yechish";
    } else {
        let winAmount = swampBet * 1.5;
        await updateBalanceOnServer(winAmount);
        alert(`Siz ${winAmount.toLocaleString()} UZS yutdingiz!`);
        swampActive = false;
        document.getElementById('swampMainBtn').textContent = "O'yinni Boshlash";
    }
}