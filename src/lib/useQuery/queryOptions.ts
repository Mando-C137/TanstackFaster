import { queryOptions } from "@tanstack/react-query";
import { getUser } from "../queries";

export const getUserQueryOptions = queryOptions({
  queryKey: ["user"],
  queryFn: getUser,
});
