export type Interval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type OptionType = 'split' | 'repeat';

export type SplitOption = OptionType & {
  type: 'split';
  frequency: number;
  interval?: Interval;
  startDate?: Date;
  endDate?: Date;
};

export type RepeatOption = OptionType & {
  type: 'repeat';
  frequency: number;
  interval: Interval;
  startDate: Date;
  endDate: Date;
};

export type Option = SplitOption | RepeatOption;

export type AdvancedSetting = {
  option: Option;
};
