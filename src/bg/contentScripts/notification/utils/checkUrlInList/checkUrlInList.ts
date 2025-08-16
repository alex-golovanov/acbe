import urlToDomain from 'tools/urlToDomain';

export const CONTENT_SCRIPT_DOMAINS = Object.freeze([
  'bbc.co.uk',
  'bbc.com',
  'channel4.com',
  'chaturbate.com',
  'dailymotion.com',
  'eporner.com',
  'hdrezka.ag',
  'hentaihaven.org',
  'hitomi.la',
  'hotstar.com',
  'itv.com',
  'myfreecams.com',
  'nhentai.net',
  'pandora.com',
  'pornreactor.cc',
  'rezka.ag',
  'seasonvar.ru',
  'spankbang.com',
  'spotify.com',
  'twitch.tv',
  'vimeo.com',
  'xhamster.com',
  'xnxx.com',
  'xvideos.com',
  'youtube.com',
]);

export const checkUrlInList = (url: string | undefined): boolean => {
  const domain = urlToDomain(url);
  if (!domain) return false;

  return (
    CONTENT_SCRIPT_DOMAINS.includes(domain) ||
    CONTENT_SCRIPT_DOMAINS.some((item) => domain.endsWith('.' + item))
  );
};
