// Default site content, taken from "Ozora Zylife Website Content" (Os2 Studio).
// Everything here is editable from the admin dashboard. Text in [square brackets]
// is a placeholder the Ozora Zylife team should replace with verified details.

export const settingsDefaults = {
  brand: 'Ozora Zylife',
  address: '[Full address]',
  phone: '[Phone number]',
  whatsapp: '[WhatsApp number]',
  email: '[Email address]',
  hours: '[Monday to Saturday, 9:30 AM to 6:30 PM]',
  mapQuery: '[office or facility address]',
  whatsappMessage: 'Hello Ozora Zylife, I would like to know more about your products.',
};

export const homeDefaults = {
  seoTitle: 'Ozora Zylife | Allopathy and Ayurveda Medicines',
  seoDescription: 'Ozora Zylife offers a trusted range of Allopathy and Ayurveda medicines, made with care and backed by verified quality standards. Explore our products.',
  heroHeadline: 'Modern medicine. Traditional wisdom. One trusted name.',
  heroSub: 'Ozora Zylife brings together Allopathy and Ayurveda in one carefully made range of medicines, built on quality you can verify.',
  rangeTitle: 'Two systems of care. One standard of quality.',
  allopathyText: 'Reliable formulations for everyday health needs, made to consistent quality standards.',
  allopathyImage: 'assets/gen/allopathy.webp',
  ayurvedaText: 'Time-tested formulations rooted in traditional knowledge, prepared with modern care.',
  ayurvedaImage: 'assets/gen/ayurveda.webp',
  featuredTitle: 'Featured products',
  featuredIntro: 'A selection from our Allopathy and Ayurveda range.',
  whyTitle: 'Why choose Ozora Zylife',
  why: [
    { title: 'Quality first', text: 'Every product follows a defined process from sourcing to packaging.', image: 'assets/test.webp' },
    { title: 'Licensed and certified', text: 'Our certifications and licences are published openly for you to review.', image: 'assets/plant.webp' },
    { title: 'Two traditions, one range', text: 'Allopathy and Ayurveda, offered side by side by one brand.', image: 'assets/gen/ayurveda.webp' },
    { title: 'Responsive support', text: 'Our team answers product and business enquiries directly.', image: 'assets/gen/support.webp' },
  ],
  certTitle: 'Certified. Licensed. Transparent.',
  certText: 'We believe trust should be visible. View our certifications and licences in full.',
  certImage: 'assets/plant.webp',
  ctaTitle: 'Have a question about our products?',
  ctaText: 'Whether you are a customer or a pharmacy, our team is ready to help.',
};

export const aboutDefaults = {
  seoTitle: 'About Ozora Zylife | Our Story, Mission and Values',
  seoDescription: 'Learn about Ozora Zylife, a medicine brand bringing Allopathy and Ayurveda together with a clear focus on quality, trust and care.',
  headline: 'Care, made with integrity.',
  sub: 'We are Ozora Zylife. We make medicines people can rely on.',
  heroImage: 'assets/gen/about.webp',
  storyTitle: 'Our story',
  story: [
    'Ozora Zylife was founded in [year] in [city, state] with a simple belief: good health should be supported by medicines that are made well and explained honestly.',
    'We offer a range that brings two systems of care together. Our Allopathy products serve everyday health needs with proven formulations. Our Ayurveda products draw on traditional knowledge, prepared to modern quality standards.',
    'Today, we serve customers and pharmacies across [regions served], and we continue to grow our range with the same care we started with.',
  ],
  mission: 'To make dependable Allopathy and Ayurveda medicines accessible, with quality and transparency at every step.',
  vision: 'To be a trusted name in healthcare, known for products people can rely on and a brand they can believe in.',
  values: [
    { title: 'Quality', text: 'We follow defined standards from sourcing to packaging.' },
    { title: 'Honesty', text: 'We share only verified information about our products.' },
    { title: 'Responsibility', text: 'We respect the trust our customers place in us.' },
    { title: 'Care', text: 'We put the wellbeing of people at the centre of what we do.' },
  ],
  glance: [
    { label: 'Founded', value: '[Year]' },
    { label: 'Headquarters', value: '[City, State]' },
    { label: 'Product range', value: 'Allopathy and Ayurveda' },
    { label: 'Products', value: '[Number] products' },
    { label: 'Markets served', value: '[Regions]' },
  ],
  ctaTitle: 'Want to know more about our range?',
};

export const productsPageDefaults = {
  seoTitle: 'Products | Allopathy and Ayurveda Range | Ozora Zylife',
  seoDescription: 'Browse the Ozora Zylife range of Allopathy and Ayurveda medicines. View compositions, pack sizes and product details, and send an enquiry.',
  headline: 'Our products',
  sub: 'Explore our Allopathy and Ayurveda range. Select a product to see its full details.',
  searchPlaceholder: 'Search by product name',
  noResults: 'No products match your search. Try another name or browse all products.',
  ctaText: 'Looking for a specific product or bulk supply? Our team can help.',
  importantNote: 'This product information is provided for general reference only. Please use as directed by a qualified healthcare professional. Read the label before use.',
  enquiryTitle: 'Interested in this product?',
  enquiryText: 'Send us an enquiry and our team will get back to you.',
  relatedTitle: 'You may also be interested in',
};

export const qualityDefaults = {
  seoTitle: 'Quality and Manufacturing | Ozora Zylife',
  seoDescription: 'See how Ozora Zylife maintains quality at every step, from sourcing and production to packaging and storage.',
  headline: 'Quality at every step.',
  sub: 'Good medicine starts long before it reaches you. Here is how we make sure every product meets our standards.',
  approachTitle: 'Our approach',
  approach: 'Quality is not a final check at Ozora Zylife. It is built into every stage, from the materials we choose to the way each product is packed and stored. We work with [manufacturing facilities / partners] that follow [applicable standard, for example GMP], so every batch is made with consistency and care.',
  processTitle: 'Our process',
  process: [
    { title: 'Sourcing', text: 'Raw materials and herbs are sourced from approved suppliers and checked before use.', image: 'assets/gen/sourcing.webp' },
    { title: 'Formulation', text: 'Each product follows a defined, approved formulation.', image: 'assets/formulate.webp' },
    { title: 'Manufacturing', text: 'Products are made in controlled conditions by trained teams.', image: 'assets/plant.webp' },
    { title: 'Quality checks', text: 'Batches are tested against set quality parameters before release.', image: 'assets/test.webp' },
    { title: 'Packaging', text: 'Products are sealed and labelled clearly to protect quality and support safe use.', image: 'assets/gen/packaging.webp' },
    { title: 'Storage and dispatch', text: 'Finished products are stored and dispatched under suitable conditions.', image: 'assets/gen/storage.webp' },
  ],
  standardTitle: 'Allopathy and Ayurveda, one standard',
  standard: 'Our Allopathy and Ayurveda products follow different traditions, but they share the same commitment to quality. Every product we offer is made, tested and packed with equal care.',
  packagingTitle: 'Packaging and storage',
  packaging: ['Tamper-evident, sealed packaging.', 'Clear labels with composition, batch number and expiry date.', 'Storage guidance printed on every pack.'],
  ctaText: 'Our certifications and licences are available to view.',
};

export const certificationsDefaults = {
  seoTitle: 'Certifications and Licences | Ozora Zylife',
  seoDescription: 'View the certifications and licences held by Ozora Zylife. We publish our credentials openly so you can verify them.',
  headline: 'Trust you can verify.',
  sub: 'We publish our certifications and licences openly, so you never have to take our word for it.',
  certIntro: 'Our certifications reflect the standards we follow in making and handling our products.',
  licenceIntro: 'Ozora Zylife operates under the following licences, issued by the relevant authorities.',
  note: 'All certificates and licences shown on this page are current at the time of upload. For verification or more information, please contact us.',
  ctaText: 'Need a copy of a certificate or licence for your records?',
};

export const contactDefaults = {
  seoTitle: 'Contact Ozora Zylife | Product and Business Enquiries',
  seoDescription: 'Get in touch with Ozora Zylife for product information, pharmacy enquiries or general questions. Call, WhatsApp or send us a message.',
  headline: "Let's talk.",
  sub: 'Questions about a product, bulk supply or anything else? Our team will get back to you within [one working day].',
  consent: 'By submitting this form, you agree to our Privacy Policy.',
  success: 'Thank you. Your enquiry has been received. Our team will contact you shortly.',
  error: 'Something went wrong. Please try again or call us directly.',
};

export const legalDefaults = {
  notice: 'This is starter content. Ozora Zylife should have it reviewed by its legal advisor before launch.',
  privacy: {
    seoTitle: 'Privacy Policy | Ozora Zylife',
    title: 'Privacy Policy',
    updated: '[Date]',
    intro: 'Ozora Zylife ("we", "us") respects your privacy. This policy explains what information we collect through this website and how we use it.',
    sections: [
      { title: 'Information we collect', text: 'When you send an enquiry, we collect your name, phone number, email address, business name and message. We also collect basic usage data, such as pages visited, through analytics tools.' },
      { title: 'How we use it', text: 'We use your information only to respond to your enquiry, share product information you ask for, and improve our website.' },
      { title: 'Sharing', text: 'We do not sell your information. We share it only with service providers who help us run this website, and only as needed.' },
      { title: 'Security', text: 'We take reasonable steps to protect your information from unauthorised access.' },
      { title: 'Your choices', text: 'You may ask us to update or delete your information at any time by contacting [email address].' },
      { title: 'Contact', text: 'For privacy questions, write to [email address].' },
    ],
  },
  terms: {
    seoTitle: 'Terms of Use | Ozora Zylife',
    title: 'Terms of Use',
    updated: '[Date]',
    intro: 'By using this website, you agree to these terms.',
    sections: [
      { title: 'Use of content', text: 'All content on this website, including text, images and logos, belongs to Ozora Zylife. It may not be copied or reused without written permission.' },
      { title: 'Product information', text: 'Product details are provided for general information only. They are not a substitute for advice from a qualified healthcare professional.' },
      { title: 'Accuracy', text: 'We work to keep information accurate and current, but we do not guarantee that all content is complete or error-free.' },
      { title: 'Changes', text: 'We may update these terms at any time. Continued use of the website means you accept the updated terms.' },
      { title: 'Governing law', text: 'These terms are governed by the laws of India. Disputes are subject to the courts of [city].' },
    ],
  },
  disclaimer: {
    seoTitle: 'Medical Disclaimer | Ozora Zylife',
    title: 'Medical Disclaimer',
    updated: '',
    intro: 'The information on this website is for general awareness only. It is not medical advice and should not be used to diagnose or treat any condition. Always consult a qualified doctor or pharmacist before starting any medicine. Use products only as directed on the label or by a healthcare professional.',
    sections: [],
  },
};

export const CONTENT_DEFAULTS = {
  settings: settingsDefaults,
  home: homeDefaults,
  about: aboutDefaults,
  products: productsPageDefaults,
  quality: qualityDefaults,
  certifications: certificationsDefaults,
  contact: contactDefaults,
  legal: legalDefaults,
};

// Sample products are clearly marked placeholders: the content guide asks for
// verified information only, so the team replaces these from the admin panel.
export const productDefaults = [
  { name: '[Sample Allopathy Tablet]', category: 'Allopathy', dosageForm: 'Tablet', packSize: '10 x 10', images: ['assets/pack-box.webp', 'assets/gen/allopathy.webp'], featured: true, order: 1,
    shortDescription: '[One-line summary of what this product is for.]', composition: '[Active ingredient and strength per tablet]', storage: '[Store below 25°C, away from direct sunlight]', prescription: 'Required',
    description: '[Full product description. Add only verified information from the approved label and product literature.]' },
  { name: '[Sample Allopathy Syrup]', category: 'Allopathy', dosageForm: 'Syrup', packSize: '[100 ml]', images: ['assets/pack-bottle.webp'], featured: true, order: 2,
    shortDescription: '[One-line summary of what this product is for.]', composition: '[Each 5 ml contains ...]', storage: '[Store in a cool, dry place]', prescription: 'Required',
    description: '[Full product description. Add only verified information from the approved label and product literature.]' },
  { name: '[Sample Ayurveda Capsule]', category: 'Ayurveda', dosageForm: 'Capsule', packSize: '[10 x 10]', images: ['assets/pack-capsule.webp', 'assets/gen/ayurveda.webp'], featured: true, order: 3,
    shortDescription: '[One-line summary of what this product is for.]', composition: '[Herbal ingredients and quantity per capsule]', storage: '[Store in a cool, dry place]', prescription: 'Not required',
    description: '[Full product description. Add only verified information from the approved label and product literature.]' },
  { name: '[Sample Ayurveda Oil]', category: 'Ayurveda', dosageForm: 'Oil', packSize: '[100 ml]', images: ['assets/gen/ayurveda.webp'], featured: false, order: 4,
    shortDescription: '[One-line summary of what this product is for.]', composition: '[Herbal ingredients per 100 ml]', storage: '[Store in a cool, dry place]', prescription: 'Not required',
    description: '[Full product description. Add only verified information from the approved label and product literature.]' },
];

export const credentialDefaults = [
  { kind: 'certificate', title: '[Certificate name]', issuedBy: '[Issuing authority]', validUntil: '[Date]', order: 1 },
  { kind: 'certificate', title: '[Certificate name]', issuedBy: '[Issuing authority]', validUntil: '[Date]', order: 2 },
  { kind: 'licence', title: '[Licence type, for example Drug Licence]', number: '[Number]', issuedBy: '[Issuing authority]', validUntil: '[Date]', order: 1 },
  { kind: 'licence', title: '[Licence type]', number: '[Number]', issuedBy: '[Issuing authority]', validUntil: '[Date]', order: 2 },
];
