/** @deprecated Import from `../i18n` instead */
export { getContent as getSiteContent, type Locale, type WorkIndustry, type WorkService } from '../i18n';

import { getContent } from '../i18n';

/** @deprecated Use `getContent('es')` or pass locale from page */
export const site = getContent('es').site;
