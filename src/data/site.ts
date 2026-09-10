export const site = {
  brand: 'CHECK ENGINES',
  brandShort: 'CE',
  tagline: 'Precision. Performance. Protection.',
  heroSupport:
    'Denting & painting, PPF and wraps, ceramic coating, detailing and performance upgrades — for Hyderabad.',
  /** Real, from the Instagram bio. */
  tuningPartner: {
    name: 'Venom Performance India',
    handle: '@venomperformance_india',
  },
  location: {
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    label: 'Hyderabad, Telangana',
    // Placeholder — replace with the real street address when available.
    addressLines: ['Address to be provided', 'Hyderabad, Telangana'],
    mapCenter: { lat: 17.4065, lng: 78.4772 },
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Check+Engines+Hyderabad',
    hours: 'Service hours to be confirmed',
  },
  contact: {
    // Phone / email behind the IG "Contact info" button — placeholder for now.
    phone: '+91 00000 00000',
    whatsapp: '+91 00000 00000',
    email: 'hello@checkengines.example',
  },
  social: {
    instagram: {
      handle: '@checkengineshyd',
      url: 'https://www.instagram.com/checkengineshyd/',
    },
    facebook: {
      // Bio links a Facebook Page — exact URL to be supplied.
      url: 'https://www.facebook.com/',
    },
  },
  nav: [
    { label: 'Services', href: '#services' },
    { label: 'Experience', href: '#experience' },
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  primaryCta: { label: 'Book a Service', href: '#contact' },
  secondaryCta: { label: 'Explore Services', href: '#services' },
} as const;

export const whyPoints = [
  {
    title: 'Styling & Protection Specialists',
    body: 'Denting and painting, paint protection film, wraps, ceramic coating and detailing — the cosmetic and protection side of car care, handled end to end.',
  },
  {
    title: 'Work on Cars That Matter',
    body: 'A workshop used to European and performance cars — the finish and fitment are held to that standard.',
  },
  {
    title: 'Performance Upgrades',
    body: 'Custom and electronic exhaust systems and performance work, with tuning carried out in partnership with Venom Performance India.',
  },
  {
    title: 'Considered Finish',
    body: 'Paint, film and coating are finished to hold up in daylight and close inspection, not just in photos.',
  },
  {
    title: 'Owner-Led Decisions',
    body: 'Clear explanations of what a car needs and why, so the call stays with the owner.',
  },
];

/** Story-highlight-style specialities, from the Instagram page. */
export const specialities = [
  'Custom Exhausts',
  'PPF & Ceramic',
  'Retro Fits',
  'Speed Chime',
  'Wrapping',
];
