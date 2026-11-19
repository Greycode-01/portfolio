/*
  =====================================================================
  CLIENT REVIEWS: the one place every review on the site lives.
  The homepage section and the /reviews page both read this list.
  =====================================================================

  HOW TO ADD A NEW REVIEW
  1. Copy one whole { ... }, block below and paste it right under the
     opening "[" (newest at the top).
  2. Fill in the fields. Only use a review a real client has given you.

       name      the client's name                          (required)
       business  their business or organisation             (required)
       text      the review, exactly as they wrote it       (required)
       rating    a whole number from 1 to 5                 (required)
       role      their job title, e.g. "Founder"            (optional, '' to skip)
       country   e.g. "Nigeria"                             (optional, '' to skip)
       service   'website', 'brand' or 'video'              (optional, '' to skip)
       case      the slug of a case study in
                 assets/case-studies.js, e.g. 'three-strands'.
                 Adds a "See the project" link              (optional, '' to skip)
       date      'YYYY-MM-DD'. Used to sort newest first    (optional)

  3. Save, push to GitHub, and Vercel updates the site.

  HOW IT SHOWS ON THE HOMEPAGE
  - 1 review      one large featured quote
  - 2 or 3        side by side (stacked on phones)
  - 4 or more     a slider with arrows and swipe
  The /reviews page always shows all of them in a grid.

  Reviews sent through the "Leave a review" form are NOT shown
  automatically. They arrive in your inbox / Firebase. Read them, and if
  you want one on the site, copy it in here by hand.
*/
window.GC_REVIEWS = [
  {
    name: 'Alex',
    role: '',
    business: 'Three Strands Health & Wellness',
    country: '',
    rating: 5,
    text: 'I want to thank you for this job. You have impressed me a lot. I had actually given up on my people doing good work for me. In less than a week, you delivered perfect results.',
    service: '',
    case: 'three-strands',
    date: ''
  }
];
