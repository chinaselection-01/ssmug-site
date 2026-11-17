/* SSMug Live Assistant — knowledge-base chat widget
 * Self-contained: no backend, no API key. Answers are grounded in ssmug.com
 * llms.txt + FAQ content. Leads are captured via mailto + clipboard fallback.
 * To use: <script src="assets/js/chat-widget.js" defer></script>
 */
(function () {
  'use strict';
  if (window.__ssmugChatLoaded) return;
  window.__ssmugChatLoaded = true;

  var EMAIL = 'bob@ssmug.com';

  // Every answer is traceable to ssmug.com/llms.txt or /faq.html.
  var KB = [
    {
      id: 'moq',
      kw: ['moq', 'minimum order', 'min order', 'minimum quantity', 'lowest order', '最小订', '起订', '起定量', 'min bestelling', 'mindestmenge'],
      answer: 'MOQ is flexible and negotiable. We handle retail, drop-shipping and custom wholesale — tell us your target quantity and we will quote the most cost-effective batch. As a guide: ODM (our 167+ models, your brand) often starts at 500–1,000 pcs; OEM (your design) often 1,000–3,000 pcs.',
      cta: 'Want a quantity-based quote?'
    },
    {
      id: 'sample',
      kw: ['sample', 'samples', 'prototype', '打样', '样品', 'muster', 'échantillon'],
      answer: 'Samples are produced in 5–7 days and shipped for your review. The sample fee is refundable against your bulk order.',
      cta: 'Need a sample?'
    },
    {
      id: 'lead',
      kw: ['lead time', 'delivery time', 'production time', 'how long', '交期', '交货', '生产周期', 'lieferzeit', 'délai'],
      answer: 'Standard lead time is 25–35 days after deposit and sample approval. Rush production is available on request — tell us your deadline and we will check the schedule.',
      cta: 'Have a deadline?'
    },
    {
      id: 'cert',
      kw: ['certif', 'fda', 'lfgb', 'sgs', 'tüv', 'tuv', 'iso 9001', 'bpa', 'compliance', 'food contact', '认证', '检测', 'zertifik', 'certificat'],
      answer: 'Our products are SGS certified, TÜV verified, ISO 9001 compliant, FDA compliant, LFGB approved and BPA free. We supply compliance files with every shipment so your goods clear customs smoothly.',
      cta: 'Need the compliance file list?'
    },
    {
      id: 'oem',
      kw: ['oem', 'odm', 'private label', 'own brand', 'custom logo', 'custom brand', '贴牌', '代工', '自有品牌', '定制logo'],
      answer: 'Both. OEM (your design, our line): MOQ often 1,000–3,000 pcs, 25–40 days. ODM (our 167+ existing models, your logo): lower MOQ, often 500–1,000 pcs, 20–30 days. We sign an NDA and provide 2D/3D drawings for confirmation.',
      cta: 'Which route fits you — OEM or ODM?'
    },
    {
      id: 'factory',
      kw: ['factory', 'manufacturer', 'trading company', 'real factory', '工厂', '厂家', '贸易商', 'usine', 'fabrik'],
      answer: 'We are a factory-backed manufacturer, not a trading company — Yongkang STWADD Houseware Co., Ltd., in Yongkang, Zhejiang, China (the Jinhua–Yongkang drinkware cluster). We have in-house mold making, logo printing and assembly.',
      cta: 'Want a factory overview or video?'
    },
    {
      id: 'capacity',
      kw: ['capacity', 'monthly', 'units per month', 'production line', '产能', '月产', 'kapazität'],
      answer: 'We produce 500,000+ units per month across multiple automated lines with robotic assistance, and launch 50+ new designs each year.',
      cta: 'Tell us your volume'
    },
    {
      id: 'shipping',
      kw: ['shipping', 'freight', 'customs', 'fob', 'port', 'logistics', 'delivery port', '发货', '港口', '物流', '报关', 'versand', 'expédition'],
      answer: 'We run AQL inspection, supply compliance files and arrange freight to your port — typically FOB Ningbo or FOB Shanghai.',
      cta: 'Which destination port?'
    },
    {
      id: 'countries',
      kw: ['countries', 'markets', 'which country', 'export to', '国家', '出口', 'pays', 'länder'],
      answer: 'We ship to 50+ countries and exhibit at HOMELIFE trade shows in Jakarta, Dubai and Warsaw. We also met LOTTE Mart Indonesia buyers in December 2024.',
      cta: 'Which market are you sourcing for?'
    },
    {
      id: 'ip',
      kw: ['intellectual property', 'ip protection', 'nda', 'mold ownership', 'design protect', 'trademark', '专利', '模具', '知识产权', '保密'],
      answer: 'We sign an NDA before any drawing is shared, specify mold ownership in the agreement, and release full technical files only to the factory awarded the order. We also recommend registering your trademark in China.',
      cta: 'Have a design to protect?'
    },
    {
      id: 'products',
      kw: ['product', 'catalog', 'tumbler', 'bottle', 'mug', 'flask', 'lunch box', 'growler', 'can cup', '产品', '杯子', '保温杯', 'prodotti', 'produkt'],
      answer: 'Insulated stainless bottles, tumblers & can cups, coffee mugs & camp cups, beer steins, wine flasks, BPA-free plastic bottles and insulated lunch boxes — 167+ existing models to start from. Full catalog: ssmug.com/products.html',
      cta: 'Which product line interests you?'
    },
    {
      id: 'price',
      kw: ['price', 'pricing', 'cost', 'quote', 'quotation', 'how much', 'rate', '价格', '报价', '多少钱', 'preis', 'prix'],
      answer: 'Pricing depends on model, quantity, finish and packaging — I do not want to guess and give you a wrong number. Send your target item and quantity and our sourcing team will come back with a real quote.',
      cta: 'Get a quote'
    },
    {
      id: 'custom',
      kw: ['custom', 'customize', 'logo', 'color', 'colour', 'finish', 'packaging', 'powder coat', 'laser', '定制', '颜色', '包装'],
      answer: 'We customize logo, color, shape, surface finish and packaging. Decoration options include laser engraving, screen print, heat transfer, sublimation and powder coat — we will advise on durability, MOQ and food-contact safety for your design.',
      cta: 'Describe your custom idea'
    },
    {
      id: 'quality',
      kw: ['quality', 'qc', 'aql', 'inspection', 'defect', 'vacuum', '保温效果', '质量', '验货', 'qualité'],
      answer: 'Every order goes through AQL inspection and vacuum performance testing, with compliance files supplied. We can share our QC process and inspection standard before you place an order.',
      cta: 'Want our QC checklist?'
    },
    {
      id: 'contact',
      kw: ['contact', 'email', 'reach you', 'talk to', 'sales', '联系', '邮箱', 'kontakt'],
      answer: 'You can reach our sourcing team directly at ' + EMAIL + ' — or just leave your details here and I will package them into a ready-to-send email for you.',
      cta: 'Leave your contact'
    },
    {
      id: 'greet',
      kw: ['hello', 'hi ', 'hey', '你好', '您好', 'good morning', 'good afternoon'],
      answer: 'Hi — I am the SSMug assistant. I can answer questions about MOQ, samples, lead time, certifications, OEM/ODM, shipping and our factory. What would you like to know?',
      cta: ''
    }
  ];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function normalize(s) {
    var raw = String(s).toLowerCase().replace(/<[^>]*>/g, ' ');
    // Unicode property escapes need modern browsers; fall back to ASCII-safe stripping.
    try {
      raw = raw.replace(/[^\p{L}\p{N}\s]/gu, ' ');
    } catch (e) {
      raw = raw.replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, ' ');
    }
    return (' ' + raw + ' ').replace(/\s+/g, ' ');
  }

  function matchIntent(text) {
    var t = normalize(text), best = null, bestScore = 0;
    // Price/quote intent wins over product-name mentions: "price for 1000 mugs" is a price question.
    var priceRe = /( price | pricing | cost | quote | quotation | how much | 价格 | 报价 | 多少钱 | preis | prix )/;
    var isPrice = priceRe.test(t);
    for (var i = 0; i < KB.length; i++) {
      var item = KB[i], score = 0;
      for (var j = 0; j < item.kw.length; j++) {
        if (t.indexOf(' ' + item.kw[j] + ' ') !== -1 || t.indexOf(item.kw[j]) !== -1) {
          score += item.kw[j].indexOf(' ') !== -1 ? 3 : 2;
        }
      }
      if (item.id === 'price' && isPrice) score += 20;
      if (item.id === 'products' && isPrice) continue;
      if (score > bestScore) { bestScore = score; best = item; }
    }
    return bestScore >= 2 ? best : null;
  }

  // --- injected UI -------------------------------------------------------
  var css = [
    '#scm{position:fixed;right:22px;bottom:22px;z-index:9999;font-family:Manrope,Arial,sans-serif}',
    '#scm *{box-sizing:border-box}',
    '#scm-launch{width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;background:#a9792f;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;transition:transform .3s cubic-bezier(.22,1,.36,1)}',
    '#scm-launch:hover{transform:translateY(-3px) scale(1.04)}',
    '#scm-launch svg{width:26px;height:26px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '#scm-badge{position:absolute;top:-3px;right:-3px;background:#16181d;color:#fff;font-size:10px;font-weight:700;letter-spacing:.3px;padding:3px 7px;border-radius:10px;border:2px solid #fff}',
    '#scm-panel{position:absolute;right:0;bottom:72px;width:380px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 110px);background:#fff;border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.28);overflow:hidden;display:none;flex-direction:column;transform-origin:bottom right;animation:scmIn .35s cubic-bezier(.22,1,.36,1)}',
    '#scm-panel.open{display:flex}',
    '@keyframes scmIn{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}',
    '#scm-head{background:#16181d;color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}',
    '#scm-logo{width:34px;height:34px;border-radius:9px;background:#a9792f;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:600;font-size:15px;flex-shrink:0}',
    '#scm-head b{font-size:14px;line-height:1.2;display:block}',
    '#scm-head small{font-size:11px;color:#9aa0aa;display:flex;align-items:center;gap:6px;margin-top:2px}',
    '#scm-dot{width:7px;height:7px;border-radius:50%;background:#4ec98b;display:inline-block}',
    '#scm-close{margin-left:auto;background:none;border:0;color:#9aa0aa;font-size:22px;cursor:pointer;line-height:1;padding:4px}',
    '#scm-log{flex:1;overflow-y:auto;padding:18px 16px;background:#faf9f7;scroll-behavior:smooth}',
    '.scm-msg{margin-bottom:14px;max-width:88%;line-height:1.55;font-size:13px;clear:both}',
    '.scm-msg.bot{background:#fff;border:1px solid #ece8e1;padding:11px 13px;border-radius:4px 13px 13px 13px;color:#2a2d33;float:left}',
    '.scm-msg.me{background:#16181d;color:#fff;padding:11px 13px;border-radius:13px 4px 13px 13px;float:right}',
    '.scm-msg b{color:#a9792f}',
    '.scm-chips{clear:both;display:flex;flex-wrap:wrap;gap:7px;margin:2px 0 16px}',
    '.scm-chip{border:1px solid #d9d2c6;background:#fff;color:#5c5346;border-radius:20px;padding:7px 11px;font-size:11.5px;cursor:pointer;transition:all .2s}',
    '.scm-chip:hover{border-color:#a9792f;color:#a9792f}',
    '#scm-typing{float:left;background:#fff;border:1px solid #ece8e1;padding:12px 14px;border-radius:4px 13px 13px 13px;display:none}',
    '#scm-typing i{width:6px;height:6px;border-radius:50%;background:#b9b2a6;display:inline-block;margin:0 2px;animation:scmDot 1.1s infinite}',
    '#scm-typing i:nth-child(2){animation-delay:.18s}#scm-typing i:nth-child(3){animation-delay:.36s}',
    '@keyframes scmDot{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}',
    '#scm-form{display:none;clear:both;background:#fff;border:1px solid #e2ddd3;border-radius:12px;padding:14px;margin:4px 0 12px}',
    '#scm-form h4{margin:0 0 10px;font-size:13px;color:#16181d}',
    '#scm-form input,#scm-form textarea{width:100%;border:1px solid #e0dbd1;border-radius:7px;padding:8px 10px;font-size:12px;font-family:inherit;margin-bottom:7px;outline:none;background:#fff;color:#16181d}',
    '#scm-form input:focus,#scm-form textarea:focus{border-color:#a9792f}',
    '#scm-form textarea{resize:vertical;min-height:54px}',
    '#scm-send{width:100%;border:0;background:#a9792f;color:#fff;border-radius:7px;padding:10px;font-size:12px;font-weight:700;cursor:pointer}',
    '#scm-foot{border-top:1px solid #efeae1;padding:10px 12px;background:#fff;display:flex;gap:8px;flex-shrink:0;align-items:center}',
    '#scm-input{flex:1;border:1px solid #e0dbd1;border-radius:22px;padding:10px 14px;font-size:13px;font-family:inherit;outline:none;color:#16181d}',
    '#scm-input:focus{border-color:#a9792f}',
    '#scm-submit{width:38px;height:38px;border-radius:50%;border:0;background:#16181d;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '#scm-submit svg{width:17px;height:17px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '#scm-credit{text-align:center;font-size:10px;color:#a9a29a;padding:0 0 8px;background:#fff;flex-shrink:0}',
    '@media(max-width:480px){#scm-panel{width:calc(100vw - 32px);height:70vh}}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.id = 'scm';
  root.innerHTML =
    '<div id="scm-panel" role="dialog" aria-label="SSMug live assistant">' +
      '<div id="scm-head"><div id="scm-logo">S</div><div><b>SSMug Assistant</b><small><span id="scm-dot"></span>Online · replies 24/7</small></div>' +
      '<button id="scm-close" aria-label="Close chat">&times;</button></div>' +
      '<div id="scm-log" aria-live="polite"></div>' +
      '<div id="scm-foot"><input id="scm-input" placeholder="Ask about MOQ, samples, lead time..." aria-label="Type a message">' +
      '<button id="scm-submit" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button></div>' +
      '<div id="scm-credit">Answers from ssmug.com knowledge base</div>' +
    '</div>' +
    '<button id="scm-launch" aria-label="Open chat">' +
      '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/></svg>' +
      '<span id="scm-badge">ASK US</span>' +
    '</button>';
  document.body.appendChild(root);

  var panel = document.getElementById('scm-panel');
  var log = document.getElementById('scm-log');
  var input = document.getElementById('scm-input');
  var formNode = null;

  function scroll() { log.scrollTop = log.scrollHeight; }
  function addBot(html) {
    var d = document.createElement('div');
    d.className = 'scm-msg bot';
    d.innerHTML = html;
    log.appendChild(d); scroll();
    return d;
  }
  function addMe(text) {
    var d = document.createElement('div');
    d.className = 'scm-msg me';
    d.textContent = text;
    log.appendChild(d); scroll();
  }
  function chips(labels) {
    var wrap = document.createElement('div');
    wrap.className = 'scm-chips';
    labels.forEach(function (label) {
      var b = document.createElement('button');
      b.className = 'scm-chip';
      b.textContent = label;
      b.onclick = function () { send(label); };
      wrap.appendChild(b);
    });
    log.appendChild(wrap); scroll();
  }
  function typing(on) { document.getElementById('scm-typing').style.display = on ? 'block' : 'none'; }

  var typingNode = document.createElement('div');
  typingNode.id = 'scm-typing';
  typingNode.innerHTML = '<i></i><i></i><i></i>';
  log.appendChild(typingNode);

  function reply(text) {
    typing(true);
    setTimeout(function () {
      typing(false);
      var hit = matchIntent(text);
      var q = normalize(text);
      if (hit) {
        var cta = hit.cta || 'Need more detail?';
        if (/price|quote|样品|sample|custom|deadline|port|market|protect|qc|compliance|factory overview|logo|contact/i.test(text + ' ' + hit.id)) {
          addBot(esc(hit.answer) + '<br><br>' + esc(cta));
          showLeadForm(hit.id);
        } else {
          addBot(esc(hit.answer) + '<br><br>' + esc(cta));
          chips(['Get a quote', 'Sample cost', 'Lead time', 'Certifications']);
        }
      } else if (/question|help|what|how|can you|do you|\?/.test(q) || text.length > 12) {
        addBot('I am not fully sure about that one — I only answer from our verified product and factory information so I do not give you a wrong number. Our sourcing team can answer it properly. Leave your details and I will wrap them into a ready-to-send email.');
        showLeadForm('other');
      } else {
        addBot('Try asking me about <b>MOQ</b>, <b>samples</b>, <b>lead time</b>, <b>certifications</b>, <b>OEM/ODM</b>, <b>shipping</b> or our <b>factory</b>.');
        chips(['MOQ', 'Sample cost', 'Lead time', 'Certifications', 'OEM vs ODM']);
      }
    }, 420);
  }

  function showLeadForm(topic) {
    if (formNode) { formNode.remove(); }
    formNode = document.createElement('div');
    formNode.id = 'scm-form';
    formNode.innerHTML =
      '<h4>Leave your details</h4>' +
      '<input id="scm-f-name" placeholder="Your name *">' +
      '<input id="scm-f-email" type="email" placeholder="Work email *">' +
      '<input id="scm-f-country" placeholder="Country / market">' +
      '<input id="scm-f-qty" placeholder="Target quantity (pcs)">' +
      '<textarea id="scm-f-msg" placeholder="Your message / question">' +
      (topic && topic !== 'other' ? '' : '') + '</textarea>' +
      '<button id="scm-send" type="button">Prepare my inquiry →</button>';
    log.appendChild(formNode); scroll();
    document.getElementById('scm-send').onclick = function () { submitLead(topic); };
  }

  function submitLead(topic) {
    var name = document.getElementById('scm-f-name').value.trim();
    var email = document.getElementById('scm-f-email').value.trim();
    var country = document.getElementById('scm-f-country').value.trim();
    var qty = document.getElementById('scm-f-qty').value.trim();
    var msg = document.getElementById('scm-f-msg').value.trim();
    if (!name || !email) {
      addBot('Please add your <b>name</b> and <b>work email</b> so our team can reply.');
      return;
    }
    var subject = 'SSMug inquiry' + (topic && topic !== 'other' ? ' — ' + topic.toUpperCase() : '');
    var body = 'Name: ' + name + '\nEmail: ' + email + '\nCountry: ' + (country || '-') +
      '\nTarget qty: ' + (qty || '-') + '\nTopic: ' + (topic || '-') + '\n\nMessage:\n' + (msg || '-');
    var mailto = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText('To: ' + EMAIL + '\nSubject: ' + subject + '\n\n' + body).catch(function () {});
    }
    if (formNode) { formNode.remove(); formNode = null; }
    addBot('Thanks, ' + esc(name.split(' ')[0]) + '. I have prepared your inquiry for <b>' + EMAIL + '</b> and copied it to your clipboard. Your mail app should open now — just press send. If it does not, paste the copied text into an email to that address.');
    var a = document.createElement('a');
    a.href = mailto; a.style.display = 'none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  function send(text) {
    text = (text || input.value).trim();
    if (!text) return;
    input.value = '';
    addMe(text);
    reply(text);
  }

  document.getElementById('scm-launch').onclick = function () {
    var open = panel.classList.toggle('open');
    document.getElementById('scm-badge').style.display = open ? 'none' : 'block';
    if (open && !log.dataset.greeted) {
      log.dataset.greeted = '1';
      addBot('Hi — I am the SSMug assistant. Ask me about <b>MOQ</b>, <b>samples</b>, <b>lead time</b>, <b>certifications</b> or <b>OEM/ODM</b>. I answer from our verified factory info.');
      chips(['What is your MOQ?', 'Sample cost & time', 'Lead time?', 'Certifications?']);
    }
    input.focus();
  };
  document.getElementById('scm-close').onclick = function () {
    panel.classList.remove('open');
    document.getElementById('scm-badge').style.display = 'block';
  };
  document.getElementById('scm-submit').onclick = function () { send(); };
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
})();
