export const getErrorMessage = (error: unknown): string => {
  let errorMessage: string;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  } else if (error && typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'An error occurred';
  }
  return errorMessage;
};
