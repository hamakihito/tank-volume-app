document.addEventListener('DOMContentLoaded', () => {
    const tankSelect = document.getElementById('tankSelect');
    const depthInput = document.getElementById('depthInput');
    const volumeInput = document.getElementById('volumeInput');
    const result = document.getElementById('result');
  
    // 入力中のフラグを使って入力イベントの相互干渉を防止
    let suppressInputEvent = false;
  
    // タンクデータ読み込み（グローバル変数 tankData を使用）
    const getTankData = (tankNo) => tankData[tankNo] || [];
  
    const findNearestValue = (data, key, value) => {
      if (!data.length) return null;
  
      // 数値に変換して検索
      const numericValue = parseFloat(value);
      const sorted = data.slice().sort((a, b) => a[key] - b[key]);
  
      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        if (numericValue >= current[key] && numericValue <= next[key]) {
          const ratio = (numericValue - current[key]) / (next[key] - current[key]);
          const otherKey = key === 'depth' ? 'volume' : 'depth';
          const interpolated = current[otherKey] + ratio * (next[otherKey] - current[otherKey]);
          return interpolated.toFixed(1);
        }
      }
  
      // 範囲外の時は最も近い値
      const closest = sorted.reduce((prev, curr) =>
        Math.abs(curr[key] - numericValue) < Math.abs(prev[key] - numericValue) ? curr : prev
      );
  
      const otherKey = key === 'depth' ? 'volume' : 'depth';
      return closest[otherKey];
    };
  
    const updateFromDepth = () => {
      const tankNo = tankSelect.value;
      const depth = depthInput.value;
      const data = getTankData(tankNo);
  
      if (depth && data.length > 0) {
        const interpolated = findNearestValue(data, 'depth', depth);
        suppressInputEvent = true;
        volumeInput.value = interpolated;
        suppressInputEvent = false;
        result.textContent = `タンク${tankNo}：深さ ${depth} mm → 容量 ${interpolated} ℓ`;
      } else {
        result.textContent = '';
      }
    };
  
    const updateFromVolume = () => {
      const tankNo = tankSelect.value;
      const volume = volumeInput.value;
      const data = getTankData(tankNo);
  
      if (volume && data.length > 0) {
        const interpolated = findNearestValue(data, 'volume', volume);
        suppressInputEvent = true;
        depthInput.value = interpolated;
        suppressInputEvent = false;
        result.textContent = `タンク${tankNo}：容量 ${volume} ℓ → 深さ ${interpolated} mm`;
      } else {
        result.textContent = '';
      }
    };
  
    // 相互入力クリア
    depthInput.addEventListener('input', () => {
      if (suppressInputEvent) return;
      volumeInput.value = '';
      updateFromDepth();
    });
  
    volumeInput.addEventListener('input', () => {
      if (suppressInputEvent) return;
      depthInput.value = '';
      updateFromVolume();
    });
  
    tankSelect.addEventListener('change', () => {
      if (depthInput.value) {
        updateFromDepth();
      } else if (volumeInput.value) {
        updateFromVolume();
      }
    });
  });
  