const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = __dirname;

const sectionFiles = [
  ['catalog', 'catalog.html'],
  ['acc01', 'acc01-total-asset.html'],
  ['acc02', 'acc02-fund-account.html'],
  ['acc03', 'acc03-fund-holding.html'],
  ['acc04', 'acc04-advisor-account.html'],
  ['acc05', 'acc05-advisor-combo.html'],
  ['acc06', 'acc06-advisor-rebalance.html'],
  ['acc07', 'acc07-money-account.html'],
  ['acc08', 'acc08-money-holding.html'],
  ['acc09', 'acc09-private-account.html'],
  ['acc10', 'acc10-private-holding.html'],
  ['acc11', 'acc11-position-detail.html'],
  ['acc12', 'acc12-asset-structure.html'],
  ['acc13', 'acc13-return-overview.html'],
  ['acc14', 'acc14-return-calendar.html'],
  ['acc15', 'acc15-return-attribution.html'],
  ['acc16', 'acc16-return-composition.html'],
  ['acc17', 'acc17-period-attribution.html'],
  ['acc18', 'acc18-watchlist-valuation.html'],
];

const navItems = [
  ['catalog', '目录 · 卡片取值方式'],
  ['acc01', 'ACC-01 账户总资产卡'],
  ['acc02', 'ACC-02 基金账户详情卡'],
  ['acc03', 'ACC-03 基金持有详情卡'],
  ['acc04', 'ACC-04 投顾账户详情卡'],
  ['acc05', 'ACC-05 投顾组合详情卡'],
  ['acc06', 'ACC-06 投顾调仓记录卡'],
  ['acc07', 'ACC-07 货币账户详情卡'],
  ['acc08', 'ACC-08 货币持有详情卡'],
  ['acc09', 'ACC-09 专户账户详情卡'],
  ['acc10', 'ACC-10 专户持有详情卡'],
  ['acc11', 'ACC-11 持仓明细卡'],
  ['acc12', 'ACC-12 资产结构卡'],
  ['acc13', 'ACC-13 账户收益总览卡'],
  ['acc14', 'ACC-14 收益明细日历卡'],
  ['acc15', 'ACC-15 收益归因卡'],
  ['acc16', 'ACC-16 收益构成卡'],
  ['acc17', 'ACC-17 区间收益归因卡'],
  ['acc18', 'ACC-18 自选基金估值卡'],
];

function writeFile(relativePath, content, baseDir = outDir) {
  const target = path.join(baseDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.replace(/\n*$/, '\n'), 'utf8');
}

function buildIncludeLoader(scriptPath) {
  return `
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
      .then(function () { return loadScript('${scriptPath}'); })
      .catch(function (error) {
        console.error(error);
      });
  });
})();
`;
}

function parseSource(sourcePath) {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const lines = source.split(/\n/);

  function sliceLines(startLine, endLine) {
    return lines.slice(startLine - 1, endLine).join('\n');
  }

  function findLine(pattern, fromLine = 1) {
    const index = lines.findIndex((line, i) => i + 1 >= fromLine && pattern.test(line));
    if (index === -1) throw new Error(`Cannot find line for ${pattern} in ${sourcePath}`);
    return index + 1;
  }

  const styleStart = findLine(/^<style/);
  const styleEnd = findLine(/^<\/style>/, styleStart);
  const navStart = findLine(/^<nav /);
  const navEnd = findLine(/^<\/nav>/, navStart);
  const headerStart = findLine(/class="page-header"/);
  const headerEnd = findLine(/^  <\/div>/, headerStart + 1);
  const scriptStart = findLine(/^<script data-page-node-id="OW6D1g7hiC0ouuFXLue9Sb"/);
  const scriptEnd = findLine(/^<\/script>/, scriptStart);
  const bodyStart = findLine(/^<body/);
  const mainStartLine = findLine(/class="main-content"/);

  const sectionStarts = sectionFiles.map(function ([id, filename]) {
    return {
      id,
      filename,
      startLine: findLine(new RegExp(`<section[^>]*id="${id}"|<section id="${id}"`)),
    };
  });

  const sections = sectionStarts.map(function (section, index) {
    const nextStart = sectionStarts[index + 1] ? sectionStarts[index + 1].startLine : scriptStart;
    return {
      id: section.id,
      filename: section.filename,
      html: sliceLines(section.startLine, nextStart - 1).trimEnd(),
    };
  });

  return {
    headBeforeStyle: sliceLines(1, styleStart - 1),
    style: sliceLines(styleStart + 1, styleEnd - 1),
    headAfterStyle: sliceLines(styleEnd + 1, bodyStart - 1),
    bodyLine: lines[bodyStart - 1],
    sidebarHtml: sliceLines(navStart, navEnd),
    mainStart: lines[mainStartLine - 1],
    headerHtml: sliceLines(headerStart, headerEnd),
    sections,
    calendarScript: sliceLines(scriptStart + 1, scriptEnd - 1),
  };
}

function generateVersion(config) {
  const parsed = parseSource(path.join(root, config.source));
  const base = `${config.dir}/`;
  const sectionsHtml = parsed.sections.map(function (section) {
    return section.html;
  }).join('\n\n');

  writeFile(`${base}assets/css/account-diagnosis.css`, parsed.style);
  writeFile(`${base}assets/js/calendars.js`, parsed.calendarScript);
  writeFile(`${base}assets/js/include-html.js`, buildIncludeLoader('assets/js/calendars.js'));
  writeFile(`${base}partials/sidebar.html`, parsed.sidebarHtml);
  writeFile(`${base}partials/page-header.html`, parsed.headerHtml);

  const includeLines = [];
  parsed.sections.forEach(function (section) {
    writeFile(`${base}sections/${section.filename}`, section.html);
    includeLines.push(`    <div data-include="sections/${section.filename}"></div>`);
  });

  const fullHtml = `${parsed.headBeforeStyle}
<link rel="stylesheet" href="assets/css/account-diagnosis.css">
${parsed.headAfterStyle}
${parsed.bodyLine}

<!-- ========= Sidebar ========= -->
${parsed.sidebarHtml}

<!-- ========= Main Content ========= -->
${parsed.mainStart}
${parsed.headerHtml}

${sectionsHtml}
</div>
<script src="assets/js/calendars.js"></script>
</body>
</html>`;

  writeFile(`${base}index.html`, fullHtml);

  const modularHtml = `${parsed.headBeforeStyle}
<link rel="stylesheet" href="assets/css/account-diagnosis.css">
${parsed.headAfterStyle}
${parsed.bodyLine}

<!-- ========= Sidebar ========= -->
<div data-include="partials/sidebar.html"></div>

<!-- ========= Main Content ========= -->
${parsed.mainStart}
  <div data-include="partials/page-header.html"></div>

${includeLines.join('\n')}
</div>
<script src="assets/js/include-html.js"></script>
</body>
</html>`;

  writeFile(`${base}modular.html`, modularHtml);

  const compareSectionsHtml = parsed.sections.filter(function (section) {
    return section.id !== 'catalog';
  }).map(function (section) {
    return section.html;
  }).join('\n\n');

  const compareHtml = `${parsed.headBeforeStyle}
<link rel="stylesheet" href="assets/css/account-diagnosis.css">
<style>
  body { padding: 20px 16px !important; }
  .main-content { margin-left: 0 !important; }
  .page-header, .section { max-width: none !important; }
</style>
${parsed.headAfterStyle}
${parsed.bodyLine}

<!-- ========= Main Content: shell comparison mode, shared header/catalog omitted ========= -->
${parsed.mainStart}

${compareSectionsHtml}
</div>
<script src="assets/js/calendars.js"></script>
<script>
  (function () {
    var sectionIds = ${JSON.stringify(sectionFiles.map(function ([id]) { return id; }).filter(function (id) { return id !== 'catalog'; }))};

    function collectLayout() {
      var offsets = {};
      sectionIds.forEach(function (id) {
        var element = document.getElementById(id);
        if (element) offsets[id] = element.offsetTop;
      });

      window.parent.postMessage({
        type: 'account-diagnosis-layout',
        frameId: '${config.dir}',
        height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
        offsets: offsets
      }, '*');
    }

    window.addEventListener('load', function () {
      window.setTimeout(collectLayout, 120);
    });
    window.addEventListener('resize', collectLayout);
  })();
</script>
</body>
</html>`;

  writeFile(`${base}compare.html`, compareHtml);

  const catalogSection = parsed.sections.find(function (section) {
    return section.id === 'catalog';
  });
  const catalogHtml = `${parsed.headBeforeStyle}
<link rel="stylesheet" href="assets/css/account-diagnosis.css">
<style>
  body { padding: 20px 16px !important; background: transparent !important; }
  .main-content { margin-left: 0 !important; }
  .section { max-width: none !important; margin: 0 !important; }
</style>
${parsed.headAfterStyle}
${parsed.bodyLine}

<!-- ========= Shared catalog for shell ========= -->
${parsed.mainStart}
${catalogSection ? catalogSection.html : ''}
</div>
<script>
  (function () {
    function reportHeight() {
      window.parent.postMessage({
        type: 'account-diagnosis-layout',
        frameId: '${config.dir}-catalog',
        height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
        offsets: {}
      }, '*');
    }

    window.addEventListener('load', function () {
      window.setTimeout(reportHeight, 120);
    });
    window.addEventListener('resize', reportHeight);
  })();
</script>
</body>
</html>`;

  writeFile(`${base}catalog.html`, catalogHtml);

  return {
    dir: config.dir,
    sectionCount: parsed.sections.length,
  };
}

function buildShellIndex(options) {
  const navHtml = navItems.map(function ([id, label]) {
    return `      <a href="#${id}" data-target="${id}">${label}</a>`;
  }).join('\n');
  const prefix = options.prefix;
  const newIndex = `${prefix}new/index.html`;
  const oldIndex = `${prefix}old/index.html`;
  const newCompare = `${prefix}new/compare.html`;
  const oldCompare = `${prefix}old/compare.html`;
  const sharedCatalog = `${prefix}new/catalog.html`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>问账户页面显示（815上线版）｜新版 / 旧版对照</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif; background: #ECEFF3; color: #1A1D21; }
  body { min-height: 100vh; overflow: auto; }
  .shell { min-height: 100vh; }
  .topbar { height: 52px; position: sticky; top: 0; z-index: 30; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; background: rgba(255,255,255,.92); border-bottom: 1px solid rgba(208,214,222,.8); backdrop-filter: blur(10px); }
  .title { font-size: 15px; font-weight: 700; }
  .toolbar { display: flex; gap: 8px; align-items: center; }
  .tool, .toolbar a { appearance: none; border: 0; color: #FB5C5F; text-decoration: none; font-size: 12px; padding: 6px 10px; border-radius: 5px; background: #FDEDED; cursor: pointer; line-height: 1.2; }
  .tool:hover, .toolbar a:hover { background: #FADCDC; }
  .layout { position: relative; }
  .side-nav { position: fixed; left: 18px; top: 70px; z-index: 25; width: 220px; max-height: calc(100vh - 88px); overflow-y: auto; padding: 14px 12px; background: rgba(255,255,255,.92); border: 1px solid rgba(221,225,230,.9); border-radius: 8px; box-shadow: 0 12px 32px rgba(31,41,55,.12); backdrop-filter: blur(10px); }
  .nav-title { font-size: 12px; color: #8A9099; font-weight: 700; margin: 2px 4px 10px; }
  .side-nav a { display: block; padding: 7px 9px; border-radius: 5px; color: #555D66; font-size: 12px; line-height: 1.25; text-decoration: none; }
  .side-nav a:hover, .side-nav a.active { background: #FDEDED; color: #FB5C5F; font-weight: 600; }
  .stage { overflow-x: auto; overflow-y: visible; min-height: calc(100vh - 52px); }
  .shared-catalog { width: 980px; margin: 42px 80px 0 280px; background: transparent; }
  .shared-catalog-label { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 12px 8px; padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,.88); border: 1px solid rgba(221,225,230,.9); box-shadow: 0 4px 16px rgba(31,41,55,.08); font-size: 13px; font-weight: 700; }
  .shared-catalog-label span { color: #8A9099; font-size: 11px; font-weight: 400; }
  .canvas { width: max-content; min-height: calc(100vh - 52px); display: flex; align-items: flex-start; gap: 88px; padding: 42px 80px 72px 280px; background:
    linear-gradient(rgba(255,255,255,.44) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.44) 1px, transparent 1px),
    #ECEFF3;
    background-size: 32px 32px;
  }
  .page { position: relative; width: 980px; min-width: 980px; background: transparent; }
  .page-label { position: sticky; top: 64px; z-index: 10; display: inline-flex; align-items: center; gap: 8px; margin: 0 0 12px 8px; padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,.88); border: 1px solid rgba(221,225,230,.9); box-shadow: 0 4px 16px rgba(31,41,55,.08); font-size: 13px; font-weight: 700; }
  .page-label span { color: #8A9099; font-size: 11px; font-weight: 400; }
  iframe { width: 100%; height: 2400px; display: block; border: 0; background: #DDDFE3; overflow: hidden; box-shadow: 0 18px 46px rgba(31,41,55,.12); }
  .shared-catalog iframe { height: 640px; background: transparent; }
  @media (max-width: 960px) {
    .topbar { align-items: flex-start; height: auto; min-height: 52px; padding: 10px 12px; gap: 10px; flex-direction: column; }
    .toolbar { flex-wrap: wrap; }
    .side-nav { position: static; width: auto; max-height: 180px; margin: 12px; }
    .shared-catalog { width: 900px; margin: 28px 32px 0; }
    .canvas { gap: 56px; padding: 28px 32px 52px; }
    .page { width: 900px; min-width: 900px; }
  }
</style>
</head>
<body>
<div class="shell">
  <header class="topbar">
    <div class="title">问账户页面显示（815上线版）｜新版 / 旧版对照</div>
    <nav class="toolbar">
      <button class="tool" type="button" data-scroll-page="new">新版</button>
      <button class="tool" type="button" data-scroll-page="old">旧版</button>
      <button class="tool" type="button" id="topButton">顶部</button>
      <a href="${newIndex}" target="_blank">单独打开新版</a>
      <a href="${oldIndex}" target="_blank">单独打开旧版</a>
    </nav>
  </header>
  <div class="layout">
    <aside class="side-nav" aria-label="对照目录">
      <div class="nav-title">统一目录</div>
${navHtml}
    </aside>
    <main class="stage" id="stage">
      <section class="shared-catalog" id="catalogArea">
        <div class="shared-catalog-label">目录 · 卡片取值方式 <span>公共内容</span></div>
        <iframe id="catalogFrame" src="${sharedCatalog}" title="目录 · 卡片取值方式" scrolling="no"></iframe>
      </section>
      <div class="canvas">
        <section class="page" id="newPage">
          <div class="page-label">新版 <span>${newIndex}</span></div>
          <iframe id="newFrame" src="${newCompare}" title="新版" scrolling="no"></iframe>
        </section>
        <section class="page" id="oldPage">
          <div class="page-label">旧版 <span>${oldIndex}</span></div>
          <iframe id="oldFrame" src="${oldCompare}" title="旧版" scrolling="no"></iframe>
        </section>
      </div>
    </main>
  </div>
</div>
<script>
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.side-nav a'));
    var frames = [
      document.getElementById('newFrame'),
      document.getElementById('oldFrame')
    ];
    var catalogFrame = document.getElementById('catalogFrame');
    var stage = document.getElementById('stage');
    var catalogArea = document.getElementById('catalogArea');
    var topButton = document.getElementById('topButton');
    var newPage = document.getElementById('newPage');
    var oldPage = document.getElementById('oldPage');
    var layoutByFrame = {};

    function resizeFrameByMessage(frameId, height) {
      var frame = frameId.indexOf('catalog') >= 0 ? catalogFrame : (frameId === 'old' ? frames[1] : frames[0]);
      if (height) frame.style.height = height + 'px';
    }

    function jumpTo(id) {
      links.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('data-target') === id);
      });
      if (id === 'catalog') {
        frames.forEach(function (frame) {
          frame.src = frame.src.split('#')[0];
        });
        var areaTop = catalogArea.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: areaTop - 62, behavior: 'smooth' });
        stage.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      frames.forEach(function (frame) {
        frame.src = frame.src.split('#')[0] + '#' + id;
      });
      var offset = layoutByFrame.new && layoutByFrame.new.offsets ? layoutByFrame.new.offsets[id] : null;
      if (typeof offset === 'number') {
        var iframeTop = frames[0].getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: iframeTop + offset - 56, behavior: 'smooth' });
      }
    }

    function scrollToPage(page) {
      var target = page === 'old' ? oldPage : newPage;
      stage.scrollTo({ left: target.offsetLeft - 48, behavior: 'smooth' });
    }

    window.addEventListener('message', function (event) {
      var data = event.data || {};
      if (data.type !== 'account-diagnosis-layout') return;
      layoutByFrame[data.frameId] = data;
      resizeFrameByMessage(data.frameId, data.height);
    });

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        jumpTo(link.getAttribute('data-target'));
      });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-scroll-page]')).forEach(function (button) {
      button.addEventListener('click', function () {
        scrollToPage(button.getAttribute('data-scroll-page'));
      });
    });

    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();
</script>
</body>
</html>`;
}

function writeShellIndexes() {
  writeFile('index.html', buildShellIndex({ prefix: '' }));
  writeFile('index.html', buildShellIndex({ prefix: 'modular-account-diagnosis/' }), root);
}

const newResult = generateVersion({
  source: '账户卡片_0815.html',
  dir: 'new',
});

const oldResult = generateVersion({
  source: '账户卡片组件库_815上线版_原始.html',
  dir: 'old',
});

writeShellIndexes();

writeFile('README.md', `
# Account Diagnosis Modular HTML

This folder is organized as a shell plus two isolated versions.

- index.html: shell comparison page
- new/: current edited version
- old/: original version

Each version folder contains:

- index.html: direct-open full page
- compare.html: no-sidebar page used by the shell
- modular.html: partials/sections loader, requires a local static server
- partials/: sidebar and page header
- sections/: catalog and ACC-01 through ACC-18
- assets/: CSS and JS extracted from that version

Sources:

- new/ is generated from ../账户卡片_0815.html
- old/ is generated from ../账户卡片组件库_815上线版_原始.html

Open ../index.html directly in a browser for the root comparison shell.
`);

console.log(`Generated new: ${newResult.sectionCount} sections -> new/`);
console.log(`Generated old: ${oldResult.sectionCount} sections -> old/`);
