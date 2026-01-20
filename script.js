const saveBtn = document.getElementById("saveTrade");
const table = document.getElementById("tradeTable");

const totalTradesCard = document.getElementById("totalTrades");
const winRateCard = document.getElementById("winRate");
const avgRRCard = document.getElementById("avgRR");
const bestPairCard = document.getElementById("bestPair");

let trades = JSON.parse(localStorage.getItem("trades")) || [];

// PIE CHART
const ctx = document.getElementById('winLossChart').getContext('2d');
let chart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Wins', 'Losses', 'Break-even'],
    datasets: [{
      label: 'Trade Outcomes',
      data: [0,0,0],
      backgroundColor: ['#22c55e','#ef4444','#facc15'],
      borderWidth: 0
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 14 }
        }
      }
    }
  }
});

function calculateRR(entry, sl, tp) {
  return Math.abs((tp - entry) / (entry - sl)).toFixed(2);
}

function calculateSummary() {
  if (trades.length === 0) {
    chart.data.datasets[0].data = [0,0,0];
    chart.update();
    return;
  }

  let wins = trades.filter(t => t.result === "Win").length;
  let losses = trades.filter(t => t.result === "Loss").length;
  let be = trades.filter(t => t.result === "Break-even").length;

  let avgRR = trades.reduce((acc,t) => acc + parseFloat(t.rr),0)/trades.length;

  let pairWins = {};
  trades.forEach(t => {
    if (!pairWins[t.pair]) pairWins[t.pair] = 0;
    if (t.result==="Win") pairWins[t.pair]++;
  });
  let bestPair = Object.keys(pairWins).reduce((a,b)=> pairWins[a]>pairWins[b]?a:b,"-");

  totalTradesCard.textContent = `Total Trades: ${trades.length}`;
  winRateCard.textContent = `Win Rate: ${((wins/trades.length)*100).toFixed(0)}%`;
  avgRRCard.textContent = `Avg R:R: ${avgRR.toFixed(2)}`;
  bestPairCard.textContent = `Best Pair: ${bestPair}`;

  chart.data.datasets[0].data = [wins, losses, be];
  chart.update();
}

function renderTrades() {
  table.innerHTML = "";
  trades.forEach((trade, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${trade.pair}</td>
      <td>${trade.date}</td>
      <td>${trade.session}</td>
      <td>${trade.direction}</td>
      <td>${trade.rr}</td>
      <td>${trade.result}</td>
      <td>${trade.emotion}</td>
      <td>
        <button class="editBtn" data-index="${index}">Edit</button>
        <button class="deleteBtn" data-index="${index}">Delete</button>
      </td>
    `;
    table.appendChild(row);
  });

  // DELETE
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      trades.splice(idx, 1);
      localStorage.setItem("trades", JSON.stringify(trades));
      renderTrades();
    });
  });

  // EDIT
  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      const t = trades[idx];

      document.getElementById("pair").value = t.pair;
      document.getElementById("date").value = t.date;
      document.getElementById("session").value = t.session;
      document.getElementById("direction").value = t.direction;
      document.getElementById("entry").value = t.entry;
      document.getElementById("sl").value = t.sl;
      document.getElementById("tp").value = t.tp;
      document.getElementById("lot").value = t.lot;
      document.getElementById("risk").value = t.risk;
      document.getElementById("emotion").value = t.emotion;
      document.getElementById("result").value = t.result;

      saveBtn.textContent = "Update Trade";

      saveBtn.onclick = () => {
        trades[idx] = {
          pair: document.getElementById("pair").value,
          date: document.getElementById("date").value,
          session: document.getElementById("session").value,
          direction: document.getElementById("direction").value,
          entry: parseFloat(document.getElementById("entry").value),
          sl: parseFloat(document.getElementById("sl").value),
          tp: parseFloat(document.getElementById("tp").value),
          lot: parseFloat(document.getElementById("lot").value),
          risk: parseFloat(document.getElementById("risk").value),
          emotion: document.getElementById("emotion").value,
          result: document.getElementById("result").value,
          rr: calculateRR(
            parseFloat(document.getElementById("entry").value),
            parseFloat(document.getElementById("sl").value),
            parseFloat(document.getElementById("tp").value)
          )
        };
        localStorage.setItem("trades", JSON.stringify(trades));
        renderTrades();
        saveBtn.textContent = "Save Trade";
        saveBtn.onclick = saveTrade;
        document.querySelector("form")?.reset();
      };
    });
  });

  calculateSummary();
}

function saveTrade() {
  const entry = parseFloat(document.getElementById("entry").value);
  const sl = parseFloat(document.getElementById("sl").value);
  const tp = parseFloat(document.getElementById("tp").value);

  const trade = {
    pair: document.getElementById("pair").value,
    date: document.getElementById("date").value,
    session: document.getElementById("session").value,
    direction: document.getElementById("direction").value,
    entry,
    sl,
    tp,
    lot: parseFloat(document.getElementById("lot").value),
    risk: parseFloat(document.getElementById("risk").value),
    emotion: document.getElementById("emotion").value,
    result: document.getElementById("result").value,
    rr: calculateRR(entry, sl, tp)
  };

  trades.push(trade);
  localStorage.setItem("trades", JSON.stringify(trades));
  renderTrades();
  document.querySelector("form")?.reset();
}

saveBtn.onclick = saveTrade;

renderTrades();
// sample-trades.json can also be loaded if you prefer
if (!localStorage.getItem("trades")) {
  trades = [
    { pair:"EURUSD", date:"2026-01-10", session:"London", direction:"Buy", entry:1.0950, sl:1.0920, tp:1.1000, lot:0.5, risk:2, emotion:"Calm", result:"Win", rr:calculateRR(1.0950,1.0920,1.1000) },
    { pair:"GBPUSD", date:"2026-01-11", session:"London", direction:"Sell", entry:1.2550, sl:1.2580, tp:1.2480, lot:0.5, risk:1.5, emotion:"FOMO", result:"Loss", rr:calculateRR(1.2550,1.2580,1.2480) },
    { pair:"BTCUSD", date:"2026-01-11", session:"New York", direction:"Buy", entry:22500, sl:22300, tp:22800, lot:0.1, risk:2, emotion:"Calm", result:"Win", rr:calculateRR(22500,22300,22800) },
    { pair:"ETHUSD", date:"2026-01-12", session:"Asia", direction:"Sell", entry:1600, sl:1620, tp:1550, lot:0.2, risk:1.8, emotion:"Fear", result:"Win", rr:calculateRR(1600,1620,1550) },
    { pair:"USDJPY", date:"2026-01-12", session:"London", direction:"Buy", entry:132.50, sl:132.00, tp:133.50, lot:1, risk:2, emotion:"Calm", result:"Break-even", rr:calculateRR(132.50,132.00,133.50) }
  ];
  localStorage.setItem("trades", JSON.stringify(trades));
}
