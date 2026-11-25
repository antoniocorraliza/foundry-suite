/** Class of an error, whatever its constructor takes. */
export type ErrorClass<ErrorType extends Error> = abstract new (...parameters: Array<never>) => ErrorType;
