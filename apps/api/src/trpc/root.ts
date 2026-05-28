import { createTRPCRouter, publicProcedure } from "./init.js";
import { familiesRouter } from "../families/router.js";
import { listsRouter } from "../lists/router.js";
import { mealsRouter } from "../meals/router.js";
import { rewardsRouter } from "../rewards/router.js";
import { todosRouter } from "../todos/router.js";
import { routinesRouter } from "../routines/router.js";
import { usersRouter } from "../users/router.js";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({
    ok: true as const,
    service: "daylear-api",
  })),
  users: usersRouter,
  families: familiesRouter,
  routines: routinesRouter,
  rewards: rewardsRouter,
  meals: mealsRouter,
  lists: listsRouter,
  todos: todosRouter,
});

export type AppRouter = typeof appRouter;
