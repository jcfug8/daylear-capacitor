import { authClient } from "../lib/auth-client";
import { trpc } from "../lib/trpc";

export function useAppUserName(): string {
  const { data: session } = authClient.useSession();
  const { data: me } = trpc.users.me.useQuery();
  return me?.name ?? session?.user.name ?? "User";
}
