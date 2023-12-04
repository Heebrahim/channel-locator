import * as Context from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
import { ParseError } from "@effect/schema/ParseResult";

import { Err } from "http-kit";
import { JsonParseError, StatusError } from "http-kit/response";

import { Authentication } from "../../models/authentication";

export type AuthenticationInfo = {
  username: string;
  password: string;
};

export interface AuthenticationRepository {
  refreshToken(
    token: string
  ): Effect.Effect<
    never,
    Err | JsonParseError | ParseError | StatusError,
    Authentication
  >;

  signIn(
    info: AuthenticationInfo
  ): Effect.Effect<
    never,
    Err | JsonParseError | ParseError | StatusError,
    Authentication
  >;
}

export const AuthenticationRepository = Context.Tag<AuthenticationRepository>();
