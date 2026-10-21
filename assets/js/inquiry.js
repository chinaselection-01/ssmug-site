/* SSMug — Inquiry form delivery (B2B quote requests)
   No framework, no tracking pixel, no build step. Drop this file on any page
   that has <form id="inquiryForm"> and it upgrades the mailto form into a
   real inbox-delivered inquiry with source tracking.

   HOW TO ACTIVATE (pick ONE, edit only the value in FORM_CONFIG):
     1) Web3Forms  (recommended — free, unlimited, 1-minute setup)
        - go to web3forms.com, sign up with bob@ssmug.com
        - you receive an access key by email
        - paste it into FORM_CONFIG.web3forms
     2) Formspree  (free tier 50/mo)
        - create a form at formspree.io, copy the form id (abcdwxyz)
        - paste it into FORM_CONFIG.formspree
     3) Leave both empty -> the form falls back to the visitor's mail app
        (mailto). It still works, but ~70% of visitors drop off at that step.

   Optional: FORM_CONFIG.worker = a self-hosted endpoint (Cloudflare Worker)
   that keeps a copy of every inquiry. Failures there never block the mail.
*/
(function () {
  'use strict';

  var FORM_CONFIG = {
    web3forms: '',      // <- paste the Web3Forms access key here
    formspree: '',      // <- paste the Formspree form id here
    worker: '',         // <- optional self-hosted archive endpoint
    email: 'bob@ssmug.com',
    whatsapp: ''        // <- optional: '+8613800000000' (digits and + only)
  };

  // Optional runtime override, e.g. a campaign-specific key without editing the file:
  //   <script>window.SSMUG_FORM_CONFIG = { web3forms: 'KEY' };</script>
  if (window.SSMUG_FORM_CONFIG && typeof window.SSMUG_FORM_CONFIG === 'object') {
    for (var ck in window.SSMUG_FORM_CONFIG) {
      if (Object.prototype.hasOwnProperty.call(window.SSMUG_FORM_CONFIG, ck)) {
        FORM_CONFIG[ck] = window.SSMUG_FORM_CONFIG[ck];
      }
    }
  }

  var form = document.getElementById('inquiryForm');
  if (!form) return;

  var statusEl = document.getElementById('formStatus');
  var btn = document.getElementById('submitBtn');
  var doneEl = document.getElementById('formDone');
  var openAt = Date.now();
  var firstTouch = 0;      // first real interaction inside the form
  var isBot = false;

  ['input', 'change', 'pointerdown', 'keydown', 'focusin'].forEach(function (evt) {
    form.addEventListener(evt, function () {
      if (!firstTouch) firstTouch = Date.now();
    }, true);
  });

  /* ---------- source tracking: which channel produced this inquiry ---------- */
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }
  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }
  function guessChannel(refHost) {
    if (!refHost) return 'direct';
    if (refHost.indexOf('tiktok') > -1) return 'tiktok';
    if (refHost.indexOf('google') > -1) return 'google';
    if (refHost.indexOf('bing') > -1) return 'bing';
    if (refHost.indexOf('facebook') > -1 || refHost.indexOf('instagram') > -1 ||
        refHost.indexOf('linkedin') > -1 || refHost.indexOf('pinterest') > -1) return 'social';
    if (refHost.indexOf('yandex') > -1) return 'yandex';
    return refHost;
  }
  function collectSource() {
    var refHost = hostOf(document.referrer);
    var utmSource = qs('utm_source');
    var channel = utmSource || guessChannel(refHost);
    return {
      channel: channel,
      utm_source: utmSource,
      utm_medium: qs('utm_medium'),
      utm_campaign: qs('utm_campaign'),
      utm_content: qs('utm_content'),
      ref: qs('ref'),
      referrer: document.referrer || 'direct',
      landing: window.location.pathname + window.location.search
    };
  }

  /* ---------- helpers ---------- */
  function setField(name, value) {
    var el = form.querySelector('[name="' + name + '"]');
    if (el) el.value = value;
  }
  function collectFields() {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'submit' || el.type === 'button') return;
      if (el.type === 'checkbox') {
        if (el.checked) {
          if (!data[el.name]) data[el.name] = [];
          data[el.name].push(el.value);
        }
      } else if (el.type !== 'radio') {
        data[el.name] = el.value;
      }
    });
    return data;
  }
  function showStatus(kind, text) {
    if (!statusEl) return;
    statusEl.className = 'form-status ' + kind;
    statusEl.textContent = text;
    statusEl.style.display = 'block';
  }
  function flatText(data) {
    var lines = [];
    Object.keys(data).forEach(function (k) {
      if (k.charAt(0) === '_' || k === 'page_ts') return;
      var v = data[k];
      if (v === '' || v == null) return;
      if (Array.isArray(v)) v = v.join(', ');
      if (k === 'message') {
        lines.push('Message: ' + v);
      } else {
        lines.push(k.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) + ': ' + v);
      }
    });
    return lines.join('\n');
  }
  function mailtoFallback(data, bodyText) {
    var subject = 'Inquiry from ' + (data.name || 'website') +
      (data.company ? ' — ' + data.company : '') +
      (data.channel ? ' [' + data.channel + ']' : '');
    var href = 'mailto:' + FORM_CONFIG.email +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(bodyText);
    window.location.href = href;
  }

  /* ---------- delivery ---------- */
  function postJson(url, payload) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.text().then(function (text) {
        var ok = res.ok;
        // both providers can answer HTTP 200 with a failure flag in the body
        try {
          var j = JSON.parse(text);
          if (j && (j.success === false || j.successful === false)) ok = false;
        } catch (e) {}
        return { ok: ok, status: res.status, text: text };
      });
    });
  }

  function deliver(data, bodyText) {
    if (FORM_CONFIG.web3forms) {
      return postJson('https://api.web3forms.com/submit', {
        access_key: FORM_CONFIG.web3forms,
        name: data.name || '',
        email: data.email || '',
        subject: 'SSMug inquiry' + (data.channel ? ' [' + data.channel + ']' : ''),
        message: bodyText,
        replyto: data.email || ''
      }).then(function (r) { return r.ok ? 'ok' : 'failed'; });
    }
    if (FORM_CONFIG.formspree) {
      return postJson('https://formspree.io/f/' + FORM_CONFIG.formspree, data)
        .then(function (r) { return r.ok ? 'ok' : 'failed'; });
    }
    return Promise.resolve('none');
  }

  function archive(data) {
    if (!FORM_CONFIG.worker) return;
    try {
      fetch(FORM_CONFIG.worker, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(function () {});
    } catch (e) {}
  }

  /* ---------- submit ---------- */
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();

    if (isBot) { ev.preventDefault(); return; }

    // spam: filled the hidden trap field
    var trap = form.querySelector('[name="_gotcha"]');
    if (trap && trap.value) { isBot = true; showStatus('ok', 'Thanks — your inquiry has been received.'); return; }
    // spam: submitted without a single interaction with the form (pure script).
    // We deliberately do NOT use a "typed too fast" rule — that would throw away
    // real buyers who paste details and hit enter. Server-side spam filtering
    // (Web3Forms) plus the trap field cover the rest.
    if (!firstTouch) { isBot = true; showStatus('ok', 'Thanks — your inquiry has been received.'); return; }

    var data = collectFields();
    var bodyText = flatText(data);

    if (!data.email || data.email.indexOf('@') < 1) {
      showStatus('err', 'Please enter a valid work email so we can reply.');
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    showStatus('busy', 'Sending your inquiry...');

    archive(data);

    deliver(data, bodyText).then(function (via) {
      if (via === 'failed') {
        if (btn) { btn.disabled = false; btn.textContent = 'Send Inquiry'; }
        showStatus('err', 'Sending failed on our side. Please email us directly at ' + FORM_CONFIG.email + ' and we will reply the same day.');
        return;
      }
      if (via === 'none') {
        // no endpoint configured -> fall back to the mail app
        if (btn) { btn.disabled = false; btn.textContent = 'Send Inquiry'; }
        showStatus('err', 'Direct sending is not active yet — opening your email app instead.');
        mailtoFallback(data, bodyText);
        return;
      }
      if (doneEl) {
        doneEl.style.display = 'block';
        var c = doneEl.querySelector('[data-ch]');
        if (c) c.textContent = data.channel || 'direct';
      }
      form.style.display = 'none';
      if (statusEl) statusEl.style.display = 'none';
      if (doneEl && doneEl.scrollIntoView) doneEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = 'Send Inquiry'; }
      showStatus('err', 'Sending failed. Please email us directly at ' + FORM_CONFIG.email + '.');
    });
  });

  /* ---------- boot ---------- */
  var src = collectSource();
  setField('channel', src.channel);
  setField('utm_source', src.utm_source);
  setField('utm_medium', src.utm_medium);
  setField('utm_campaign', src.utm_campaign);
  setField('utm_content', src.utm_content);
  setField('ref', src.ref);
  setField('referrer', src.referrer);
  setField('landing', src.landing);
  setField('page_ts', String(openAt));

  // "send again" button on the success card
  var again = document.getElementById('againBtn');
  if (again) {
    again.addEventListener('click', function () {
      form.reset();
      form.style.display = '';
      if (doneEl) doneEl.style.display = 'none';
      if (btn) { btn.disabled = false; btn.textContent = 'Send Inquiry'; }
      if (statusEl) { statusEl.style.display = 'none'; statusEl.textContent = ''; }
      var open2 = form.querySelector('input[name="name"]');
      if (open2) open2.focus();
      openAt = Date.now();
      firstTouch = 0;
    });
  }

  // mail-client fallback button (shown on error)
  var mailBtn = document.getElementById('mailFallbackBtn');
  if (mailBtn) {
    mailBtn.addEventListener('click', function () {
      var data = collectFields();
      mailtoFallback(data, flatText(data));
    });
  }
})();
