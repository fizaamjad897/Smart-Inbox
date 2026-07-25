// Muted, deliberately un-crayon palette. Category is signalled by a small
// colored rule/dot, never a background fill or an emoji.
export const CATEGORIES = {
  URGENT: { label: 'Urgent', color: '#b23b34' },
  LEAD: { label: 'Lead', color: '#2f6f5e' },
  SUPPORT: { label: 'Support', color: '#3b5b8c' },
  NEWSLETTER: { label: 'Newsletter', color: '#6d5896' },
  OTHER: { label: 'Other', color: '#8a8578' }
};

export const CATEGORY_ORDER = ['URGENT', 'LEAD', 'SUPPORT', 'NEWSLETTER', 'OTHER'];

export const colorFor = (category) =>
  (CATEGORIES[(category || 'OTHER').toUpperCase()] || CATEGORIES.OTHER).color;
