let tankData = {};

// データ読み込み
async function loadData() {
  try {
    const res = await fetch("tank_data.json");
    if (!res.ok) throw new Error("データの読み込みに失敗しました。");
    tankData = await res.json();

    const tankList = document.getElementById("tankList");
    Object.keys(tankData).forEach(tankNo => {
      const option = document.createElement("option");
      option.value = tankNo;
      tankList.appendChild(option);
    });
  } catch (err) {
    alert("タンクデータの読み込みに失敗しました。");
    console.error(err);
  }
}

// 線形補間関数
function interpolate(data, value, key1, key2) {
  const sorted = data.map(item => ({
    x: parseFloat(item[key1]),
    y: parseFloat(item[key2])
  })).sort((a, b) => a.x - b.x);

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (value >= a.x && value <= b.x) {
      const t = (value - a.x) / (b.x - a.x);
      return a.y + t * (b.y - a.y);
    }
  }

  return null; // 範囲外
}

// 計算と表示
function updateResult() {
  const tankNo = document.getElementById("tankSelect").value.trim();
  const depthInput = document.getElementById("depthInput");
  const volumeInput = document.getElementById("volumeInput");
  const result = document.getElementById("result");

  if (!tankData[tankNo]) {
    result.textContent = "⚠️ 有効なタンク番号を選択してください";
    return;
  }

  const data = tankData[tankNo];

  // 深さ入力から容量計算
  if (depthInput.value) {
    const depth = parseFloat(depthInput.value);
    const volume = interpolate(data, depth, "depth", "volume");

    volumeInput.value = "";
    if (volume === null) {
      result.textContent = "⚠️ 深さがデータ範囲外です";
    } else {
      result.textContent = `容量: ${volume.toFixed(2)} L`;
    }
  }

  // 容量入力から深さ計算
  else if (volumeInput.value) {
    const volume = parseFloat(volumeInput.value);
    const depth = interpolate(data, volume, "volume", "depth");

    depthInput.value = "";
    if (depth === null) {
      result.textContent = "⚠️ 容量がデータ範囲外です";
    } else {
      result.textContent = `深さ: ${depth.toFixed(2)} mm`;
    }
  }

  // どちらも未入力
  else {
    result.textContent = "";
  }
}

// イベント登録
document.getElementById("depthInput").addEventListener("input", () => {
  document.getElementById("volumeInput").value = "";
  updateResult();
});

document.getElementById("volumeInput").addEventListener("input", () => {
  document.getElementById("depthInput").value = "";
  updateResult();
});

// 初期化
loadData();
