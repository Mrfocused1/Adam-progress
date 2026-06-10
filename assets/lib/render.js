// Pure HTML-string renderers. No DOM, no network.
// Each reproduces the exact card markup from index.html so site CSS / app.js keep working.
import { escapeHtml as e, formatInline } from './apply.js';

export function renderStat(s) {
  return `<div class="stat-card reveal">
      <p class="stat-num" data-count="${e(s.count)}" data-suffix="${e(s.suffix)}">0</p>
      <p class="stat-label">${e(s.label)}</p>
    </div>`;
}

export function renderPillar(p) {
  return `<article class="pillar-card reveal">
      <svg viewBox="0 0 24 24" class="pillar-ico"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>
      <h4 class="pillar-title">${e(p.title)}</h4>
      <p class="pillar-desc">${e(p.desc)}</p>
    </article>`;
}

export function renderFeedCard(c) {
  return `<article class="ig-card js-ig-card" data-cat="${e(c.cat)}" data-sc="${e(c.sc)}">
    <div class="ig-thumb">
      <img loading="lazy" src="${e(c.thumb)}" alt="Adam Progress Instagram post" />
      <span class="ig-cat">${e((c.cat || '').toUpperCase())}</span>
      <span class="ig-metric">${e(c.metric)}</span>
      <button type="button" class="ig-play" aria-label="Play"><span class="play-btn"></span></button>
    </div>
    <p class="ig-caption">${e(c.caption)}</p>
    <a class="ig-link" href="${e(c.href)}" target="_blank" rel="noopener" aria-label="Open on Instagram">↗</a>
  </article>`;
}

export function renderReel(r) {
  return `<article class="short-play-card reveal js-ig-card" data-cat="fight" data-sc="${e(r.sc)}">
          <div class="short-vert-thumb ig-thumb">
            <img src="${e(r.thumb)}" alt="${e(r.title)}" loading="lazy"/>
            <span class="ig-cat">REEL</span>
            <span class="ig-metric">${e(r.metric)}</span>
            <button type="button" class="ig-play" aria-label="Play"><span class="play-btn"></span></button>
          </div>
          <div class="short-meta">
            <p class="font-sub tracking-wide text-text">${e(r.title)}</p>
            <p class="text-text2 text-xs mt-1">${e(r.meta)}</p>
          </div>
        </article>`;
}

export function renderShort(s) {
  return `<article class="short-play-card reveal js-yt-player" data-video-id="${e(s.videoId)}">
          <div class="short-vert-thumb">
            <img src="https://img.youtube.com/vi/${e(s.videoId)}/hqdefault.jpg" alt="${e(s.title)}" class="yt-thumb absolute inset-0 w-full h-full object-cover"/>
            <div class="yt-overlay absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent"></div>
            <button type="button" class="yt-play-btn absolute inset-0 flex items-center justify-center w-full h-full" aria-label="Play short">
              <span class="play-btn"></span>
            </button>
            <span class="yt-caption absolute top-3 left-3 badge badge-event">SHORT</span>
          </div>
          <div class="short-meta">
            <p class="font-sub tracking-wide text-text">${e(s.title)}</p>
            <p class="text-text2 text-xs mt-1">${e(s.meta)}</p>
          </div>
        </article>`;
}

export function renderFullFight(f) {
  const badgeClass = { win: 'badge-win', title: 'badge-title', event: 'badge-event' }[f.badge1Class] || 'badge-event';
  const badge1 = f.badge1 ? `<span class="badge ${badgeClass}">${e(f.badge1)}</span>` : '';
  const badge2 = f.badge2 ? `<span class="badge badge-event">${e(f.badge2)}</span>` : '';
  const caption = `<div class="yt-caption absolute top-3 left-3 flex gap-2">
              ${badge1}${badge1 && badge2 ? '\n              ' : ''}${badge2}
            </div>`;
  const body = `<div class="fight-body-sm">
            <h4 class="font-display text-xl tracking-tight leading-none">${e(f.title)}</h4>
            <p class="text-text2 text-xs mt-2 tracking-wide">${e(f.meta)}</p>
          </div>`;
  if (f.kind === 'local') {
    return `<article class="fight-card-sm reveal js-local-player" data-video-src="${e(f.src)}" data-poster="${e(f.poster)}">
          <div class="fight-thumb">
            <img src="${e(f.poster)}" alt="${e(f.title)}" class="yt-thumb absolute inset-0 w-full h-full object-cover"/>
            <div class="yt-overlay absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent"></div>
            <button type="button" class="yt-play-btn absolute inset-0 flex items-center justify-center w-full h-full" aria-label="Play full fight">
              <span class="play-btn"></span>
            </button>
            ${caption}
          </div>
          ${body}
        </article>`;
  }
  return `<article class="fight-card-sm reveal js-yt-player" data-video-id="${e(f.videoId)}">
          <div class="fight-thumb">
            <img src="https://img.youtube.com/vi/${e(f.videoId)}/hqdefault.jpg" alt="${e(f.title)}" loading="lazy" decoding="async" class="yt-thumb absolute inset-0 w-full h-full object-cover"/>
            <div class="yt-overlay absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent"></div>
            <button type="button" class="yt-play-btn absolute inset-0 flex items-center justify-center w-full h-full" aria-label="Play full fight">
              <span class="play-btn"></span>
            </button>
            ${caption}
          </div>
          ${body}
        </article>`;
}

export function renderTestimonial(t) {
  return `<a href="${e(t.href)}" target="_blank" rel="noopener" class="testimonial reveal">
        <div class="testi-head">
          <img src="${e(t.avatar)}" alt="${e(t.name)}" class="avatar" loading="lazy"/>
          <div>
            <p class="font-semibold">${e(t.name)}</p>
            <p class="text-xs text-text2">${e(t.role)}</p>
          </div>
          <svg viewBox="0 0 24 24" class="ml-auto w-4 h-4 text-text2"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.5 1s.8.9 1 1.5c.2.4.3 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.4.2-1 .3-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.5-1s-.8-.9-1-1.5c-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 1-1.5s.9-.8 1.5-1c.4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z" fill="currentColor"/></svg>
        </div>
        <p class="testi-body">${formatInline(t.quote)}</p>
        <p class="testi-source">${e(t.source)}</p>
      </a>`;
}
