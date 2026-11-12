// Field schemas for the page content editor.
// types: text · textarea · image · strings (list of paragraphs/lines) · list (repeatable objects) · group (nested object)
const legalDoc = [
  { k: 'title', label: 'Page title' }, { k: 'updated', label: 'Last updated' },
  { k: 'intro', label: 'Introduction', type: 'textarea' },
  { k: 'sections', label: 'Sections', type: 'list', item: 'section', fields: [{ k: 'title', label: 'Heading' }, { k: 'text', label: 'Text', type: 'textarea' }] },
];

export const PAGES = [
  { key: 'about', label: 'About us', sections: [
    { title: 'Page header', fields: [{ k: 'headline', label: 'Headline' }, { k: 'sub', label: 'Subheadline', type: 'textarea' }, { k: 'heroImage', label: 'Header image', type: 'image' }] },
    { title: 'Our story', fields: [{ k: 'storyTitle', label: 'Section label' }, { k: 'story', label: 'Paragraphs', type: 'strings', item: 'paragraph' }] },
    { title: 'Mission and vision', fields: [{ k: 'mission', label: 'Mission', type: 'textarea' }, { k: 'vision', label: 'Vision', type: 'textarea' }] },
    { title: 'Values', fields: [{ k: 'values', label: 'Values', type: 'list', item: 'value', fields: [{ k: 'title', label: 'Title' }, { k: 'text', label: 'Text', type: 'textarea' }] }] },
    { title: 'At a glance', fields: [{ k: 'glance', label: 'Rows', type: 'list', item: 'row', fields: [{ k: 'label', label: 'Label' }, { k: 'value', label: 'Value' }] }] },
    { title: 'Call to action', fields: [{ k: 'ctaTitle', label: 'Text' }] },
  ] },
  { key: 'settings', label: 'Contact details', intro: 'These contact details are displayed on the Contact page, in the website Footer, and used for phone/email/WhatsApp links.', sections: [
    { title: 'Contact info', fields: [
      { k: 'address', label: 'Company address', type: 'textarea', hint: 'Full street address, city, state and PIN code' },
      { k: 'phone', label: 'Phone number', hint: 'E.g. +91 98765 43210' },
      { k: 'email', label: 'Email address', hint: 'E.g. contact@ozorazylife.com' },
      { k: 'whatsapp', label: 'WhatsApp number', hint: 'With country code, e.g. +91 98765 43210' },
      { k: 'hours', label: 'Business hours', hint: 'E.g. Mon – Sat: 9:00 AM – 6:00 PM' },
      { k: 'mapQuery', label: 'Google Maps search location', hint: 'Address or landmark query for embedded map' },
      { k: 'whatsappMessage', label: 'Default WhatsApp message', type: 'textarea' },
    ] },
  ] },
  { key: 'legal', label: 'Legal pages', sections: [
    { title: 'Privacy Policy', fields: [{ k: 'privacy', type: 'group', fields: legalDoc }] },
    { title: 'Terms of Use', fields: [{ k: 'terms', type: 'group', fields: legalDoc }] },
    { title: 'Medical Disclaimer', fields: [{ k: 'disclaimer', type: 'group', fields: legalDoc }] },
  ] },
];
