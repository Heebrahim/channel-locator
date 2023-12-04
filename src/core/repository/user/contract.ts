import * as Effect from "@effect/io/Effect";
import * as Context from "@effect/data/Context";

import { Err } from "http-kit";
import { JsonParseError, StatusError } from "http-kit/response";
import { ApiError } from "@/core/exceptions";

export interface UserRepository {
  changePassword(_: {
    oldPassword: string;
    newPassword: string;
  }): Effect.Effect<never, Err | JsonParseError | StatusError | ApiError, any>;
}

export const UserRepository = Context.Tag<UserRepository>();
