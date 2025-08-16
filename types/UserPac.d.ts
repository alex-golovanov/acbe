declare type UserPac = {
  mode: 'direct' | 'proxy'; // (in past can be 'broken')
  country: string | null;
  filters: SiteFilter[];
};

export type { UserPac };