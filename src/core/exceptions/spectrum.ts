export class SpectrumError {
  readonly _tag = "SpectrumError";
  constructor(readonly originalError?: unknown, readonly message?: string) {}
}
