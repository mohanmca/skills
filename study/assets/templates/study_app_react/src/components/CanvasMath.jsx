import React, { useRef, useEffect } from 'react';

const GREEK = {
  alpha:'α', beta:'β', gamma:'γ', delta:'δ', epsilon:'ε', zeta:'ζ', eta:'η', theta:'θ',
  iota:'ι', kappa:'κ', lambda:'λ', mu:'μ', nu:'ν', xi:'ξ', omicron:'ο', pi:'π',
  rho:'ρ', sigma:'σ', tau:'τ', upsilon:'υ', phi:'φ', chi:'χ', psi:'ψ', omega:'ω',
  Gamma:'Γ', Delta:'Δ', Theta:'Θ', Lambda:'Λ', Xi:'Ξ', Pi:'Π', Sigma:'Σ', Phi:'Φ', Psi:'Ψ', Omega:'Ω'
};
const OPS = {
  '\\pm':'±', '\\times':'×', '\\div':'÷', '\\cdot':'·', '\\leq':'≤', '\\geq':'≥',
  '\\neq':'≠', '\\approx':'≈', '\\infty':'∞', '\\sum':'Σ', '\\int':'∫',
  '\\rightarrow':'→', '\\leftarrow':'←', '\\Rightarrow':'⇒', '\\Leftarrow':'⇐'
};

function replaceCommands(str) {
  let s = str;
  for (const [k,v] of Object.entries(OPS)) s = s.split(k).join(v);
  for (const [k,v] of Object.entries(GREEK)) s = s.split('\\'+k).join(v);
  return s;
}

function tokenizeMath(latex) {
  const tokens = [];
  let i = 0;
  const s = replaceCommands(latex);
  function readGroup() {
    let d = 0, j = i;
    if (s[j] !== '{') return null;
    j++;
    while (j < s.length) {
      if (s[j] === '\\') { j += 2; continue; }
      if (s[j] === '{') d++;
      if (s[j] === '}') { if (d === 0) { const g = s.slice(i+1, j); i = j+1; return g; } d--; }
      j++;
    }
    return null;
  }
  while (i < s.length) {
    if (s[i] === ' ') { i++; continue; }
    if (s[i] === '\\') {
      const m = s.slice(i).match(/^\\(frac|sqrt)(?![a-zA-Z])/);
      if (m) {
        i += m[0].length;
        if (m[1] === 'frac') {
          const num = readGroup();
          const den = readGroup();
          tokens.push({type:'frac', num, den});
        } else if (m[1] === 'sqrt') {
          let index = null;
          if (s[i] === '[') {
            const close = s.indexOf(']', i);
            index = s.slice(i+1, close);
            i = close+1;
          }
          const arg = readGroup();
          tokens.push({type:'sqrt', index, arg});
        }
        continue;
      }
    }
    if (s[i] === '^') {
      i++;
      const sup = readGroup() || s[i++] || '';
      tokens.push({type:'sup', sup});
      continue;
    }
    if (s[i] === '_') {
      i++;
      const sub = readGroup() || s[i++] || '';
      tokens.push({type:'sub', sub});
      continue;
    }
    let j = i;
    while (j < s.length && !'^{}_\\ '.includes(s[j])) j++;
    tokens.push({type:'text', text: s.slice(i, j)});
    i = j;
  }
  return tokens;
}

class CanvasMathPainter {
  constructor(ctx) {
    this.ctx = ctx;
    this.fontSize = 22;
    this.small = 14;
    this.tiny = 11;
    this.lineWidth = 1.5;
  }
  setFont(size) {
    this.ctx.font = `${size}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
  }
  measureText(text, size) {
    this.setFont(size || this.fontSize);
    return this.ctx.measureText(text).width;
  }
  drawText(text, x, y, size, baseline) {
    this.setFont(size || this.fontSize);
    this.ctx.textBaseline = baseline || 'alphabetic';
    this.ctx.fillText(text, x, y);
    return this.measureText(text, size);
  }
  paint(tokens, x, y) {
    let cx = x;
    for (const tok of tokens) {
      if (tok.type === 'text') {
        cx += this.drawText(tok.text, cx, y, this.fontSize);
      } else if (tok.type === 'frac') {
        const numTokens = tokenizeMath(tok.num);
        const denTokens = tokenizeMath(tok.den);
        const nw = this.widthOf(numTokens);
        const dw = this.widthOf(denTokens);
        const w = Math.max(nw, dw) + 10;
        const nh = this.fontSize + 4;
        const dh = this.fontSize + 4;
        const mid = y - this.fontSize * 0.35;
        this.paint(numTokens, cx + w/2 - nw/2, mid - 4);
        this.ctx.beginPath();
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.moveTo(cx, mid);
        this.ctx.lineTo(cx + w, mid);
        this.ctx.stroke();
        this.paint(denTokens, cx + w/2 - dw/2, mid + dh - 2);
        cx += w + 4;
      } else if (tok.type === 'sup') {
        const supTokens = tokenizeMath(tok.sup);
        const sw = this.widthOf(supTokens, this.small);
        this.paint(supTokens, cx, y - this.fontSize * 0.5, this.small);
        cx += sw + 2;
      } else if (tok.type === 'sub') {
        const subTokens = tokenizeMath(tok.sub);
        const sw = this.widthOf(subTokens, this.small);
        this.paint(subTokens, cx, y + this.fontSize * 0.35, this.small);
        cx += sw + 2;
      } else if (tok.type === 'sqrt') {
        const argTokens = tokenizeMath(tok.arg);
        const aw = this.widthOf(argTokens);
        const pad = 6;
        const w = aw + pad * 2;
        const top = y - this.fontSize;
        const bottom = y + 4;
        this.ctx.beginPath();
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.moveTo(cx + 4, bottom - 6);
        this.ctx.lineTo(cx + 10, bottom);
        this.ctx.lineTo(cx + 14, top);
        this.ctx.lineTo(cx + w, top);
        this.ctx.stroke();
        if (tok.index) {
          this.drawText(tok.index, cx, top + 4, this.tiny);
        }
        this.paint(argTokens, cx + 16, y);
        cx += w + 14;
      }
    }
    return cx;
  }
  widthOf(tokens, size) {
    const old = this.fontSize;
    if (size) this.fontSize = size;
    let w = 0;
    for (const tok of tokens) {
      if (tok.type === 'text') w += this.measureText(tok.text);
      else if (tok.type === 'frac') {
        const nw = this.widthOf(tokenizeMath(tok.num));
        const dw = this.widthOf(tokenizeMath(tok.den));
        w += Math.max(nw, dw) + 14;
      } else if (tok.type === 'sup') w += this.widthOf(tokenizeMath(tok.sup), this.small) + 2;
      else if (tok.type === 'sub') w += this.widthOf(tokenizeMath(tok.sub), this.small) + 2;
      else if (tok.type === 'sqrt') w += this.widthOf(tokenizeMath(tok.arg)) + 26;
    }
    this.fontSize = old;
    return w;
  }
}

export default function CanvasMath({ formula }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const painter = new CanvasMathPainter(ctx);
    const tokens = tokenizeMath(formula);
    const width = Math.max(100, painter.widthOf(tokens) + 40);
    const height = 80;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = getComputedStyle(document.body).color;
    painter.paint(tokens, 20, height / 2 + 8);
  }, [formula]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', margin: '0.5rem auto' }}
    />
  );
}
