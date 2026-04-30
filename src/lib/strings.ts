/**
 * Single-language UI strings. The site is English-only since the migration
 * from next-intl, but strings stay centralized here so future copy edits or
 * potential re-introduction of i18n is one file.
 */
export const S = {
  nav: {
    works: 'Listen',
    projects: 'Projects',
    blog: 'Blog',
    bio: 'Biography',
    publications: 'Stochastics',
    concerts: 'News',
    contact: 'Contact',
    catalogue: 'Catalogue',
  },
  works: {
    title: 'Listen',
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
    upcomingConcerts: 'Latest news',
    viewAll: 'View all',
    noUpcomingConcerts: 'No recent news.',
  },
  contact: {
    title: 'Contact',
    subtitle: 'Get in touch',
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
    subtitle: 'Composer and researcher',
    profileTag: '[ Profile ]',
    displayName: 'Sergio\nLuque',
    portraitAlt: 'Portrait of Sergio Luque',
    introFallback:
      'Sergio Luque (1976) is a composer of vocal, instrumental and electroacoustic music, and a researcher in computer music.',
    // Body fallback — rendered when admin's settings.bio is empty. Markdown-
    // like (paragraph-per-blank-line); admin override always wins.
    bodyFallback: [
      'He lives in Madrid, where he directs the Master in Electroacoustic Composition program at the Centro Superior Katarina Gurska and curates the new music festival VANG at the Cybele Palace. Additionally, he is a guest lecturer at the Royal Conservatoire in The Hague.',
      'His music has been performed by the Schönberg Ensemble, the Nieuw Ensemble, Garth Knox, the Birmingham Contemporary Music Group and Les Jeunes Solistes, among others, and he has been a member of the National System of Art Creators of Mexico.',
      "He has a PhD in Musical Composition from the University of Birmingham, where he studied with Jonty Harrison and Scott Wilson, and was a member of BEAST (Birmingham Electroacoustic Sound Theatre). During his PhD, he worked on the development of Iannis Xenakis's stochastic synthesis and of the BEASTmulch software (a tool for the presentation of electroacoustic music over multichannel systems).",
      "In 2006, he received a Master's Degree with Distinction in Sonology, with specialization in Composition, from the Institute of Sonology at the Royal Conservatoire in The Hague, studying with Paul Berg and Kees Tazelaar. In 2004, he received a Master's Degree in Composition from the Conservatory of Rotterdam, studying with Klaas de Vries and René Uijlenhoet. In 2003, he studied with Klaus Huber at Centre Acanthes in France.",
      'His compositions have been performed in the United Kingdom, the Netherlands, Germany, France, Switzerland, Austria, Spain, Andorra, Greece, the United States, Mexico, Cuba, El Salvador, Costa Rica, Colombia, Brazil, Chile, Argentina, Japan and Australia.',
      'He has given lectures and workshops on algorithmic composition, sound synthesis, stochastic synthesis and SuperCollider in: Barcelona (Escola Superior de Música de Catalunya), Berlin (Technische Universität and Universität der Künste), Buenos Aires (Centro Cultural cheLA), Cologne (Universität Köln), The Hague (Royal Conservatory), London (Goldsmiths, University of London), Madrid (Medialab Prado and Museo Nacional Centro de Arte Reina Sofía), Mexico City (Centro Nacional de las Artes) and Morelia (Centro Mexicano para la Música y las Artes Sonoras).',
      'He has received grants and prizes from the University of Birmingham (United Kingdom), the Fondo Nacional para la Cultura y las Artes (Mexico), the Schönberg Ensemble (Netherlands) and the Centre Acanthes (France).',
    ].join('\n\n'),
    role: 'Composer & Researcher',
    bodyLabel: 'Biography',
    educationLabel: 'Education',
    cvLabel: 'Curriculum Vitae',
    archiveTag: '[ Stage ]',
    archiveAlt: {
      stage1: 'Sergio Luque performing under a single light beam',
      stage2: 'Sergio Luque on stage with projected textures',
      stage3: 'Sergio Luque at the keyboard, low stage light',
    },
    // Education from the client's official bio. `years` is optional — the
    // PhD completion date isn't published, so its row renders without a
    // mono year tag.
    education: [
      {
        degree: 'Ph.D. in Musical Composition',
        institution: 'University of Birmingham, UK',
      },
      {
        degree: "Master's in Sonology (Composition, with Distinction)",
        institution: 'Institute of Sonology, Royal Conservatoire in The Hague',
        years: '2006',
      },
      {
        degree: "Master's in Composition",
        institution: 'Conservatory of Rotterdam',
        years: '2004',
      },
      {
        degree: 'Studies with Klaus Huber',
        institution: 'Centre Acanthes, France',
        years: '2003',
      },
    ] as ReadonlyArray<{
      readonly degree: string
      readonly institution: string
      readonly years?: string
    }>,
  },
  catalogue: {
    title: 'Catalogue',
    subtitle: 'A comprehensive index of compositions across vocal, instrumental, mixed, and electroacoustic media.',
    sectionLabel: 'List of works',
    featuredLabel: 'Featured work',
    filterAll: 'All',
    filterMixed: 'Vocal · Instrumental · Mixed',
    filterElectro: 'Electroacoustic',
    columnYear: 'Year',
    columnTitle: 'Title',
    columnInstrumentation: 'Instrumentation',
    columnReference: 'Reference',
    listen: 'Listen',
    viewScore: 'View score',
    viewPatch: 'View patch',
    watchVideo: 'Watch video',
    downloadLossless: 'Download lossless',
    empty: 'No entries in this category yet.',
  },
  concerts: {
    title: 'News',
    upcoming: 'Upcoming news',
    past: 'Past news',
    noUpcoming: 'No news scheduled in the near future',
    noPast: 'No past news on record',
  },
  publications: {
    title: 'Stochastics',
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
  lissajous: {
    title: 'Lissajous',
    subtitle:
      'Slowly evolving Lissajous curves, drawn live in your browser. Pick a preset or move the controls to explore the figure space.',
    presetsLabel: 'Presets',
    formLabel: 'Form',
    motionLabel: 'Motion',
    colorLabel: 'Color',
    count: 'Count',
    lineWidth: 'Line width',
    speed: 'Speed',
    drift: 'Drift',
    rotation: 'Rotation',
    trails: 'Trails',
    multicolor: 'Multicolor',
    lineColor: 'Line color',
    bgColor: 'Background',
    glow: 'Glow',
    blend: 'Blend',
    randomize: 'Randomize',
    reset: 'Reset',
    presets: {
      academico: 'Academic',
      denso: 'Dense',
      minimal: 'Minimal',
      psicodelico: 'Psychedelic',
      elisina: 'Elisiña',
    },
    blendModes: {
      'source-over': 'Normal',
      lighter: 'Additive',
      screen: 'Screen',
    },
  },
} as const
