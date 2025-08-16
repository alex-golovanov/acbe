import { LowLevelPac } from "./LowLevelPac";
import { PingRating } from "./PingRating";
import { Price } from "./Price";
import { ProxyServers } from "./ProxyServers";
import { Promotion } from "./Promotion";
import { StoreAccount } from "./StoreAccount";
import { UserPac } from "./UserPac";
import { DynamicConfig } from "./DynamicConfig";

declare type StoreState = {
  browsecComAvailable: 'yes' | 'no' | 'unknown' | 'checking';
  cacheRemoval: boolean;
  daysAfterInstall: integer;
  domain: string | null;
  dontSendTelemetry: boolean;
  favorites: string[];
  lowLevelPac: LowLevelPac;
  page: string;
  ping: PingRating[];
  pingInProcess: boolean;
  prices: Price[];
  priceTrial: integer | undefined; // number of days
  promotions: Promotion[];
  promotionsBlock: boolean;
  proxyIsBroken: boolean;
  proxyServers: ProxyServers;
  timezoneChange: boolean;
  timezones: Map<string, integer>;
  user: StoreAccount;
  userPac: UserPac;
  viewedPersonalBanners: string[];
  webrtcBlock: boolean | null;
  warnings: string[];
  dynamicConfig: DynamicConfig;
};

export type { StoreState };
