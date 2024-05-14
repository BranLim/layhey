export const isTransactionDateWithin = (
  transactionDate: Date,
  budgetStartPeriod: Date,
  budgetEndPeriod: Date
): boolean => {
  if (transactionDate) {
    const transactionDateInMillis = transactionDate.getTime();
    return (
      transactionDateInMillis >= budgetStartPeriod.getTime() &&
      transactionDateInMillis <= budgetEndPeriod.getTime()
    );
  }
  return false;
};
