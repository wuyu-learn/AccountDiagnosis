(function () {
  function getSections(container) {
    var includeCatalog = container.getAttribute('data-include-catalog') === 'true';
    return (window.ACCOUNT_DIAGNOSIS_SECTIONS || []).filter(function (section) {
      return includeCatalog || section.id !== 'catalog';
    });
  }

  function buildFrames(container) {
    var sections = getSections(container);
    var cacheBuster = '?t=' + Date.now();
    container.innerHTML = sections.map(function (section) {
      return [
        '<section class="section-frame-wrap" id="' + section.id + '" data-section-id="' + section.id + '">',
        '  <iframe class="section-frame" src="sections/' + section.file + cacheBuster + '" title="' + section.title + '" scrolling="no"></iframe>',
        '</section>'
      ].join('\n');
    }).join('\n');
  }

  function collectLayout(container) {
    var offsets = {};
    Array.prototype.slice.call(container.querySelectorAll('.section-frame-wrap')).forEach(function (wrap) {
      offsets[wrap.getAttribute('data-section-id')] = wrap.offsetTop;
    });

    window.parent.postMessage({
      type: 'account-diagnosis-layout',
      frameId: container.getAttribute('data-frame-id') || 'new',
      height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      offsets: offsets
    }, '*');
  }

  function init() {
    var container = document.querySelector('[data-section-frame-list]');
    if (!container) return;

    buildFrames(container);
    if (window.location.hash) {
      window.setTimeout(function () {
        var target = document.getElementById(window.location.hash.slice(1));
        if (target) target.scrollIntoView();
      }, 0);
    }

    window.addEventListener('message', function (event) {
      var data = event.data || {};
      if (data.type !== 'account-diagnosis-section-layout') return;

      var wrap = container.querySelector('[data-section-id="' + data.sectionId + '"]');
      if (!wrap) return;

      var frame = wrap.querySelector('iframe');
      if (frame && data.height) frame.style.height = data.height + 'px';
      collectLayout(container);
    });

    window.addEventListener('load', function () {
      window.setTimeout(function () { collectLayout(container); }, 150);
    });
    window.addEventListener('resize', function () { collectLayout(container); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
