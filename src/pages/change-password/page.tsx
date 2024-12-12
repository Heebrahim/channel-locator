import { PasswordInput } from "@/components/password";
import { Button, FormControl, FormLabel, useToast } from "@chakra-ui/react";
import {
  ActionFunctionArgs,
  Form,
  redirect,
  useActionData,
  useLocation,
  useNavigation,
} from "react-router-dom";

import * as E from "@effect/data/Either";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";

import { SessionStorageLive } from "@/core/adapters/storage/implementation";
import { UserRepositoryLive } from "@/core/repository/user/implementation";
import { changePassword } from "@/core/services/authentication";
import { ApiError } from "@/core/types/api";
import { useEffect } from "react";
import { HttpClientLive } from "@/common/http-client";
import { catch403 } from "@/common/exception";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const { confirmNewPassword, ...data } = Object.fromEntries(formData);

  if (confirmNewPassword !== data.newPassword) {
    return E.left({ message: "Confirm password must match password" });
  }

  const result = await pipe(
    changePassword(data as any),
    Effect.catchTag("StatusError", catch403),
    Effect.provideLayer(
      UserRepositoryLive.pipe(
        Layer.useMerge(HttpClientLive),
        Layer.useMerge(SessionStorageLive)
      )
    ),
    Effect.either,
    Effect.runPromise
  );

  if (E.isRight(result)) {
    return redirect("/login");
  }

  return result;
}

export function ChangePassword() {
  const toast = useToast();

  const location = useLocation();

  const navigation = useNavigation();

  const data = useActionData() as null | E.Either<
    ApiError | { message: string },
    void
  >;

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (data && E.isLeft(data)) {
      const reason =
        ("error" in data.left ? data.left.error : data.left.message) ??
        "An unexpected error occurred";

      toast({ status: "error", description: reason });
    }
  }, [data, toast]);

  return (
    <div className="lg:flex h-screen">
      <div className="flex-1 lg:h-full h-[50%] bg-[#FFF9E6] relative">
        <div className="h-full flex items-center justify-center">
          <div
            className="lg:w-[35rem] lg:h-[35rem] w-[90%] h-[90%] bg-cover"
            style={{ backgroundImage: "url(bg.jpg)" }}
          />
        </div>

        <div className="absolute bottom-0 m-4 p-2 lg:p-0 lg:m-8">
          <img src="/mtn-logo.svg" className="w-10" />
          <p>
            <i>Everywhere you go</i>
          </p>
        </div>
      </div>

      <main className="lg:h-full flex-1 flex items-center justify-center">
        <figure className="space-y-8 w-full bg-white rounded-md p-10">
          <figcaption className="space-y-10">
            <h1 className="text-xl font-semibold">Create New Password</h1>
          </figcaption>

          <Form
            method="post"
            className="space-y-8 w-full"
            action={`/change-password?continueTo=${from}`}
          >
            <FormControl isRequired>
              <FormLabel>Old Password</FormLabel>
              <PasswordInput name="oldPassword" />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>New Password</FormLabel>
              <PasswordInput
                name="newPassword"
                title="Password must contain uppercase letters, numbers and special characters"
                pattern="^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,20}$"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <PasswordInput name="confirmNewPassword" />
            </FormControl>

            <Button
              type="submit"
              className="block w-9/12 mx-auto"
              isLoading={navigation.state === "submitting"}
            >
              Update
            </Button>
          </Form>
        </figure>
      </main>
    </div>
  );
}
