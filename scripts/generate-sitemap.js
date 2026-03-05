const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://pilotcenter.net';
const today = new Date().toISOString().split('T')[0];

const staticRoutes = [
  '/',
  '/about-us',
  '/contact',
  '/how-to-become-a-pilot',
  '/the-faa-route',
  '/the-easa-route',
  '/the-icao-route',
  '/cost-breakdown',
  '/flightschools',
  '/latest-pilot-jobs',
  '/news-and-resources',
  '/how-it-works',
  '/countries',
  '/consultation-booking',
  '/calendar-booking'
];

const countriesPath = path.join(__dirname, '..', 'src', 'data', 'countries.json');
const countries = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

const countryRoutes = countries
  .map((country) => {
    const routes = [];

    if (country.slug) {
      routes.push(`/countries/${country.slug}`);
    }

    const guidePath = String(country['Import 725 (Item)'] || '').trim();
    if (guidePath.startsWith('/how-to-become-a-pilot-in/')) {
      routes.push(guidePath);
    }

    return routes;
  })
  .flat();

const uniqueRoutes = Array.from(new Set([...staticRoutes, ...countryRoutes]));

function priorityForRoute(route) {
  if (route === '/') return '1.0';
  if (route === '/how-to-become-a-pilot') return '0.95';
  if (route === '/flightschools') return '0.9';
  if (route.startsWith('/how-to-become-a-pilot-in/')) return '0.85';
  if (route.startsWith('/countries/')) return '0.8';
  return '0.7';
}

function changeFreqForRoute(route) {
  if (route === '/' || route === '/news-and-resources') return 'daily';
  if (route === '/flightschools' || route === '/countries') return 'weekly';
  if (route.startsWith('/how-to-become-a-pilot-in/')) return 'monthly';
  return 'monthly';
}

const urlsXml = uniqueRoutes
  .map((route) => {
    const loc = `${SITE_URL}${route}`;
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${changeFreqForRoute(route)}</changefreq>`,
      `    <priority>${priorityForRoute(route)}</priority>`,
      '  </url>'
    ].join('\n');
  })
  .join('\n');

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urlsXml,
  '</urlset>',
  ''
].join('\n');

const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, sitemap, 'utf8');

console.log(`Sitemap generated with ${uniqueRoutes.length} URLs at ${outputPath}`);
