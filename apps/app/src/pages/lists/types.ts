import type { List, ListDetail as ApiListDetail } from "@daylear/types";

/** JSON-serialized shape of API entities (dates become strings over the wire). */
type Serialize<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Serialize<U>[]
    : T extends object
      ? { [K in keyof T]: Serialize<T[K]> }
      : T;

export type ListDetail = Serialize<ApiListDetail>;

export type ListSummary = Serialize<List>;
