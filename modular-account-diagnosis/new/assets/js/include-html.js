
(function () {
  function loadInclude(node) {
    return fetch(node.getAttribute('data-include'))
      .then(function (response) {
        if (!response.ok) throw new Error('Include failed: ' + response.url);
        return response.text();
      })
      .then(function (html) {
        node.outerHTML = html;
      });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    Promise.all(nodes.map(loadInclude))
      .then(function () { return loadScript('assets/js/calendars.js'); })
      .catch(function (error) {
        console.error(error);
      });
  });
})();
