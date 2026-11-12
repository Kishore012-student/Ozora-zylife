// Field schemas for the page content editor.
// types: text · textarea · image · strings (list of paragraphs/lines) · list (repeatable objects) · group (nested object)
const legalDoc = [
  { k: 'title', label: 'Page title' }, { k: 'updated', label: 'Last updated' },
  { k: 'intro', label: 'Introduction', type: 'textarea' },
  { k: 'sections', label: 'Sections', type: 'list', item: 'section', fields: [{ k: 'title', label: 'Heading' }, { k: 'text', label: 'Text', type: 'textarea' }] },
];

export const PAGES = [
  { key: 'settings', label: 'Contact details', intro: 'Used across the website: footer, contact page, WhatsApp and call buttons.', sections: [
    { title: 'Contact details', fields: [
      { k: 'address', label: 'Address', type: 'textarea' }, { k: 'phone', label: 'Phone' }, { k: 'whatsapp', label: 'WhatsApp number', hint: 'Include country code, e.g. +91 98765 43210' },
      { k: 'email', label: 'Email' }, { k: 'hours', label: 'Business hours' },
      { k: 'mapQuery', label: 'Google Maps location', hint: 'Office or facility address as you would type it into Google Maps' },
      { k: 'whatsappMessage', label: 'Default WhatsApp message', type: 'textarea' },
      { k: 'footerNote', label: 'Footer note', type: 'textarea' },
    ] },
  ] },
  { key: 'home', label: 'Home', sections: [
    { title: 'Hero', fields: [{ k: 'heroHeadline', label: 'Headline', hint: 'Each sentence becomes a line; the last sentence appears as the capsule opens' }, { k: 'heroSub', label: 'Subheadline', type: 'textarea' }] },
    { title: 'Our range', fields: [{ k: 'rangeTitle', label: 'Section title' }, { k: 'allopathyText', label: 'Allopathy text', type: 'textarea' }, { k: 'allopathyImage', label: 'Allopathy image', type: 'image' }, { k: 'ayurvedaText', label: 'Ayurveda text', type: 'textarea' }, { k: 'ayurvedaImage', label: 'Ayurveda image', type: 'image' }] },
    { title: 'Featured products', fields: [{ k: 'featuredTitle', label: 'Title' }, { k: 'featuredIntro', label: 'Intro', type: 'textarea' }], note: 'Choose which products appear here with the “Featured” switch in Products.' },
    { title: 'Why choose Ozora Zylife', fields: [{ k: 'whyTitle', label: 'Title' }, { k: 'why', label: 'Points', type: 'list', item: 'point', fields: [{ k: 'title', label: 'Title' }, { k: 'text', label: 'Text', type: 'textarea' }, { k: 'image', label: 'Hover image', type: 'image' }] }] },
    { title: 'Certifications strip', fields: [{ k: 'certTitle', label: 'Title' }, { k: 'certText', label: 'Text', type: 'textarea' }, { k: 'certImage', label: 'Image', type: 'image' }] },
    { title: 'Closing call to action', fields: [{ k: 'ctaTitle', label: 'Title' }, { k: 'ctaText', label: 'Text', type: 'textarea' }] },
  ] },
  { key: 'about', label: 'About us', sections: [
    { title: 'Page header', fields: [{ k: 'headline', label: 'Headline' }, { k: 'sub', label: 'Subheadline', type: 'textarea' }, { k: 'heroImage', label: 'Header image', type: 'image' }] },
    { title: 'Our story', fields: [{ k: 'storyTitle', label: 'Section label' }, { k: 'story', label: 'Paragraphs', type: 'strings', item: 'paragraph' }] },
    { title: 'Mission and vision', fields: [{ k: 'mission', label: 'Mission', type: 'textarea' }, { k: 'vision', label: 'Vision', type: 'textarea' }] },
    { title: 'Values', fields: [{ k: 'values', label: 'Values', type: 'list', item: 'value', fields: [{ k: 'title', label: 'Title' }, { k: 'text', label: 'Text', type: 'textarea' }] }] },
    { title: 'At a glance', fields: [{ k: 'glance', label: 'Rows', type: 'list', item: 'row', fields: [{ k: 'label', label: 'Label' }, { k: 'value', label: 'Value' }] }] },
    { title: 'Call to action', fields: [{ k: 'ctaTitle', label: 'Text' }] },
  ] },
  { key: 'products', label: 'Products pages', sections: [
    { title: 'Products listing', fields: [{ k: 'headline', label: 'Headline' }, { k: 'sub', label: 'Subheadline', type: 'textarea' }, { k: 'searchPlaceholder', label: 'Search placeholder' }, { k: 'noResults', label: 'No results message', type: 'textarea' }, { k: 'ctaText', label: 'Bottom call to action', type: 'textarea' }] },
    { title: 'Product details template', fields: [{ k: 'importantNote', label: 'Important note', type: 'textarea' }, { k: 'enquiryTitle', label: 'Enquiry headline' }, { k: 'enquiryText', label: 'Enquiry text', type: 'textarea' }, { k: 'relatedTitle', label: 'Related products title' }] },
  ] },
  { key: 'quality', label: 'Quality & Manufacturing', sections: [
    { title: 'Page header', fields: [{ k: 'headline', label: 'Headline' }, { k: 'sub', label: 'Subheadline', type: 'textarea' }] },
    { title: 'Our approach', fields: [{ k: 'approachTitle', label: 'Label' }, { k: 'approach', label: 'Text', type: 'textarea' }] },
    { title: 'Our process', fields: [{ k: 'processTitle', label: 'Title' }, { k: 'process', label: 'Steps', type: 'list', item: 'step', fields: [{ k: 'title', label: 'Title' }, { k: 'text', label: 'Text', type: 'textarea' }, { k: 'image', label: 'Image', type: 'image' }] }] },
    { title: 'One standard', fields: [{ k: 'standardTitle', label: 'Title' }, { k: 'standard', label: 'Text', type: 'textarea' }] },
    { title: 'Packaging and storage', fields: [{ k: 'packagingTitle', label: 'Title' }, { k: 'packaging', label: 'Points', type: 'strings', item: 'point' }] },
    { title: 'Call to action', fields: [{ k: 'ctaText', label: 'Text' }] },
  ] },
  { key: 'certifications', label: 'Certifications page', intro: 'Upload the certificates and licences themselves in “Certifications & Licences”.', sections: [
    { title: 'Page text', fields: [{ k: 'headline', label: 'Headline' }, { k: 'sub', label: 'Subheadline', type: 'textarea' }, { k: 'certIntro', label: 'Certifications intro', type: 'textarea' }, { k: 'licenceIntro', label: 'Licences intro', type: 'textarea' }, { k: 'note', label: 'Note', type: 'textarea' }, { k: 'ctaText', label: 'Call to action' }] },
  ] },
  { key: 'contact', label: 'Contact page', intro: 'Phone, email, address and map are edited in “Contact details”.', sections: [
    { title: 'Page text', fields: [{ k: 'headline', label: 'Headline' }, { k: 'sub', label: 'Subheadline', type: 'textarea' }] },
    { title: 'Enquiry form messages', fields: [{ k: 'consent', label: 'Consent line' }, { k: 'success', label: 'Success message', type: 'textarea' }, { k: 'error', label: 'Error message', type: 'textarea' }] },
  ] },
  { key: 'legal', label: 'Legal pages', sections: [
    { title: 'Privacy Policy', fields: [{ k: 'privacy', type: 'group', fields: legalDoc }] },
    { title: 'Terms of Use', fields: [{ k: 'terms', type: 'group', fields: legalDoc }] },
    { title: 'Medical Disclaimer', fields: [{ k: 'disclaimer', type: 'group', fields: legalDoc }] },
  ] },
];
