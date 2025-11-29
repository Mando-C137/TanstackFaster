import { getUser } from "@/lib/queries";
import { signOut } from "./-login/serverFunctions";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signIn, signUp } from "./-login/serverFunctions";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export function LoginForm() {
  const {
    mutate: signInFn,
    isPending: isSignInPending,
    error: signInError,
  } = useMutation(
    mutationOptions({
      mutationFn: signIn,
      onSettled: (_1, _2, _3, _4, context) => {
        context.client.invalidateQueries();
      },
    }),
  );
  const {
    mutate: signUpFn,
    isPending: isSignUpPending,
    error: signUpError,
  } = useMutation(
    mutationOptions({
      mutationFn: signUp,
      onSettled: (_1, _2, _3, _4, context) => {
        context.client.invalidateQueries();
      },
    }),
  );

  const formRef = useRef<HTMLFormElement>(null);
  const isPending = isSignInPending || isSignUpPending;
  const error = signInError ?? signUpError;

  const handleAuth = async (type: "signIn" | "signUp") => {
    console.log("form");
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    if (type === "signIn") {
      signInFn({ data: formData });
    } else {
      signUpFn({ data: formData });
    }
  };

  return (
    <form ref={formRef} className="flex flex-col space-y-6">
      <div className="flex flex-col gap-4">
        <div className="mt-1">
          <Input
            id="username"
            name="username"
            aria-label="Username"
            type="text"
            autoCapitalize="off"
            autoComplete="username"
            spellCheck={false}
            required
            maxLength={50}
            className="relative block w-full appearance-none rounded-[1px] border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:ring-orange-500 focus:outline-none sm:text-sm"
            placeholder="Username"
          />
        </div>

        <div>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              aria-label="Password"
              type="password"
              required
              maxLength={100}
              className="relative block w-full appearance-none rounded-[1px] border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:ring-orange-500 focus:outline-none sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <Button
          type="button"
          className="bg-accent1 hover:bg-accent1 focus:ring-accent1 rounded-[1px] px-4 py-2 text-xs font-semibold text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
          disabled={isPending}
          onClick={() => handleAuth("signIn")}
        >
          {"Log in"}
        </Button>

        <Button
          type="button"
          variant={"ghost"}
          className="border-accent1 text-accent1 rounded-[2px] border-[1px] bg-white px-4 py-2 text-xs font-semibold"
          disabled={isPending}
          onClick={() => handleAuth("signUp")}
        >
          {"Create login"}
        </Button>
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}
    </form>
  );
}

export function SignInSignUp() {
  return (
    <Popover>
      <PopoverTrigger className="flex flex-row items-center gap-1">
        Log in{" "}
        <svg viewBox="0 0 10 6" className="h-[6px] w-[10px]">
          <polygon points="0,0 5,6 10,0"></polygon>
        </svg>
      </PopoverTrigger>
      <PopoverContent className="px-8 py-4">
        <span className="text-accent1 text-sm font-semibold">Log in</span>
        <LoginForm />
      </PopoverContent>
    </Popover>
  );
}

export function SignOut(props: { username: string }) {
  const { mutateAsync: signOutFn, isPending } = useMutation(
    mutationOptions({
      mutationFn: signOut,
      onSettled: (_1, _2, _3, _4, context) => {
        context.client.invalidateQueries();
      },
    }),
  );

  return (
    <Popover>
      <PopoverTrigger className="flex flex-row items-center gap-1">
        {props.username}{" "}
        <svg viewBox="0 0 10 6" className="h-[6px] w-[10px]">
          <polygon points="0,0 5,6 10,0"></polygon>
        </svg>
      </PopoverTrigger>
      <PopoverContent className="flex w-32 flex-col items-center px-8 py-4">
        <form>
          <Button
            type="button"
            onClick={() => signOutFn({})}
            disabled={isPending}
            variant={"ghost"}
            className="border-accent1 text-accent1 rounded-[2px] border-[1px] bg-white px-4 py-2 text-xs font-semibold"
          >
            {"Sign Out"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export function AuthServer() {
  const { data: user, isLoading, error } = useQuery(getUserQueryOptions());
  if (isLoading) {
    return "...Loading";
  }
  if (error) {
    return "error";
  }

  // TODO: Could dynamic load the sign-in/sign-up and sign-out components as they're not used on initial render
  if (!user) {
    return <SignInSignUp />;
  }
  return <SignOut username={user.username} />;
}

export function PlaceOrderAuth() {
  const { data: user } = useQuery(getUserQueryOptions());
  if (user) {
    return null;
  }
  return (
    <>
      <p className="text-accent1 font-semibold">Log in to place an order</p>
      <LoginForm />
    </>
  );
}

export const getUserQueryOptions = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: getUser,
  });
