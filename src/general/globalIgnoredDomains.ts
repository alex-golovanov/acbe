export default Object.freeze( [
  // not real domains used in local networks
  'corp', 'dns', 'eth', 'home', 'ip', 'intra', 'intranet', 'local', 'onion', 'tenet',

  // real domains which are resolved to 127.0.0.1
  'discordapp.io', 'edit.boxlocalhost.com',
  'localhost.megasyncloopback.mega.nz', 'localhost.wwbizsrv.alibaba.com',
  'localtest.me', 'lvh.me', 'spotilocal.com', 'vcap.me',
  'www.amazonmusiclocal.com',

  // exclusions needed for the extension
  'google-analytics.com', 'secure.gate2shop.com', 'cdn.safecharge.com',

  // metrics
  'bmext1static.b-cdn.net', // production
  'bmqan2static.b-cdn.net', // qa

  'paddle.com', 'payment.kassa.ai', 'yoomoney.ru'
] );
