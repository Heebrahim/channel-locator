import {ApiError as APIError} from '../types/api'

export class ApiError implements APIError {
  readonly _tag = "ApiError";
  constructor(readonly error: string) {}
}
