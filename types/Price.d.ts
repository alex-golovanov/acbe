declare type Price = {
  currency: string;
  duration: integer; // in months
  oldValue?: number;
  value: number;
};

export type { Price };
