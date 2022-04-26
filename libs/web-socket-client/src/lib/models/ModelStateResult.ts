import { IResult } from './Result';

/**
 * Encapsulates data about a single error for a given model.
 */
export interface IModelError {
  propertyPath: string;
  error: string;
}

/**
 * Encapsulates all errors for a given model.
 */
export interface IModelSateResult<T> extends IResult<T> {
  errors: IModelError[];
}
