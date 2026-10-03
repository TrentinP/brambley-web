(() => {
  const PAGE_BASE = 'https://TrentinP.github.io/brambley-seismic/';
  const ARCHIVE_URL = PAGE_BASE + 'archive.json';

  let allEvents = [];
  let scope = 'global';
  let map;
  let layer;

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const pacificDate = value => new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles'
  }).format(new Date(value));

  const shortDate = value => new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles'
  }).format(new Date(value));

  function initMap() {
    if (!window.L || !$('qa-map')) return;
    map = L.map('qa-map', {
      scrollWheelZoom: false,
      minZoom: 2,
      maxZoom: 10,
      worldCopyJump: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 10,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    layer = L.layerGroup().addTo(map);
  }

  function buildYears() {
    const select = $('qa-year');
    const years = [...new Set(allEvents.map(event => String(event.origin_utc || '').slice(0,4)).filter(Boolean))]
      .sort((a,b) => Number(b) - Number(a));

    select.innerHTML = '<option value="all">All years</option>' +
      years.map(year => '<option value="' + year + '">' + year + '</option>').join('');
  }

  function filtered() {
    const year = $('qa-year').value;
    const sort = $('qa-sort').value;

    let rows = allEvents.filter(event =>
      event.scope === scope &&
      (year === 'all' || String(event.origin_utc || '').startsWith(year + '-'))
    );

    const sorter = {
      newest: (a,b) => new Date(b.origin_utc) - new Date(a.origin_utc),
      magnitude: (a,b) => Number(b.magnitude || 0) - Number(a.magnitude || 0),
      depth: (a,b) => Number(b.depth_km || 0) - Number(a.depth_km || 0),
      signal: (a,b) => Number(b.signal_score || 0) - Number(a.signal_score || 0)
    }[sort];

    return rows.slice().sort(sorter);
  }

  function summarize(rows) {
    const largest = rows.slice().sort((a,b) => Number(b.magnitude || 0) - Number(a.magnitude || 0))[0];
    const deepest = rows.slice().sort((a,b) => Number(b.depth_km || 0) - Number(a.depth_km || 0))[0];
    const strongest = rows.slice().sort((a,b) => Number(b.signal_score || 0) - Number(a.signal_score || 0))[0];

    $('qa-largest').textContent = largest ? 'M ' + Number(largest.magnitude).toFixed(1) : '—';
    $('qa-largest-detail').textContent = largest ? largest.place : 'From displayed records';

    $('qa-deepest').textContent = deepest ? Number(deepest.depth_km).toFixed(1) + ' km' : '—';
    $('qa-deepest-detail').textContent = deepest ? deepest.place : 'From displayed records';

    $('qa-strongest').textContent = strongest ? Number(strongest.signal_score).toFixed(1) : '—';
    $('qa-strongest-detail').textContent = strongest
      ? 'Archive signal score · ' + strongest.place
      : 'Highest archive signal score';
  }

  function renderMap(rows) {
    if (!map || !layer) return;
    layer.clearLayers();

    let mapped = rows.filter(event =>
      Number.isFinite(Number(event.latitude)) &&
      Number.isFinite(Number(event.longitude)) &&
      Number.isFinite(Number(event.magnitude))
    );

    if (scope === 'regional') {
      mapped = mapped.slice()
        .sort((a,b) => new Date(b.origin_utc) - new Date(a.origin_utc))
        .slice(0,25);
    }

    mapped.forEach(event => {
      const magnitude = Number(event.magnitude);
      const radius = Math.max(5, Math.min(15, 3 + magnitude * 1.45));
      const marker = L.circleMarker(
        [Number(event.latitude), Number(event.longitude)],
        {
          radius,
          color: '#4f6238',
          weight: 1,
          fillColor: scope === 'global' ? '#7a6649' : '#6f805c',
          fillOpacity: .74
        }
      );

      marker.bindPopup(
        '<strong>M ' + magnitude.toFixed(1) + '</strong><br>' +
        esc(event.place || 'Earthquake') + '<br>' +
        esc(shortDate(event.origin_utc)) + '<br>' +
        'Depth ' + Number(event.depth_km || 0).toFixed(1) + ' km<br>' +
        '<a href="' + esc(event.usgs_url || '#') +
        '" target="_blank" rel="noopener">View at USGS →</a>'
      );
      marker.addTo(layer);
    });

    if (scope === 'regional') {
      map.fitBounds([[42.5,-132.0],[52.5,-117.0]], { padding: [8,8] });
      $('qa-map-title').textContent = 'Regional events in the archive.';
      $('qa-map-status').textContent =
        mapped.length + ' regional event' + (mapped.length === 1 ? '' : 's') +
        ' shown · newest 25 maximum · no station marker';
    } else {
      map.setView([20, 0], 2);
      $('qa-map-title').textContent = 'Global events in the archive.';
      $('qa-map-status').textContent =
        mapped.length + ' global event' + (mapped.length === 1 ? '' : 's') +
        ' shown · no station marker';
    }

    setTimeout(() => map.invalidateSize(), 0);
  }

  function renderEvents(rows) {
    const container = $('qa-events');
    const empty = $('qa-empty');

    container.innerHTML = '';
    empty.hidden = rows.length !== 0;

    rows.forEach(event => {
      const article = document.createElement('article');
      article.className = 'qa-event';

      const origin = event.origin_utc ? pacificDate(event.origin_utc) + ' Pacific Time' : '';
      const image = PAGE_BASE + String(event.waveform || '').replace(/^\//, '');
      const scopeLabel = String(event.scope || '').toUpperCase();

      article.innerHTML =
        '<button class="qa-event-main" type="button" aria-expanded="false">' +
          '<div class="qa-mag">M ' + Number(event.magnitude).toFixed(1) + '</div>' +
          '<div>' +
            '<h3>' + esc(event.place || 'Earthquake') + '</h3>' +
            '<div class="qa-event-meta">' +
              '<span>' + esc(scopeLabel) + '</span>' +
              '<span>' + esc(shortDate(event.origin_utc)) + '</span>' +
              '<span>R1C99 · EHZ</span>' +
            '</div>' +
          '</div>' +
          '<div class="qa-event-side">' +
            '<div>Depth ' + Number(event.depth_km || 0).toFixed(1) + ' km</div>' +
            '<div>' + esc(origin) + '</div>' +
          '</div>' +
          '<div class="qa-event-arrow">›</div>' +
        '</button>' +
        '<div class="qa-event-detail" hidden>' +
          '<div class="qa-waveform">' +
            '<img alt="Seismogram recorded at Brambley" data-src="' + esc(image) + '">' +
          '</div>' +
          '<div class="qa-waveform-meta">' +
            '<span>VERTICAL GROUND MOTION · R1C99 · EHZ</span>' +
            '<a href="' + esc(event.usgs_url || '#') +
              '" target="_blank" rel="noopener">VIEW EVENT AT USGS →</a>' +
          '</div>' +
        '</div>';

      const button = article.querySelector('.qa-event-main');
      const detail = article.querySelector('.qa-event-detail');
      const img = article.querySelector('.qa-waveform img');

      button.addEventListener('click', () => {
        const opening = detail.hidden;
        detail.hidden = !opening;
        article.classList.toggle('open', opening);
        button.setAttribute('aria-expanded', String(opening));
        if (opening && img && !img.src) {
          img.src = img.dataset.src + '?v=' + encodeURIComponent(event.origin_utc || event.event_id || '');
        }
      });

      container.appendChild(article);
    });
  }

  function render() {
    const rows = filtered();
    $('qa-count').textContent =
      rows.length + ' archived ' + scope + ' event' + (rows.length === 1 ? '' : 's');
    summarize(rows);
    renderMap(rows);
    renderEvents(rows);
  }

  function setScope(next) {
    scope = next;
    document.querySelectorAll('.qa-scope button').forEach(button => {
      button.classList.toggle('active', button.dataset.scope === scope);
    });
    render();
  }

  async function load() {
    try {
      const response = await fetch(ARCHIVE_URL + '?v=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const payload = await response.json();
      allEvents = Array.isArray(payload) ? payload : [];

      buildYears();
      initMap();
      render();

      document.querySelectorAll('.qa-scope button').forEach(button => {
        button.addEventListener('click', () => setScope(button.dataset.scope));
      });
      $('qa-year').addEventListener('change', render);
      $('qa-sort').addEventListener('change', render);
    } catch (error) {
      console.error('Earthquake archive:', error);
      $('qa-count').textContent = 'Archive unavailable';
      $('qa-message').hidden = false;
    }
  }

  load();
})();
