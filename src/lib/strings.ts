/**
 * Single-language UI strings. The site is English-only since the migration
 * from next-intl, but strings stay centralized here so future copy edits or
 * potential re-introduction of i18n is one file.
 */
export const S = {
  nav: {
    works: 'Works',
    projects: 'Projects',
    blog: 'Blog',
    bio: 'Biography',
    publications: 'Publications',
    concerts: 'Concerts',
    contact: 'Contact',
  },
  works: {
    title: 'Works',
    catalog: 'Works catalog',
    instrumentation: 'Instrumentation',
    duration: 'Duration',
    premiere: 'Premiere',
    commissions: 'Commissions',
    ensembles: 'Performers',
    year: 'Year',
    noAudio: 'Audio not available',
    countOne: 'work',
    countOther: 'works',
  },
  home: {
    role: 'Composer and researcher',
    featuredWorks: 'Selected works',
    featuredPosts: 'Selected writing',
    upcomingConcerts: 'Upcoming concerts',
    viewAll: 'View all',
    noUpcomingConcerts: 'No concerts scheduled in the near future',
  },
  contact: {
    title: 'Contact',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    send: 'Send message',
    sending: 'Sending…',
    success: 'Message sent successfully.',
    error: 'Error sending message. Please try again.',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'your@email.com',
    subjectPlaceholder: 'Message subject',
    messagePlaceholder: 'Your message…',
  },
  audio: {
    play: 'Play',
    pause: 'Pause',
    loading: 'Loading audio…',
  },
  cv: {
    download: 'Download CV',
  },
  bio: {
    title: 'Biography',
  },
  concerts: {
    title: 'Concerts',
    upcoming: 'Upcoming concerts',
    past: 'Past concerts',
    noUpcoming: 'No concerts scheduled in the near future',
    noPast: 'No past concerts on record',
  },
  publications: {
    title: 'Publications',
    abstract: 'Abstract',
    journal: 'Journal',
    doi: 'DOI',
    download: 'Download PDF',
  },
  projects: {
    title: 'Projects',
  },
  blog: {
    title: 'Blog',
    readMore: 'Read more',
    publishedAt: 'Published on',
  },
  common: {
    backToList: 'Back',
    loading: 'Loading…',
    notFound: 'Not found',
  },
  notFound: {
    title: 'Page not found',
    description: 'The page you are looking for does not exist.',
    back: 'Back to home',
  },
} as const
