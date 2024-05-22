export type Interval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type SettingType = 'split' | 'repeat';

export type Setting = {
  type: SettingType;
};

export type SplitSetting = Setting & {
  type: 'split';
  frequency: number;
  interval?: Interval;
};

export type RepeatSetting = Setting & {
  type: 'repeat';
  frequency: number;
  interval: Interval;
  startDate: Date;
  endDate: Date;
};

export type Option = SplitSetting | RepeatSetting;

export type AdvancedSetting = {
  option: Option;
};
