(function () {
  function reportHeight() {
    var section = document.querySelector('section[id]');
    var height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      section ? section.scrollHeight : 0
    );

    window.parent.postMessage({
      type: 'account-diagnosis-section-layout',
      sectionId: section ? section.id : '',
      height: height
    }, '*');
  }

  window.addEventListener('load', function () {
    window.setTimeout(reportHeight, 80);
    window.setTimeout(reportHeight, 300);
  });
  window.addEventListener('resize', reportHeight);
})();
