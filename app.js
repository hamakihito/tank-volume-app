document.addEventListener('DOMContentLoaded', () => {
    const tankSelect = document.getElementById('tankSelect');
    const depthInput = document.getElementById('depthInput');
    const volumeInput = document.getElementById('volumeInput');
    const resultDiv = document.getElementById('result');
    const suggestions = document.getElementById('tankSuggestions');
  
    if (!tankData || Object.keys(tankData).length === 0) {
      resultDiv.textContent = 'タンクデータが読み込まれていません。';
      return;
    }
  
    const tankNumbers = Object.keys(tankData);
  
    // 🔍 オートコンプリート機能
    tankSelect.addEventListener('input', () => {
      const val = tankSelect.value.trim();
      suggestions.innerHTML = '';
      if (!val) {
        suggestions.style.display = 'none';
        return;
      }
  
      const filtered = tankNumbers.filter(num => num.startsWith(val));
      if (filtered.length === 0) {
        suggestions.style.display = 'none';
        return;
      }
  
      filtered.forEach(num => {
        const li = document.createElement('li');
        li.textContent = num;
        li.addEventListener('click', () => {
          tankSelect.value = num;
          suggestions.style.display = 'none';
          tankSelect.dispatchEvent(new Event('change')); // 強制発火
        });
        suggestions.appendChild(li);
      });
  
      suggestions.style.display = 'block';
    });
  
    tankSelect.addEventListener('blur', () => {
      setTimeout(() => {
        suggestions.style.display = 'none';
      }, 200);
    });
  
    // ⬇️ メインロジック：タンクと液面までの深さから容量を計算
    tankSelect.addEventListener('change', () => {
      const tankNo = tankSelect.value.trim();
      const data = tankData[tankNo];
  
      if (!data) {
        resultDiv.textContent = 'タンクデータが見つかりません。';
        return;
      }
  
      depthInput.addEventListener('input', () => {
        const depth = parseFloat(depthInput.value);
        if (isNaN(depth)) {
          resultDiv.textContent = '有効な液面までの深さを入力してください。';
          return;
        }
  
        const matched = data.find(d => d.depth === depth);
  
        if (matched) {
          volumeInput.value = matched.volume;
          resultDiv.textContent = `容量: ${matched.volume} L`;
        } else {
          // 線形補間
          const lower = [...data].reverse().find(d => d.depth < depth);
          const upper = data.find(d => d.depth > depth);
  
          if (lower && upper) {
            const interpolatedVolume =
              lower.volume +
              ((upper.volume - lower.volume) / (upper.depth - lower.depth)) *
                (depth - lower.depth);
  
            volumeInput.value = interpolatedVolume.toFixed(2);
            resultDiv.textContent = `容量（推定）: ${interpolatedVolume.toFixed(2)} L`;
          } else {
            resultDiv.textContent = '液面までの深さがデータ範囲外です。';
            volumeInput.value = '';
          }
        }
      });
  
      volumeInput.addEventListener('input', () => {
        const volume = parseFloat(volumeInput.value);
        if (isNaN(volume)) {
          resultDiv.textContent = '有効な容量を入力してください。';
          return;
        }
  
        const matched = data.find(d => d.volume === volume);
  
        if (matched) {
          depthInput.value = matched.depth;
          resultDiv.textContent = `液面までの深さ: ${matched.depth} mm`;
        } else {
          // 線形補間
          const lower = [...data].reverse().find(d => d.volume < volume);
          const upper = data.find(d => d.volume > volume);
  
          if (lower && upper) {
            const interpolatedDepth =
              lower.depth +
              ((upper.depth - lower.depth) / (upper.volume - lower.volume)) *
                (volume - lower.volume);
  
            depthInput.value = interpolatedDepth.toFixed(2);
            resultDiv.textContent = `液面までの深さ（推定）: ${interpolatedDepth.toFixed(2)} mm`;
          } else {
            resultDiv.textContent = '容量がデータ範囲外です。';
            depthInput.value = '';
          }
        }
      });
    });
  });
  