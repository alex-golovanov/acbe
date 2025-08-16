declare type PopupBanner = 
  { 'type': 'poll banner' } |
  { 'type': 'premium expiration' } | 
  { 'type': 'speed' } | 
  Required<Pick<Promotion, 'banner'>> & {
    'exp294bgColor'?: 1 | 2 | 3,
    'promotionId': string, 
    'type': 'custom'
  } | 
  undefined;