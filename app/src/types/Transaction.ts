export type Transaction = {
  id?: string;
  category: string;
  amount: number;
  currency?: string;
  date: Date;
};
