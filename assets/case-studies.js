/*
  =====================================================================
  CASE STUDIES: one entry per case study. No page code needed.
  Each entry becomes its own page at  /work/<slug>  and a card in the
  "Our Work" section on the homepage.
  =====================================================================

  HOW TO ADD A NEW CASE STUDY
  1. Copy one whole { ... }, block below and paste it after the last one.
  2. Fill in the fields. Anything you leave empty ('' or []) is hidden
     automatically, so the page never shows an empty box.
     Only write facts that are true. Never guess a number.

       slug       the web address, lowercase with dashes: 'three-strands'
                  gives greycreatives.vercel.app/work/three-strands   (required)
       name       project name                                         (required)
       industry   e.g. 'Healthcare'                                    (required)
       location   e.g. 'Lagos, Nigeria'                                (optional)
       services   list of tags, e.g. ['Brand identity', 'Website']      (required)
       url        the live website, e.g. 'https://example.com'         (optional)
       cover      image for the card and the hero, e.g. 'assets/img/home-01.webp' (required)
       coverAlt   a short description of that image                     (required)
       client     1-2 sentences on who the client is                    (optional)
       problem    what was wrong or missing before                      (optional)
       did        3-5 short points on the work done                     (optional)
       gallery    more images: [['assets/img/x.webp', 'description'], ...]  (optional)
       result     what changed after launch (real facts only)           (optional)
       summary    one line for the homepage card                        (optional)
       metaDescription  text shown when the link is shared             (optional)

  3. The client review is picked up automatically: any review in
     assets/reviews-data.js with  case: '<this slug>'  shows on the page.
  4. Save and push to GitHub. For a proper preview image/title when the
     link is shared on WhatsApp or X, also run once:
         node tools/make-case-pages.js
     and push the new file in the work/ folder. (The page works without
     this step; only the share preview needs it.)
*/
window.GC_CASES = [
  {
    slug: 'three-strands',
    name: 'Three Strands Health & Wellness',
    industry: 'Healthcare — nurse practitioner / health and wellness practice',
    location: '',          // TODO (optional): add the client's city / state / country
    services: ['Brand identity', 'Website design & development', 'Blog'],
    url: 'https://3strandshealthnp.com',
    cover: 'assets/img/home-01.webp',
    coverAlt: 'Three Strands Health and Wellness homepage design',
    client: 'A psychiatric and family nurse practice that needed a site as calm and credible as the care itself.',
    problem: '',           // TODO (optional): what they had before
    did: [
      'Designed the brand identity: a mark that suggests both a flowing strand and a profile, applied across signage, print and social media',
      'Designed and built the website, including a blog the practice runs itself',
      'Built a warm, editorial homepage around their "one practice, four ways to support you" model, with clear paths to book from the hero',
      'Ongoing support: we keep making updates as the practice needs them'
    ],
    gallery: [
      ['assets/img/home-04.webp', 'Three Strands office reception signage featuring the brand mark'],
      ['assets/img/home-05.webp', 'Three Strands promotional flyer design'],
      ['assets/img/home-06.webp', 'Three Strands social media post design'],
      ['assets/img/home-07.webp', 'Three Strands logo printed on stationery']
    ],
    result: '',            // TODO (optional): real results only
    summary: 'Brand identity, a website and a blog the practice runs itself.',
    metaDescription: ''
  },
  {
    slug: 'brontiq',
    name: 'BRONTIQ MEDIA',
    industry: 'Media & entertainment — Lagos media house',
    location: 'Lagos, Nigeria',
    services: ['Website design & development'],
    url: 'https://brontiqmedia.com/',
    cover: 'assets/img/work-brontiq.webp',
    coverAlt: 'BRONTIQ MEDIA homepage with the headline Your stories. Your entertainment. Your platform., a studio camera photo and a Now on YouTube card',
    client: 'A Lagos media house with five brands (podcasts, interviews, entertainment news and a talent stage) that needed one website to hold them all.',
    problem: '',           // TODO (optional)
    did: [
      'Designed a multi-page site with room for more brands to be added later',
      'Led the homepage with a serif headline, real studio photography and a "Live from Lagos" tag, so it reads as a media house at first glance',
      'Added a Watch & Listen route and a live "Now on YouTube" link to the channel',
      'Built a clear path for new talent to get on the Spotlight stage',
      'Used the brand\'s navy, orange and ash with rounded cards and buttons, and included a light and dark toggle'
    ],
    gallery: [],
    result: '',            // TODO (optional): real results only
    summary: 'A bold, editorial multi-page site for a Lagos media house and its five brands.',
    metaDescription: ''
  },
  {
    slug: 'shayan',
    name: 'Shayan Private Equity',
    industry: 'Fintech — private equity platform',
    location: '',          // TODO (optional)
    services: ['Website design & development', 'Brand identity'],
    url: 'https://www.shayanequity.com/',
    cover: 'assets/img/home-02.webp',
    coverAlt: 'Shayan Private Equity homepage design',
    client: 'A fintech platform that had to feel as credible live as it looked in the pitch deck.',
    problem: '',           // TODO (optional)
    did: [
      'Designed a dashboard-first homepage with streaming FX, gold and crypto tickers',
      'Added side-by-side plan comparisons',
      'Built a growth-forward visual system in navy and warm orange, made to earn trust before a single call happens',
      'Designed the brand identity: logo, letterhead and business cards'
    ],
    gallery: [
      ['assets/img/brand-01.webp', 'Shayan Private Equity logo mockup'],
      ['assets/img/brand-02.webp', 'Shayan Private Equity letterhead mockup'],
      ['assets/img/brand-03.webp', 'Shayan Private Equity business card mockup'],
      ['assets/img/brand-04.webp', 'Shayan Private Equity flat logo']
    ],
    result: '',            // TODO (optional): real results only
    summary: 'A dashboard-first fintech homepage with live market data, plus the brand identity.',
    metaDescription: ''
  },
  {
    slug: 'zavron',
    name: 'Zavron Group',
    industry: 'Corporate — multi-region brand site',
    location: '',          // TODO (optional)
    services: ['Website design & development', 'Brand identity'],
    url: 'https://zavrongroup.com/',
    cover: 'assets/img/home-03.webp',
    coverAlt: 'Zavron Group homepage design',
    client: 'Zavron connects African-made brands to markets across Nigeria, Ghana and Rwanda, and needed one site that felt like all three at once.',
    problem: '',           // TODO (optional)
    did: [
      'Built an editorial, product-first layout that leads with photography',
      'Made a multi-country operation read as a single confident story',
      'Designed the parent brand identity, carried onto warehouse signage, office branding, packaging and business cards'
    ],
    gallery: [
      ['assets/img/brand-05.webp', 'Zavron warehouse signage'],
      ['assets/img/brand-06.webp', 'Zavron glass office wall sign'],
      ['assets/img/brand-07.webp', 'Zavron business card featuring Zavia and Zuria'],
      ['assets/img/brand-08.webp', 'Zavron packaging boxes']
    ],
    result: '',            // TODO (optional): real results only
    summary: 'One editorial site for brands spanning three countries, plus the parent identity.',
    metaDescription: ''
  },
  {
    slug: 'ya-foundation',
    name: 'YA Foundation',
    industry: 'Non-profit — cybersecurity awareness',
    location: '',          // TODO (optional)
    services: ['Website design & development'],
    url: 'https://yafoundationglobal.org/',
    cover: 'assets/img/work-ya.webp',
    coverAlt: 'YA Foundation homepage with the headline Building a Safer Digital Future, a live security event feed and a free course card',
    client: 'A cybersecurity-awareness foundation that needed a site as serious as the problem it tackles.',
    problem: '',           // TODO (optional)
    did: [
      'Built a multi-page experience in the foundation\'s own blue and red',
      'Created pages for programmes, a cyber-safety hub and the team',
      'Added a live security-event feed in the hero',
      'Included a light and dark toggle for every visitor'
    ],
    gallery: [],
    result: '',            // TODO (optional): real results only
    summary: 'A clear, trustworthy multi-page site for a cybersecurity foundation.',
    metaDescription: ''
  },
  {
    slug: 'intelpro',
    name: 'IntelPRO Solutions',
    industry: 'Cybersecurity — information security company',
    location: '',          // TODO (optional)
    services: ['Website design & development'],
    url: 'https://intelproglobal.com/',
    cover: 'assets/img/work-intelpro.webp',
    coverAlt: 'IntelPRO Solutions homepage with the headline Secure your digital future and an orbit diagram of identity, cloud, data and apps',
    client: 'An information and cybersecurity company that needed authority, not stock imagery.',
    problem: '',           // TODO (optional)
    did: [
      'Designed a multi-page platform on the brand\'s blue and red',
      'Built pages for services and leadership profiles',
      'Added a curated cyber-news feed, threat briefs and free online tools',
      'Created a hero that reads like live telemetry'
    ],
    gallery: [],
    result: '',            // TODO (optional): real results only
    summary: 'An authority-first platform for a cybersecurity company.',
    metaDescription: ''
  }
];
