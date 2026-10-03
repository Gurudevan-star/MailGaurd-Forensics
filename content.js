(() => {
  let lastFingerprint = '';
  const ignored = new Set();
  const riskyWords = ['urgent', 'immediately', 'suspended', 'verify your account', 'password expires', 'gift card', 'wire transfer', 'crypto wallet', 'recovery phrase'];
  const brandWords = ['paypal', 'microsoft', 'google', 'amazon', 'netflix', 'facebook', 'instagram', 'bank'];

  function findMessageText() {
    const gmail = [...document.querySelectorAll('[role="main"] [dir="ltr"], .a3s.aiL')].map(node => node.innerText).join('\n');
    const outlook = [...document.querySelectorAll('[role="main"] div[role="document"], [aria-label*="Message body"]')].map(node => node.innerText).join('\n');
    return (gmail || outlook).trim();
  }

  function assess(text) {
    const lower = text.toLowerCase();
    const reasons = [];
    const foundWords = riskyWords.filter(word => lower.includes(word));
    if (foundWords.length >= 2) reasons.push('Uses several pressure or credential-related phrases: ' + foundWords.slice(0, 3).join(', ') + '.');
    if (/https?:\/\/[^\s<>]+/i.test(text) && /(verify|login|password|account|secure)/i.test(text)) reasons.push('Contains a link together with a request relating to an account, login, or password.');
    if (/\b(?:gift card|bitcoin|usdt|wire transfer|bank transfer)\b/i.test(text)) reasons.push('Requests a payment method frequently used in fraud or impersonation scams.');
    if (/\b(otp|one[- ]time password|verification code|recovery phrase)\b/i.test(text)) reasons.push('Requests a security code, OTP, or recovery phrase. Legitimate organisations generally do not ask for these by email.');
    if (/\b(?:click here|act now|within \d+ hours?|final warning)\b/i.test(text)) reasons.push('Uses urgency language intended to rush a decision.');
    const brand = brandWords.find(word => lower.includes(word));
    const urls = [...text.matchAll(/https?:\/\/([^/\s<>]+)/gi)].map(match => match[1].toLowerCase());
    if (brand && urls.some(host => host.includes(brand) === false && /login|verify|secure|account/i.test(text))) reasons.push('Mentions “' + brand + '” while directing the reader to a different web address.');
    return reasons;
  }

  function removeWarning() { document.querySelector('#mailguard-warning')?.remove(); }
  function showWarning(reasons, fingerprint) {
    if (document.querySelector('#mailguard-warning') || ignored.has(fingerprint)) return;
    const panel = document.createElement('section');
    panel.id = 'mailguard-warning';
    panel.innerHTML = `<div class="mg-icon">!</div><div class="mg-content"><div class="mg-label">MAILGUARD FORENSICS</div><h2>This email may be suspicious</h2><p>It contains patterns often used in phishing or impersonation. This warning is not proof that the message is malicious.</p><ul>${reasons.map(reason => `<li>${reason}</li>`).join('')}</ul><div class="mg-actions"><button class="mg-safe">Review carefully</button><button class="mg-bypass">I understand, dismiss warning</button></div></div>`;
    panel.querySelector('.mg-safe').onclick = removeWarning;
    panel.querySelector('.mg-bypass').onclick = () => { ignored.add(fingerprint); removeWarning(); };
    document.body.append(panel);
  }

  function scan() {
    const text = findMessageText();
    if (text.length < 30) return;
    const fingerprint = text.slice(0, 240);
    if (fingerprint === lastFingerprint) return;
    lastFingerprint = fingerprint;
    removeWarning();
    const reasons = assess(text);
    if (reasons.length) showWarning(reasons, fingerprint);
  }

  new MutationObserver(() => clearTimeout(window.__mailguardTimer) || (window.__mailguardTimer = setTimeout(scan, 700))).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(scan, 1200);
})();
