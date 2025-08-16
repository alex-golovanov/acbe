import type { TAction } from "src/general/store/reducers/types";
import { REMOVE_WARNING_ACTION, ADD_WARNING_ACTION } from "src/general/store/actions";

declare type StoreAction =
  {
    'type': 'Browsec.com available: set',
    'data': 'yes' | 'no' | 'unknown' | 'checking',
    'noStorage'?: boolean
  } |
  {
    'type': 'Cache removal: set',
    'data': boolean,
    'noStorage'?: boolean
  } |
  {
    'type': 'Days after install: set',
    'days': integer,
    'noStorage'?: boolean
  } |
  {
    'type': 'Domain: set',
    'domain': string | null,
    'noStorage'?: boolean
  } |
  {
    'type': 'Favorites: set',
    'data': string[],
    'noStorage'?: boolean
  } |
  {
    'type': 'Low level PAC: set',
    'data': LowLevelPac,
    'noStorage'?: boolean
  } |
  {
    'type': 'Low level PAC: update',
    'data': Partial<LowLevelPac>,
    'noStorage'?: boolean
  } |
  {
    'type': 'Page: set',
    'page': string,
    'noStorage'?: boolean
  } |
  {
    'type': 'Ping: set',
    'data': PingRating[],
    'noStorage'?: boolean
  } |
  {
    'type': 'PingInProcess: set',
    'data': boolean,
    'noStorage'?: boolean
  } |
  {
    'type': 'Price trial: set',
    'priceTrial': integer | void,
    'noStorage'?: boolean
  } |
  {
    'type': 'Prices: set',
    'prices': Price[],
    'noStorage'?: boolean
  } |
  {
    'type': 'Promotions: set',
    'data': Promotion[],
    'noStorage'?: boolean
  } |
  {
    'type': 'Promotions block: set',
    'data': boolean,
    'noStorage'?: boolean
  } |
  {
    'type': 'Proxy domains: set',
    'data': {
      'free': string[],
      'premium': string[]
    },
    'noStorage'?: boolean
  } |
  {
    'type': 'Proxy domains: set free',
    'data': string[],
    'noStorage'?: boolean
  } |
  {
    'type': 'Proxy domains: set premium',
    'data': string[],
    'noStorage'?: boolean
  } |
  {
    'type': 'Proxy is broken: set',
    'data': boolean,
    'noStorage'?: boolean
  } |
  {
    'type': 'Proxy servers: set',
    'data': ProxyServers,
    'noStorage'?: boolean
  } |
  {
    'type': 'Recommended countries: set',
    'data': string[],
    'noStorage'?: boolean
  } |
  {
    'type': 'Timezone change: set',
    'data': boolean,
    'noStorage'?: boolean
  } |
  {
    'type': 'Timezones: set',
    'data': Map<string, number>,
    'noStorage'?: boolean
  } |
  {
    'type': 'User: set',
    'data': AjaxAccount,
    'noStorage'?: boolean
  } |
  {
    'type': 'User PAC: set',
    'data': UserPac,
    'noStorage'?: boolean
  } |
  {
    'type': 'User PAC: update',
    'data': Partial<UserPac>,
    'noStorage'?: boolean
  } |
  {
    'type': 'Viewed personal banners: add',
    'banner': string,
    'noStorage'?: boolean
  } |
  {
    'type': 'Viewed personal banners: set',
    'banners': string[],
    'noStorage'?: boolean
  } |
  {
    'type': 'WebRTC blocking: set',
    'data': boolean,
    'noStorage'?: boolean
  }
  | TAction<typeof ADD_WARNING_ACTION, string>
  | TAction<typeof REMOVE_WARNING_ACTION, string>;