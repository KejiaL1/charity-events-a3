export const API_BASE = 'http://localhost:3000/api';

export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function formatDateTime(dtStr) {
  if (!dtStr) return '';
  const d = new Date(dtStr);
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isEnded(endStr) {
  return new Date(endStr).getTime() < Date.now();
}

export function formatPrice(cents, isFree) {
  if (isFree || cents === 0 || cents === null || cents === undefined) return 'Free';
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(dollars);
}

export function eventHero(ev) {
  if (!ev) return 'assets/img/default_event.jpg';

  if (ev.hero_image_url) return ev.hero_image_url;

  const title = (ev.title || '').toLowerCase();

  if (title.includes('city charity run')) return 'assets/img/city_charity_run.jpg';
  if (title.includes('bay area fun run')) return 'assets/img/bay_area_fun_run.jpg';
  if (title.includes('eco auction')) return 'assets/img/eco_auction_2025.jpg';
  if (title.includes('autumn gala')) return 'assets/img/autumn_gala_night.jpg';
  if (title.includes('winter gala')) return 'assets/img/winter_gala.jpg';
  if (title.includes('blood drive')) return 'assets/img/community_blood_drive.jpg';

}
