/* Some links for the popup */
import config from 'config';


const baseUrl: string = config.baseUrl;
const extra =
  '?source=extension&utm_source=chromium+extension&utm_medium=link&utm_campaign=default_campaign';

export default {
  'base': baseUrl,
  'contactUs': baseUrl + '/contact_us' + extra,
  'newUser': baseUrl + '/users/new' + extra,
  'premium': baseUrl + '/orders/new?plan_id=biennial&ref=extension',
  'resetPassword': `${baseUrl}/login${extra}#forgot_password`
};
