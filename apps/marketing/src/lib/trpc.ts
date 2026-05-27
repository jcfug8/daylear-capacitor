import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@daylear/types";

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient();

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${apiUrl}/trpc`,
    }),
  ],
});
