export class ExpiredRefreshToken {
  readonly _tag = "ExpiredRefreshToken";
}

export class Unauthorized {
  readonly _tag = "Unauthorized";
  constructor(readonly reason: string) {}
}
