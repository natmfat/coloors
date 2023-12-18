import assert from "assert";

export function parseId(id: number | string): number {
  if (typeof id === "number") {
    return id;
  }

  const parsedId = parseInt(id);
  assert(!isNaN(parsedId), "Invalid id");

  return parsedId;
}
