export type Interval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type SplitRule = {
  type: 'split';
  frequency: number;
  interval?: Interval;
  startDate?: Date;
  endDate?: Date;
};

export type RepeatRule = {
  type: 'repeat';
  frequency: number;
  interval: Interval;
  startDate: Date;
  endDate: Date;
};

export type Rule = SplitRule | RepeatRule;
