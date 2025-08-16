declare type ProxyProxyinfo = 
  { 'type': 'direct' } |
  {
    'type': 'https' | 'proxy' | 'socks',
    'host': string, 
    'port': string, 
    'failoverTimeout'?: number 
  };