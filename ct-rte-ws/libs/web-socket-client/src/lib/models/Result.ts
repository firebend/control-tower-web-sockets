export interface IResult<T> {
  message: string;
  wasSuccessful: boolean;
  model: T;
}
