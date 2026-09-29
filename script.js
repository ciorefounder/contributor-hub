
  (function () {
    var pages = document.querySelectorAll('.page');
    var validRoutes = [];
    pages.forEach(function (p) { validRoutes.push(p.dataset.page); });

    var currentRoute = null;

    function showPage(route) {
      if (validRoutes.indexOf(route) === -1) {
        // Page not built yet -- do nothing (stay on current page).
        return false;
      }
      pages.forEach(function (p) {
        p.classList.toggle('active', p.dataset.page === route);
      });
      currentRoute = route;
      // The page sets scroll-behavior: smooth globally, and per spec a JS
      // scrollTo behavior of "auto" defers to that CSS value rather than
      // forcing an instant jump. Use "instant" here so every route change
      // lands at the top without a visible scroll animation.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          window.scrollTo({ top: 0, behavior: 'instant' });
        });
      });
      return true;
    }

    function routeFromHash() {
      var hash = window.location.hash.replace('#', '');
      return hash || 'home';
    }

    // Handle every internal link that points to a hash route.
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var route = link.getAttribute('href').slice(1);
      if (!route) return;
      if (validRoutes.indexOf(route) !== -1) {
        e.preventDefault();
        window.location.hash = route;
        showPage(route);
      }
      // If the route isn't a built page yet, let the hash update
      // normally but nothing will visually change until that page exists.
    });

    window.addEventListener('hashchange', function () {
      showPage(routeFromHash());
    });

    // Back to top control: scrolls the current page to the top.
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-scroll-top]');
      if (!btn) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initial load: honor a direct link like file.html#start-your-onboarding
    currentRoute = routeFromHash();
    showPage(currentRoute);
  })();

  (function () {
    var form = document.getElementById('tips-form');
    if (!form) return; // page not present, nothing to wire up

    var ENDPOINT = 'https://script.google.com/macros/s/AKfycbzi0Z1SlDKRU3qf5iggyVDfuHUI_Ju-feW5AjTLPo4QqofbeeuQwVdGYkLeuccsc83f/exec';

    var errorBox = document.getElementById('tips-form-error');
    var successBlock = document.getElementById('tips-success');
    var submitBtn = document.getElementById('tf-submit');
    var submitLabel = document.getElementById('tf-submit-label');
    var sendingNote = document.getElementById('tf-sending-note');
    var submitAnotherBtn = document.getElementById('tf-submit-another');
    var nameInput = document.getElementById('tf-name');
    var emailInput = document.getElementById('tf-email');
    var anonRadios = form.querySelectorAll('input[name="Anonymous Submission"]');

    function clearErrors() {
      errorBox.innerHTML = '';
      errorBox.classList.remove('visible');
    }

    function showErrors(messages) {
      errorBox.innerHTML = '';
      if (messages.length === 1) {
        var p = document.createElement('p');
        p.textContent = messages[0];
        errorBox.appendChild(p);
      } else {
        var ul = document.createElement('ul');
        messages.forEach(function (msg) {
          var li = document.createElement('li');
          li.textContent = msg;
          ul.appendChild(li);
        });
        errorBox.appendChild(ul);
      }
      errorBox.classList.add('visible');
      errorBox.focus();
    }

    function isAnonymous() {
      var checked = form.querySelector('input[name="Anonymous Submission"]:checked');
      return !!checked && checked.value === 'Yes';
    }

    function syncAnonymousFields() {
      if (isAnonymous()) {
        nameInput.value = '';
        emailInput.value = '';
        nameInput.disabled = true;
        emailInput.disabled = true;
      } else {
        nameInput.disabled = false;
        emailInput.disabled = false;
      }
    }

    anonRadios.forEach(function (radio) {
      radio.addEventListener('change', syncAnonymousFields);
    });

    function validate(formData) {
      var errors = [];
      if (!formData.get('Submission Type')) {
        errors.push('Please select a submission type.');
      }
      var anon = formData.get('Anonymous Submission');
      if (!anon) {
        errors.push('Please choose whether to include your details or stay anonymous.');
      }
      var wantsResponse = formData.get('Would You Like a Response');
      if (!wantsResponse) {
        errors.push('Please let us know if you would like a response.');
      }
      var details = (formData.get('Details') || '').toString().trim();
      if (!details) {
        errors.push('Please share some details.');
      }
      var email = (formData.get('Email Address') || '').toString().trim();
      if (wantsResponse === 'Yes' && anon !== 'Yes' && !email) {
        errors.push('Please include an email address so we can respond.');
      }
      return errors;
    }

    function setSending(isSending) {
      submitBtn.disabled = isSending;
      sendingNote.hidden = !isSending;
      submitLabel.textContent = isSending ? 'Sending…' : 'Send Submission';
    }

    function showSuccess() {
      form.hidden = true;
      successBlock.classList.add('visible');
      successBlock.focus();
    }

    function showForm() {
      successBlock.classList.remove('visible');
      form.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      // Belt-and-suspenders: clear anonymous fields right before building the submission.
      syncAnonymousFields();

      var formData = new FormData(form);
      if (isAnonymous()) {
        formData.set('Name', '');
        formData.set('Email Address', '');
      }

      var errors = validate(formData);
      if (errors.length) {
        showErrors(errors);
        return;
      }

      setSending(true);

      fetch(ENDPOINT, {
        method: 'POST',
        body: formData
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          setSending(false);
          if (data && data.result === 'success') {
            showSuccess();
          } else {
            showErrors([(data && data.message) || 'Something went wrong. Please try again.']);
          }
        })
        .catch(function () {
          setSending(false);
          showErrors(['We could not send your submission right now. Please check your connection and try again. If the issue continues, contact the founder through an approved private route.']);
        });
    });

    submitAnotherBtn.addEventListener('click', function () {
      form.reset();
      nameInput.disabled = false;
      emailInput.disabled = false;
      clearErrors();
      showForm();
      var firstField = document.getElementById('tf-submission-type');
      if (firstField) firstField.focus();
    });
  })();

  (function () {
    var HUB_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxUtcJ4k4rlGMNhBZwjdv2x2kT4r1bcznV-8YqAQgKA0tS9jnjp-O2QSV0MdpcdHRtJ/exec';
    var SESSION_KEY = 'cioreHubSession';

    var gate = document.getElementById('gate');
    var app = document.getElementById('app');
    var pwInput = document.getElementById('pwUsername');
    var gateBtn = document.getElementById('gateBtn');
    var gateBtnLabel = document.getElementById('gateBtnLabel');
    var gateErr = document.getElementById('gateErr');
    var logoutBtn = document.getElementById('logoutBtn');
    var adminBadge = document.getElementById('cioreAdminBadge');

    var raModal = document.getElementById('requestAccessModal');
    var raModalCloseX = document.getElementById('raModalCloseX');
    var gateRequestBtn = document.getElementById('gateRequestBtn');
    var raFormWrap = document.getElementById('raFormWrap');
    var raSuccessWrap = document.getElementById('raSuccessWrap');
    var raForm = document.getElementById('raForm');
    var raFormError = document.getElementById('raFormError');
    var raSubmitBtn = document.getElementById('raSubmitBtn');
    var raSubmitLabel = document.getElementById('raSubmitLabel');
    var raCloseSuccessBtn = document.getElementById('raCloseSuccessBtn');

    window.cioreCurrentUser = { id: '', name: '', role: '' };
    var cioreDirectoryCache = null; // in-memory only, cleared on logout

    /* ---------- small visibility helpers ---------- */
    function show(el) { if (el) el.classList.remove('is-hidden'); }
    function hide(el) { if (el) el.classList.add('is-hidden'); }

    /* ---------- gate error ---------- */
    function showGateError(message) {
      gateErr.textContent = message;
      show(gateErr);
      pwInput.setAttribute('aria-invalid', 'true');
    }
    function hideGateError() {
      gateErr.textContent = '';
      hide(gateErr);
      pwInput.removeAttribute('aria-invalid');
    }

    /* ---------- app / gate visibility ---------- */
    function showApp() {
      hide(gate);
      show(app);
    }
    function showGateOnly() {
      hide(app);
      show(gate);
    }

    /* ---------- route helpers (reuses the Hub's existing hash router) ---------- */
    function goHome() {
      var before = window.location.hash;
      window.location.hash = 'home';
      if (window.location.hash === before) {
        // Hash string didn't actually change (e.g. was already '#home');
        // the router only reacts to a real hashchange event, so nudge it.
        window.dispatchEvent(new Event('hashchange'));
      }
    }
    function currentRoute() {
      return (window.location.hash || '#home').replace('#', '') || 'home';
    }

    /* ---------- current user / admin visibility ---------- */
    function setCurrentUser(user) {
      window.cioreCurrentUser = {
        id: user.id || '',
        name: user.name || '',
        role: user.role || ''
      };
      applyAdminVisibility();
    }
    function clearCurrentUser() {
      window.cioreCurrentUser = { id: '', name: '', role: '' };
      applyAdminVisibility();
    }
    function applyAdminVisibility() {
      var isAdmin = window.cioreCurrentUser.role === 'admin';
      if (adminBadge) adminBadge.classList.toggle('is-hidden', !isAdmin);
      document.querySelectorAll('[data-admin-only]').forEach(function (el) {
        el.classList.toggle('is-hidden', !isAdmin);
      });
    }

    /* ---------- session ---------- */
    function saveSession(user) {
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } catch (e) { /* sessionStorage unavailable; session simply won't persist across reloads */ }
    }
    function clearSession() {
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch (e) { /* ignore */ }
    }
    function restoreSession() {
      var raw;
      try {
        raw = sessionStorage.getItem(SESSION_KEY);
      } catch (e) {
        return false;
      }
      if (!raw) return false;
      var user;
      try {
        user = JSON.parse(raw);
      } catch (e) {
        return false;
      }
      if (!user || !user.id || !user.role) return false;
      setCurrentUser(user);
      showApp();
      maybeLoadDirectoryForCurrentRoute();
      return true;
    }

    /* ---------- login ---------- */
    window.tryUnlock = function () {
      var code = (pwInput.value || '').trim();
      hideGateError();

      if (!code) {
        showGateError('Please enter your access code.');
        return;
      }

      gateBtn.disabled = true;
      gateBtnLabel.textContent = 'Checking access…';

      var url = HUB_ENDPOINT + '?action=login&username=' + encodeURIComponent(code);

      fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          gateBtn.disabled = false;
          gateBtnLabel.textContent = 'Enter Hub';

          if (data && data.success && data.user) {
            var user = {
              id: data.user.id || '',
              name: data.user.name || '',
              role: data.user.role || ''
            };
            saveSession(user);
            setCurrentUser(user);
            pwInput.value = '';
            hideGateError();
            showApp();
            goHome();
          } else {
            showGateError((data && data.error) || 'Access code not recognised.');
          }
        })
        .catch(function () {
          gateBtn.disabled = false;
          gateBtnLabel.textContent = 'Enter Hub';
          showGateError('We could not verify access right now. Please check your connection and try again.');
        });
    };

    pwInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.tryUnlock();
      }
    });

    /* ---------- logout ---------- */
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        clearSession();
        clearCurrentUser();
        cioreDirectoryCache = null;
        pwInput.value = '';
        hideGateError();
        goHome();
        showGateOnly();
      });
    }

    /* ---------- request access modal ---------- */
    function getFocusableInModal() {
      return Array.prototype.slice.call(
        raModal.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')
      ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    }

    function onModalKeydown(e) {
      if (e.key === 'Escape') {
        closeRequestModal();
        return;
      }
      if (e.key === 'Tab') {
        var focusable = getFocusableInModal();
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function resetRequestForm() {
      raForm.reset();
      raFormError.textContent = '';
      hide(raFormError);
      raSubmitBtn.disabled = false;
      raSubmitLabel.textContent = 'Request Access';
      show(raFormWrap);
      hide(raSuccessWrap);
    }

    function openRequestModal() {
      resetRequestForm();
      show(raModal);
      var firstField = document.getElementById('ra-firstName');
      if (firstField) firstField.focus();
      document.addEventListener('keydown', onModalKeydown);
    }
    function closeRequestModal() {
      hide(raModal);
      document.removeEventListener('keydown', onModalKeydown);
      if (gateRequestBtn) gateRequestBtn.focus();
    }

    if (gateRequestBtn) gateRequestBtn.addEventListener('click', openRequestModal);
    if (raModalCloseX) raModalCloseX.addEventListener('click', closeRequestModal);
    if (raCloseSuccessBtn) raCloseSuccessBtn.addEventListener('click', closeRequestModal);
    if (raModal) {
      raModal.addEventListener('click', function (e) {
        if (e.target === raModal) closeRequestModal();
      });
    }

    function showRequestFormError(message) {
      raFormError.textContent = message;
      show(raFormError);
      raFormError.focus();
    }

    function validateRequestForm(formData) {
      var errors = [];
      if (!(formData.get('firstName') || '').toString().trim()) errors.push('Please enter your first name.');
      if (!(formData.get('lastName') || '').toString().trim()) errors.push('Please enter your last name.');
      if (!(formData.get('role') || '').toString().trim()) errors.push('Please enter your role.');
      return errors;
    }

    if (raForm) {
      raForm.addEventListener('submit', function (e) {
        e.preventDefault();
        raFormError.textContent = '';
        hide(raFormError);

        var formData = new FormData(raForm);
        var errors = validateRequestForm(formData);
        if (errors.length) {
          showRequestFormError(errors.join(' '));
          return;
        }

        raSubmitBtn.disabled = true;
        raSubmitLabel.textContent = 'Sending…';

        fetch(HUB_ENDPOINT, {
          method: 'POST',
          body: formData
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            raSubmitBtn.disabled = false;
            raSubmitLabel.textContent = 'Request Access';
            if (data && (data.success === true || data.result === 'success')) {
              hide(raFormWrap);
              show(raSuccessWrap);
              raSuccessWrap.focus();
            } else {
              showRequestFormError((data && (data.error || data.message)) || 'We could not submit your request right now. Please try again.');
            }
          })
          .catch(function () {
            raSubmitBtn.disabled = false;
            raSubmitLabel.textContent = 'Request Access';
            showRequestFormError('We could not submit your request right now. Please check your connection and try again.');
          });
      });
    }

    /* ============================================================
       CONTRIBUTOR DIRECTORY
       ============================================================ */
    var cdSearch = document.getElementById('cdSearch');
    var cdRoleFilter = document.getElementById('cdRoleFilter');
    var cdResultCount = document.getElementById('cdResultCount');
    var cdGrid = document.getElementById('cdGrid');
    var cdLoading = document.getElementById('cdLoading');
    var cdError = document.getElementById('cdError');
    var cdEmpty = document.getElementById('cdEmpty');
    var cdNoResults = document.getElementById('cdNoResults');
    var cdClearBtn = document.getElementById('cdClearBtn');

    function fieldOrNotListed(value) {
      var s = (value === null || value === undefined) ? '' : String(value).trim();
      return s ? s : 'Not listed';
    }

    function setDirectoryState(state) {
      hide(cdLoading); hide(cdError); hide(cdEmpty); hide(cdNoResults); hide(cdGrid);
      if (state === 'loading') show(cdLoading);
      else if (state === 'error') show(cdError);
      else if (state === 'empty') show(cdEmpty);
      else if (state === 'no-results') show(cdNoResults);
      else if (state === 'results') show(cdGrid);
    }

    function clearChildren(el) {
      while (el.firstChild) el.removeChild(el.firstChild);
    }

    function buildDirectoryCard(c) {
      var card = document.createElement('div');
      card.className = 'cd-card';

      var fullName = ((c.FirstName || '') + ' ' + (c.LastName || '')).trim();
      var name = document.createElement('h3');
      name.textContent = fullName ? fullName : 'Not listed';
      card.appendChild(name);

      var role = document.createElement('p');
      role.className = 'cd-role';
      role.textContent = fieldOrNotListed(c.Role);
      card.appendChild(role);

      function addRow(label, value) {
        var row = document.createElement('div');
        row.className = 'cd-row';
        var l = document.createElement('span');
        l.className = 'cd-row-label';
        l.textContent = label;
        var v = document.createElement('span');
        v.className = 'cd-row-value';
        v.textContent = fieldOrNotListed(value);
        row.appendChild(l);
        row.appendChild(v);
        card.appendChild(row);
      }

      addRow('Skills', c.Skills);
      addRow('Interested in learning', c.InterestedInLearning);
      addRow('Resources they can share', c.ResourcesTheyCanShare);

      return card;
    }

    function populateRoleFilter(list) {
      var current = cdRoleFilter.value || 'all';
      var seen = {};
      var roles = [];
      list.forEach(function (c) {
        var r = (c.Role || '').trim();
        if (r && !seen[r]) {
          seen[r] = true;
          roles.push(r);
        }
      });
      roles.sort();

      clearChildren(cdRoleFilter);
      var allOpt = document.createElement('option');
      allOpt.value = 'all';
      allOpt.textContent = 'All roles';
      cdRoleFilter.appendChild(allOpt);

      roles.forEach(function (r) {
        var opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        cdRoleFilter.appendChild(opt);
      });

      cdRoleFilter.value = roles.indexOf(current) !== -1 || current === 'all' ? current : 'all';
    }

    function getFilteredDirectory() {
      var q = (cdSearch.value || '').toLowerCase().trim();
      var role = cdRoleFilter.value || 'all';

      return (cioreDirectoryCache || []).filter(function (c) {
        if (role !== 'all' && (c.Role || '').trim() !== role) return false;
        if (!q) return true;
        var haystack = [c.FirstName, c.LastName, c.Role, c.Skills, c.InterestedInLearning, c.ResourcesTheyCanShare]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.indexOf(q) !== -1;
      });
    }

    function renderDirectoryResults() {
      if (!cioreDirectoryCache) return;

      if (cioreDirectoryCache.length === 0) {
        cdResultCount.textContent = '';
        setDirectoryState('empty');
        return;
      }

      var filtered = getFilteredDirectory();
      clearChildren(cdGrid);

      if (filtered.length === 0) {
        cdResultCount.textContent = '0 contributors';
        setDirectoryState('no-results');
        return;
      }

      cdResultCount.textContent = filtered.length + (filtered.length === 1 ? ' contributor' : ' contributors');
      filtered.forEach(function (c) {
        cdGrid.appendChild(buildDirectoryCard(c));
      });
      setDirectoryState('results');
    }

    function parseDirectoryResponse(data) {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.contributors)) return data.contributors;
      if (data && Array.isArray(data.data)) return data.data;
      return null;
    }

    window.loadDirectory = function () {
      if (!cdGrid) return; // Directory page not present

      if (cioreDirectoryCache) {
        populateRoleFilter(cioreDirectoryCache);
        renderDirectoryResults();
        return;
      }

      cdResultCount.textContent = '';
      setDirectoryState('loading');

      fetch(HUB_ENDPOINT + '?action=getDirectoryContributors')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var list = parseDirectoryResponse(data);
          if (!list) {
            setDirectoryState('error');
            return;
          }
          cioreDirectoryCache = list;
          populateRoleFilter(list);
          renderDirectoryResults();
        })
        .catch(function () {
          setDirectoryState('error');
        });
    };

    if (cdSearch) cdSearch.addEventListener('input', renderDirectoryResults);
    if (cdRoleFilter) cdRoleFilter.addEventListener('change', renderDirectoryResults);
    if (cdClearBtn) {
      cdClearBtn.addEventListener('click', function () {
        cdSearch.value = '';
        cdRoleFilter.value = 'all';
        renderDirectoryResults();
      });
    }

    function maybeLoadDirectoryForCurrentRoute() {
      if (currentRoute() === 'contributor-directory' && window.cioreCurrentUser.id) {
        window.loadDirectory();
      }
    }

    window.addEventListener('hashchange', maybeLoadDirectoryForCurrentRoute);

    /* ---------- init ---------- */
    restoreSession();
  })();

  (function () {
    /* Cross-page "jump to a subsection on another page" helper.
       Used by links such as The Phone's closing button, which routes to
       #working-on-now and then scrolls to a subsection within it.
       Reuses the existing hash-routing click handling; this only adds the
       follow-up scroll once the target page is visible. A short corrective
       re-scroll runs afterward too, since very large pages can still be
       settling layout when the first attempt fires. */
    document.addEventListener('click', function (e) {
      var link = e.target.closest('[data-scroll-target]');
      if (!link) return;
      var targetId = link.getAttribute('data-scroll-target');
      var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function jump(behavior) {
        var el = document.getElementById(targetId);
        if (!el) return;
        el.scrollIntoView({ behavior: behavior, block: 'start' });
      }

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          jump(reduceMotion ? 'auto' : 'smooth');
          setTimeout(function () { jump('auto'); }, 250);
        });
      });
    });
  })();

  (function () {
    var form = document.getElementById('rcy-form');
    if (!form) return; // page not present, nothing to wire up

    var errorBox = document.getElementById('rcy-form-error');
    var successBlock = document.getElementById('rcy-success');
    var submitBtn = document.getElementById('rcy-submit');
    var submitLabel = document.getElementById('rcy-submit-label');
    var submitAnotherBtn = document.getElementById('rcy-submit-another');
    var dateInput = document.getElementById('rcy-date');
    var nameInput = document.getElementById('rcy-name');
    var isSubmitting = false;

    function todayLocal() {
      var d = new Date();
      var year = d.getFullYear();
      var month = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }

    function setDefaultDate() {
      var today = todayLocal();
      dateInput.max = today;
      if (!dateInput.value) {
        dateInput.value = today;
      }
    }

    setDefaultDate();

    function clearErrors() {
      errorBox.innerHTML = '';
      errorBox.classList.remove('visible');
    }

    function showErrors(messages) {
      errorBox.innerHTML = '';
      if (messages.length === 1) {
        var p = document.createElement('p');
        p.textContent = messages[0];
        errorBox.appendChild(p);
      } else {
        var ul = document.createElement('ul');
        messages.forEach(function (msg) {
          var li = document.createElement('li');
          li.textContent = msg;
          ul.appendChild(li);
        });
        errorBox.appendChild(ul);
      }
      errorBox.classList.add('visible');
      errorBox.focus();
    }

    function validate(data) {
      var errors = [];
      if (!data.contributorName || !data.contributorName.trim()) {
        errors.push('Please share your name.');
      }
      if (!data.contributionDate) {
        errors.push('Please choose the date of your contribution.');
      }
      if (!data.contributionType) {
        errors.push('Please select how you contributed.');
      }
      if (!data.topicOrProject) {
        errors.push('Please select what your contribution was connected to.');
      }
      if (!data.contributionTopic || !data.contributionTopic.trim()) {
        errors.push('Please share what your contribution was regarding.');
      }
      if (!data.contributionDescription || !data.contributionDescription.trim()) {
        errors.push('Please briefly describe your contribution.');
      }
      var amount = parseFloat(data.timeAmount);
      if (!data.timeAmount || isNaN(amount) || amount < 0.01) {
        errors.push('Please enter the amount of time you contributed.');
      }
      if (!data.timeUnit) {
        errors.push('Please select minutes or hours.');
      }
      return errors;
    }

    function setSending(isSending) {
      submitBtn.disabled = isSending;
      submitLabel.textContent = isSending ? 'Recording contribution…' : 'Record Contribution Time';
    }

    function showSuccess() {
      form.hidden = true;
      successBlock.classList.add('visible');
      successBlock.focus();
    }

    function showForm() {
      successBlock.classList.remove('visible');
      form.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (isSubmitting) return;
      clearErrors();

      var data = {
        contributorName: (nameInput.value || '').trim(),
        contributionDate: dateInput.value || '',
        contributionType: document.getElementById('rcy-type').value || '',
        topicOrProject: document.getElementById('rcy-topic-project').value || '',
        contributionTopic: (document.getElementById('rcy-topic').value || '').trim(),
        contributionDescription: (document.getElementById('rcy-description').value || '').trim(),
        timeAmount: document.getElementById('rcy-time-amount').value || '',
        timeUnit: document.getElementById('rcy-time-unit').value || '',
        contributionLink: (document.getElementById('rcy-link').value || '').trim()
      };

      var errors = validate(data);
      if (errors.length) {
        showErrors(errors);
        return;
      }

      isSubmitting = true;
      setSending(true);

      HTMLFormElement.prototype.submit.call(form);
    });

    submitAnotherBtn.addEventListener('click', function () {
      form.reset();
      setDefaultDate();
      clearErrors();
      showForm();
      if (nameInput) nameInput.focus();
    });
  })();
