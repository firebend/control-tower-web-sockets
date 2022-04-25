/**
 * Encapsulates data about the result of a given request
 */
export interface IResult<T> {
  /**
   * A message associated with a request
   */
  message: string;

  /**
   * True if the operation was successful; otherwise, false
   */
  wasSuccessful: boolean;

  /**
   * A model containing the data returned from a request
   */
  model: T;
}
