  let current = '0', previous = null, operator = null;
    let historyStr = '', justCalc = false, decimalLocked = false;

    const mainEl    = document.getElementById('mainDisplay');
    const historyEl = document.getElementById('history');

    function updateDisplay() {
      const len = current.replace('-','').replace('.','').length;
      mainEl.className = 'display-main';
      if (len > 12) mainEl.classList.add('tiny');
      else if (len > 9) mainEl.classList.add('shrink');
      mainEl.textContent    = formatDisplay(current);
      historyEl.textContent = historyStr;
    }

    function formatDisplay(val) {
      if (['Error','Infinity','NaN'].includes(val)) return 'Error';
      if (val.endsWith('.')) return val;
      const n = parseFloat(val);
      if (isNaN(n)) return val;
      if (Math.abs(n) > 9999999999999) return n.toExponential(4);
      if (!val.includes('.')) return n.toLocaleString('en-US');
      const [int, dec] = val.split('.');
      return parseFloat(int).toLocaleString('en-US') + '.' + dec;
    }

    function highlightOp(op) {
      document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('active-op'));
      if (op) { const el = document.getElementById('op-' + op); if (el) el.classList.add('active-op'); }
    }

    function inputDigit(d) {
      if (justCalc) { current = d; historyStr = ''; justCalc = false; decimalLocked = false; return; }
      if (d === '.' && decimalLocked) return;
      if (d === '.') { decimalLocked = true; if (!current.includes('.')) current += '.'; return; }
      if (current === '0' || current === '-0') current = (current === '-0' ? '-' : '') + d;
      else if (current.length < 15) current += d;
    }

    function setOperator(op) {
      justCalc = false;
      if (operator && previous !== null) calculate(false);
      previous = parseFloat(current); operator = op;
      historyStr = niceNum(previous) + ' ' + op;
      current = '0'; decimalLocked = false;
      highlightOp(op);
    }

    function calculate(final = true) {
      if (!operator || previous === null) return;
      const a = previous, b = parseFloat(current);
      let result;
      switch (operator) {
        case '+': result = a + b; break;
        case '−': result = a - b; break;
        case '×': result = a * b; break;
        case '÷': result = b === 0 ? 'Error' : a / b; break;
        default: return;
      }
      if (final) {
        historyStr = niceNum(a) + ' ' + operator + ' ' + niceNum(b) + ' =';
        operator = null; previous = null; justCalc = true; decimalLocked = false;
        highlightOp(null);
        if (result === 'Error' || !isFinite(result)) {
          current = 'Error'; mainEl.classList.add('error');
          setTimeout(() => { current = '0'; historyStr = ''; updateDisplay(); }, 1600);
          return;
        }
        current = String(parseFloat(result.toFixed(10)));
        mainEl.classList.add('result');
        setTimeout(() => mainEl.classList.remove('result'), 600);
      } else {
        current = String(parseFloat(result.toFixed(10)));
      }
    }

    function niceNum(n) { return String(parseFloat((+n).toFixed(10))); }

    function clearAll() {
      current = '0'; previous = null; operator = null;
      historyStr = ''; justCalc = false; decimalLocked = false;
      highlightOp(null);
    }

    function backspace() {
      if (justCalc || current === 'Error') { clearAll(); return; }
      if (current.length > 1) { if (current.slice(-1) === '.') decimalLocked = false; current = current.slice(0,-1); }
      else current = '0';
    }

    function handleAction(action) {
      if (current === 'Error' && action !== 'clear') clearAll();
      if ('0123456789'.includes(action))            inputDigit(action);
      else if (action === '.')                       inputDigit('.');
      else if (['+','−','×','÷'].includes(action))   setOperator(action);
      else if (action === '=')                       calculate(true);
      else if (action === 'clear')                   clearAll();
      else if (action === 'back')                    backspace();
      else if (action === 'sign') {
        if (current !== '0') current = current.startsWith('-') ? current.slice(1) : '-' + current;
      }
      else if (action === 'percent') {
        const v = parseFloat(current);
        current = String(isNaN(v) ? 0 : v / 100);
        decimalLocked = current.includes('.');
      }
      updateDisplay();
    }

    document.getElementById('buttons').addEventListener('click', e => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const circle = document.createElement('span');
      circle.classList.add('ripple');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      circle.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
      handleAction(btn.dataset.action);
    });

    document.addEventListener('keydown', e => {
      const k = e.key;
      if ('0123456789'.includes(k))        handleAction(k);
      else if (k === '.')                  handleAction('.');
      else if (k === '+')                  handleAction('+');
      else if (k === '-')                  handleAction('−');
      else if (k === '*')                  handleAction('×');
      else if (k === '/') { e.preventDefault(); handleAction('÷'); }
      else if (k === 'Enter' || k === '=') handleAction('=');
      else if (k === 'Escape')             handleAction('clear');
      else if (k === 'Backspace')          handleAction('back');
      else if (k === '%')                  handleAction('percent');
    });

    updateDisplay();