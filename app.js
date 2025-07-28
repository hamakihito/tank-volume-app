document.addEventListener('DOMContentLoaded', () => {
    const tankSelect = document.getElementById('tankSelect');
    const tankList = document.getElementById('tankList');
    const depthInput = document.getElementById('depthInput');
    const volumeInput = document.getElementById('volumeInput');
    const result = document.getElementById('result');
  
    // 入力中のフラグを使って入力イベントの相互干渉を防止
    let suppressInputEvent = false;
  
    // tankData のタンク番号を datalist に追加
    Object.keys(tankData).forEach(tankNo => {
      const option = document.createElement('option');
      option.value = tankNo;
      tankList.appendChild(option);
    });
  
    // タンクデータ取得関数
    const getTankData = (tankNo) => tankData[tankNo] || [];
  
    const findNearestValue = (data, key, value) => {
      if (!data.length) return null;
  
      const numericValue = parseFloat(value);
      const sorted = data.slice().sort((a, b) => a[key] - b[key]);
  
      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        if (numericValue >= current[key] && numericValue <= next[key]) {
          const ratio = (numericValue - current[key]) / (next[key] - current[key]);
          const otherKey = key === 'depth' ? 'volume' : 'depth';
          const interpolated = current[otherKey] + ratio * (next[otherKey] - current[otherKey]);
          return interpolated;
        }
      }
  
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
        volumeInput.value = Math.round(interpolated);
        suppressInputEvent = false;
        result.textContent = `タンク${tankNo}：深さ ${depth} mm → 容量 ${Math.round(interpolated)} ℓ`;
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
        depthInput.value = Math.round(interpolated);
        suppressInputEvent = false;
        result.textContent = `タンク${tankNo}：容量 ${volume} ℓ → 深さ ${Math.round(interpolated)} mm`;
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
  
    tankSelect.addEventListener('input', () => {
      // 入力（手入力含む）が変わったら深さか容量どちらかあれば計算更新
      if (depthInput.value) {
        updateFromDepth();
      } else if (volumeInput.value) {
        updateFromVolume();
      } else {
        result.textContent = '';
      }
    });
  });
  