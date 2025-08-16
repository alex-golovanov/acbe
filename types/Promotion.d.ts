declare type Promotion = {
  banner?: {
    link: string;
    structure: TreeElement;
  };
  clickUrl?: string;
  id: string;
  from: integer;
  kind: 'common' | 'personal';
  notifications: Array<{
    domains?: string[];
    html: TreeElement;
    texts: { [key: string]: { [key: string]: string } };
  }>;
  page?: string;
  pageActive?: boolean;
  pageScope?: 'all' | 'new';
  tariffs?: Tariff[];
  trialDays?: integer;
  till: integer;
  isDiscount: boolean;
};

export type { Promotion };
