const tankNoSelect = document.getElementById('tankNo');
const depthInput = document.getElementById('depthInput');
const volumeInput = document.getElementById('volumeInput');
const resultText = document.getElementById('resultText');

function interpolate(x, x0, y0, x1, y1) {
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

function findInterpolated(data, inputValue, inputKey, outputKey) {
  const numericInput = parseFloat(inputValue);
  if (isNaN(numericInput)) return null;

  const sorted = [...data].sort((a, b) => a[inputKey] - b[inputKey]);
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (numericInput >= a[inputKey] && numericInput <= b[inputKey]) {
      return interpolate(numericInput, a[inputKey], a[outputKey], b[inputKey], b[outputKey]);
    }
  }
  return null;
}

function update() {
  const tankNo = tankNoSelect.value;
  const data = tankData[tankNo];
  if (!data) return;

  const depthVal = depthInput.value.trim();
  const volumeVal = volumeInput.value.trim();

  if (depthVal && volumeVal) {
    resultText.textContent = "どちらか一方だけ入力してください。";
    return;
  }

  let result = null;

  if (depthVal) {
    result = findInterpolated(data, parseFloat(depthVal), 'depth', 'volume');
    resultText.textContent = result !== null ? `容量は 約 ${result.toFixed(2)} L` : '深さが範囲外です。';
    volumeInput.value = '';
  } else if (volumeVal) {
    result = findInterpolated(data, parseFloat(volumeVal), 'volume', 'depth');
    resultText.textContent = result !== null ? `液面までの深さは 約 ${result.toFixed(2)} mm` : '容量が範囲外です。';
    depthInput.value = '';
  } else {
    resultText.textContent = '深さ または 容量を入力してください。';
  }
}

depthInput.addEventListener('input', update);
volumeInput.addEventListener('input', update);
tankNoSelect.addEventListener('change', () => {
  depthInput.value = '';
  volumeInput.value = '';
  resultText.textContent = '';
});

function init() {
  for (const tankNo in tankData) {
    const opt = document.createElement('option');
    opt.value = tankNo;
    opt.textContent = `タンク ${tankNo}`;
    tankNoSelect.appendChild(opt);
  }
}

init();
