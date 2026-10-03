(() => {
  const PAGE_BASE = 'https://TrentinP.github.io/brambley-seismic/';
  const RECENT_URL = PAGE_BASE + 'recent-captures.json';

  const region = {
    south: 44.5,
    north: 50.0,
    west: -126.5,
    east: -120.0
  };

  const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const pacificTime = value => new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles'
  }).format(new Date(value));

  async function renderMap() {
    const mapEl = document.getElementById('seismic-regional-map');
    const statusEl = document.getElementById('seismic-map-status');
    const countEl = document.getElementById('seismic-week-count');
    const trendEl = document.getElementById('seismic-week-trend');

    if (!mapEl || !window.L) {
      if (statusEl) statusEl.textContent = 'Regional map unavailable.';
      return;
    }

    const map = L.map(mapEl, {
      scrollWheelZoom: false,
      minZoom: 4,
      maxZoom: 10
    });

    map.fitBounds([
      [region.south, region.west],
      [region.north, region.east]
    ], { padding: [8, 8] });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 10,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const now = new Date();
    const start = new Date(now.getTime() - 14 * 86400000);
    const currentCutoff = now.getTime() - 7 * 86400000;

    const query = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query');
    query.searchParams.set('format', 'geojson');
    query.searchParams.set('starttime', start.toISOString());
    query.searchParams.set('endtime', now.toISOString());
    query.searchParams.set('minmagnitude', '1');
    query.searchParams.set('minlatitude', String(region.south));
    query.searchParams.set('maxlatitude', String(region.north));
    query.searchParams.set('minlongitude', String(region.west));
    query.searchParams.set('maxlongitude', String(region.east));
    query.searchParams.set('orderby', 'time');

    try {
      const response = await fetch(query.toString(), { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const payload = await response.json();
      const features = Array.isArray(payload.features) ? payload.features : [];
      const current = features.filter(feature => Number(feature.properties?.time) >= currentCutoff);
      const previous = features.filter(feature => Number(feature.properties?.time) < currentCutoff);

      current.forEach(feature => {
        const coords = feature.geometry?.coordinates || [];
        const lon = Number(coords[0]);
        const lat = Number(coords[1]);
        const mag = Number(feature.properties?.mag);
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(mag)) return;

        const marker = L.circleMarker([lat, lon], {
          radius: Math.max(4, Math.min(14, 3 + mag * 1.8)),
          color: '#4f6238',
          weight: 1,
          fillColor: '#6f805c',
          fillOpacity: .72
        });

        const place = escapeHtml(feature.properties?.place || 'Earthquake');
        const url = escapeHtml(feature.properties?.url || '#');
        const when = feature.properties?.time
          ? escapeHtml(pacificTime(feature.properties.time))
          : '';

        marker.bindPopup(
          '<strong>M ' + mag.toFixed(1) + '</strong><br>' +
          place + '<br>' +
          when + '<br>' +
          '<a href="' + url + '" target="_blank" rel="noopener">View at USGS →</a>'
        );
        marker.addTo(map);
      });

      if (countEl) {
        countEl.textContent = current.length + ' event' + (current.length === 1 ? '' : 's');
      }

      if (trendEl) {
        const currentCount = current.length;
        const previousCount = previous.length;
        const currentLabel = currentCount + ' M1.0+ event' + (currentCount === 1 ? '' : 's');
        const previousLabel = previousCount + ' in the preceding seven days';

        if (previousCount === 0 && currentCount === 0) {
          trendEl.textContent =
            'Regional seismicity is broadly unchanged: no M1.0+ earthquakes were cataloged in either seven-day period.';
        } else if (previousCount === 0) {
          trendEl.textContent =
            'Regional seismicity is higher than in the previous seven days: ' +
            currentLabel + ' were cataloged, compared with none in the preceding period.';
        } else {
          const change = (currentCount - previousCount) / previousCount;

          if (change > 0.15) {
            trendEl.textContent =
              'Regional seismicity is higher than in the previous seven days: ' +
              currentLabel + ', compared with ' + previousLabel + '.';
          } else if (change < -0.15) {
            trendEl.textContent =
              'Regional seismicity is lower than in the previous seven days: ' +
              currentLabel + ', compared with ' + previousLabel + '.';
          } else {
            trendEl.textContent =
              'Regional seismicity is broadly unchanged from the previous seven days: ' +
              currentLabel + ', compared with ' + previousLabel + '.';
          }
        }
      }

      if (statusEl) {
        statusEl.textContent =
          'M1.0+ events from the past seven days · USGS catalog · no station marker shown';
      }
    } catch (error) {
      console.error('Regional earthquake map:', error);
      if (statusEl) statusEl.textContent = 'The USGS regional earthquake feed is temporarily unavailable.';
      if (countEl) countEl.textContent = 'Unavailable';
      if (trendEl) trendEl.textContent = 'Regional activity comparison unavailable';
    }
  }

  function renderRecent(events) {
    const list = document.getElementById('brambley-recent-captures-list');
    const empty = document.getElementById('brambley-recent-captures-empty');
    if (!list || !empty) return;

    list.innerHTML = '';

    if (!Array.isArray(events) || events.length === 0) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    events.forEach(event => {
      const card = document.createElement('article');
      card.className = 'brambley-recent-card';

      const magnitude = Number(event.magnitude);
      const mag = Number.isFinite(magnitude) ? magnitude.toFixed(1) : '—';
      const image = PAGE_BASE + String(event.waveform || '').replace(/^\//, '');
      const place = escapeHtml(event.place || 'Earthquake');
      const origin = escapeHtml(event.origin_utc || '');
      const eventUrl = escapeHtml(event.usgs_url || '#');

      card.innerHTML =
        '<div class="brambley-recent-meta">' +
          '<span>RECORDED AT BRAMBLEY</span>' +
          '<span>M3.0+ REGIONAL EVENT</span>' +
        '</div>' +
        '<h3 class="brambley-recent-title">M ' + mag + ' · ' + place + '</h3>' +
        '<div class="brambley-recent-time">' +
          (event.origin_utc ? escapeHtml(pacificTime(event.origin_utc)) + ' Pacific Time' : '') +
        '</div>' +
        '<div class="brambley-recent-waveform-wrap">' +
          '<img class="brambley-recent-waveform" loading="lazy" ' +
          'alt="Seismogram recorded at Brambley" src="' + image +
          '?v=' + encodeURIComponent(origin) + '">' +
        '</div>' +
        '<div class="brambley-recent-bottom">' +
          '<span>VERTICAL GROUND MOTION · R1C99 · EHZ</span>' +
          '<a target="_blank" rel="noopener" href="' + eventUrl + '">VIEW EVENT AT USGS →</a>' +
        '</div>';

      list.appendChild(card);
    });
  }

  async function loadRecent() {
    const empty = document.getElementById('brambley-recent-captures-empty');
    try {
      const response = await fetch(RECENT_URL + '?v=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      renderRecent(await response.json());
    } catch (error) {
      console.error('Unable to load Brambley recent capture feed:', error);
      if (empty) {
        empty.textContent = 'The recent waveform feed is temporarily unavailable.';
        empty.hidden = false;
      }
    }
  }

  renderMap();
  loadRecent();
})();
