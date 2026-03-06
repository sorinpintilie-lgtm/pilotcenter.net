import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import countries from '../data/countries.json';

const SITE_URL = 'https://pilotcenter.net';
const SITE_NAME = 'PilotCenter.net';
const DEFAULT_IMAGE = `${SITE_URL}/images/fulllogo_transparent.avif`;

function decodeSafe(value = '') {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function buildCanonical(pathname = '/') {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new URL(normalized, SITE_URL).toString();
}

function trimTrailingSlash(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function slugToTitle(slug = '') {
  return String(slug)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function findCountryByGuidePath(pathname) {
  const safePath = decodeSafe(pathname);
  return countries.find((country) => {
    const itemPath = String(country['Import 725 (Item)'] || '');
    return itemPath === pathname || decodeSafe(itemPath) === safePath;
  });
}

function findCountryBySlug(countrySlug) {
  return countries.find((country) => country.slug === countrySlug);
}

function getMetaForPath(pathname) {
  const routeMeta = {
    '/': {
      title: 'Become a Pilot with Expert Guidance | PilotCenter.net',
      description:
        'PilotCenter.net helps aspiring pilots choose training routes, compare flight schools, understand costs, and build a clear path to an airline career.',
      type: 'website'
    },
    '/about-us': {
      title: 'About PilotCenter.net | Independent Pilot Training Guidance',
      description:
        'Learn how PilotCenter.net supports future pilots with independent advice, school comparison tools, and step-by-step career planning.'
    },
    '/contact': {
      title: 'Contact PilotCenter.net | Speak with an Aviation Advisor',
      description:
        'Contact PilotCenter.net for personalized guidance on flight schools, pilot training routes, and aviation career planning.'
    },
    '/how-to-become-a-pilot': {
      title: 'How to Become a Pilot | FAA, EASA & ICAO Routes',
      description:
        'Explore the complete process of becoming a pilot, including FAA, EASA, and ICAO pathways, training milestones, and next career steps.'
    },
    '/the-faa-route': {
      title: 'FAA Pilot Training Route | Become a Pilot in the U.S.',
      description:
        'Understand the FAA route from student pilot to commercial and airline pathways, including required licenses, hours, and planning tips.'
    },
    '/the-easa-route': {
      title: 'EASA Pilot Training Route | Become a Pilot in Europe',
      description:
        'Learn the EASA pilot training pathway, key licenses, timeline expectations, and planning considerations for an airline career in Europe.'
    },
    '/the-icao-route': {
      title: 'ICAO Pilot Training Route | International Pilot Pathway',
      description:
        'Discover the ICAO-based pilot training route, international licensing standards, and how to plan your global aviation career.'
    },
    '/cost-breakdown': {
      title: 'Pilot Training Cost Breakdown | Flight School Budget Guide',
      description:
        'Review realistic pilot training costs across FAA, EASA, and ICAO routes, including tuition ranges and key expenses to plan ahead.'
    },
    '/flightschools': {
      title: 'Flight Schools Directory | Compare Pilot Training Options',
      description:
        'Browse and compare flight schools worldwide, filter by location and profile, and find pilot training options that match your goals.'
    },
    '/schools': {
      title: 'Flight Schools Directory | Compare Pilot Training Options',
      description:
        'Browse and compare flight schools worldwide, filter by location and profile, and find pilot training options that match your goals.',
      canonical: '/flightschools'
    },
    '/latest-pilot-jobs': {
      title: 'Latest Pilot Jobs | Live Aviation Career Openings',
      description:
        'Browse live pilot and aviation jobs with source attribution, short summaries, and direct apply links to original postings.'
    },
    '/latest-pilot-jobs/logs': {
      title: 'Pilot Jobs Crawler Logs | Operational Feed',
      description:
        'Review human-readable pilot jobs crawler logs, Perplexity curation activity, and source processing telemetry.',
      robots: 'noindex,nofollow,noarchive,nosnippet,noimageindex'
    },
  '/news-and-resources': {
      title: 'Aviation News & Resources | PilotCenter.net',
      description:
        'Read aviation news, trends, and pilot-focused resources with concise editorial summaries from PilotCenter.net.'
    },
    '/how-it-works': {
      title: 'How PilotCenter.net Works | Pilot Guidance Process',
      description:
        'See how PilotCenter.net helps you evaluate flight schools, compare routes, and build a personalized pilot training plan.'
    },
    '/countries': {
      title: 'Pilot Training by Country | Global Flight School Guides',
      description:
        'Explore country-by-country pilot training guides and discover flight school options, licensing steps, and planning tips worldwide.'
    },
    '/consultation-booking': {
      title: 'Book a Pilot Training Consultation | PilotCenter.net',
      description:
        'Schedule a consultation with PilotCenter.net to get personalized advice on routes, schools, costs, and pilot career strategy.'
    },
    '/calendar-booking': {
      title: 'Schedule Your Consultation | PilotCenter.net',
      description:
        'Pick a time and schedule a pilot training consultation with PilotCenter.net for route planning and school selection support.'
    },
    '/admin': {
      title: 'Admin Dashboard | PilotCenter.net',
      description:
        'Private news administration dashboard.',
      robots: 'noindex,nofollow,noarchive,nosnippet,noimageindex'
    }
  };

  const exact = routeMeta[pathname];
  if (exact) {
    return {
      ...exact,
      robots: exact.robots || 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      canonical: buildCanonical(exact.canonical || pathname)
    };
  }

  if (pathname.startsWith('/flightschools/')) {
    const slug = pathname.replace('/flightschools/', '').trim();
    const schoolName = slugToTitle(slug);
    return {
      title: `${schoolName} Flight School Profile | PilotCenter.net`,
      description:
        `View details for ${schoolName} flight school, compare training information, and explore options for your pilot pathway.`,
      robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      canonical: buildCanonical(pathname),
      type: 'article'
    };
  }

  if (pathname.startsWith('/schools/')) {
    const slug = pathname.replace('/schools/', '').trim();
    const schoolName = slugToTitle(slug);
    return {
      title: `${schoolName} Flight School Profile | PilotCenter.net`,
      description:
        `View details for ${schoolName} flight school, compare training information, and explore options for your pilot pathway.`,
      robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      canonical: buildCanonical(`/flightschools/${slug}`),
      type: 'article'
    };
  }

  if (pathname.startsWith('/countries/')) {
    const countrySlug = pathname.replace('/countries/', '').trim();
    const country = findCountryBySlug(countrySlug);
    const countryName = country?.name || slugToTitle(countrySlug);

    return {
      title: `Pilot Training in ${countryName} | Flight Schools & Guide`,
      description:
        `Explore pilot training in ${countryName}, including route planning, school options, and aviation career preparation resources.`,
      robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      canonical: buildCanonical(pathname),
      type: 'article'
    };
  }

  if (pathname.startsWith('/how-to-become-a-pilot-in/')) {
    const country = findCountryByGuidePath(pathname);
    const countrySlug = pathname.replace('/how-to-become-a-pilot-in/', '').trim();
    const countryName = country?.name || slugToTitle(countrySlug);

    return {
      title: `How to Become a Pilot in ${countryName} | 2026 Guide`,
      description:
        `Read the complete 2026 guide for becoming a pilot in ${countryName}, including licensing steps, training options, and school planning.`,
      robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      canonical: buildCanonical(pathname),
      type: 'article'
    };
  }

  if (pathname.startsWith('/news-and-resources/')) {
    const articleSlug = pathname.replace('/news-and-resources/', '').trim();
    const articleTitle = slugToTitle(articleSlug.replace(/-[a-z0-9]{4,8}$/i, ''));
    const keywordSet = [
      'aviation news',
      'pilot training updates',
      'airline industry trends',
      `${articleTitle.toLowerCase()} aviation`,
      `${articleTitle.toLowerCase()} pilot news`
    ].join(', ');

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: `${articleTitle} | PilotCenter.net News`,
      description: `Read this aviation update from PilotCenter.net with clear context and key takeaways for pilots and aviation professionals.`,
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: SITE_NAME
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/images/fulllogo_transparent.avif`
        }
      },
      mainEntityOfPage: buildCanonical(pathname),
      image: [`${SITE_URL}/images/fulllogo_transparent.avif`],
      articleSection: 'Aviation News',
      keywords: keywordSet
    };

    return {
      title: `${articleTitle} | PilotCenter.net News`,
      description:
        `Read this aviation update from PilotCenter.net with clear context and key takeaways for pilots and aviation professionals.`,
      robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      canonical: buildCanonical(pathname),
      type: 'article',
      keywords: keywordSet,
      schema: articleSchema
    };
  }

  if (pathname.startsWith('/latest-pilot-jobs/')) {
    const jobSlug = pathname.replace('/latest-pilot-jobs/', '').trim();
    const jobTitle = slugToTitle(jobSlug.replace(/-[a-z0-9]{4,8}$/i, ''));

    return {
      title: `${jobTitle} | Pilot Jobs | PilotCenter.net`,
      description:
        `View this aviation opportunity on PilotCenter.net and apply directly on the original source listing.`,
      robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      canonical: buildCanonical(pathname),
      type: 'article'
    };
  }

  return {
    title: 'PilotCenter.net | Pilot Training Guidance',
    description:
      'PilotCenter.net helps you plan pilot training, compare flight schools, and move toward a professional aviation career.',
    robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
    canonical: buildCanonical(pathname),
    type: 'website'
  };
}

export default function RouteSeoMeta() {
  const location = useLocation();
  const pathname = trimTrailingSlash(location.pathname || '/');

  const meta = useMemo(() => getMetaForPath(pathname), [pathname]);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/fulllogo_transparent.avif`
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/flightschools?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {meta.keywords ? <meta name="keywords" content={meta.keywords} /> : null}
      <meta name="robots" content={meta.robots || 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'} />

      <link rel="canonical" href={meta.canonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={meta.type || 'website'} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={meta.canonical} />
      <meta property="og:image" content={DEFAULT_IMAGE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />

      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      {meta.schema ? <script type="application/ld+json">{JSON.stringify(meta.schema)}</script> : null}
    </Helmet>
  );
}
