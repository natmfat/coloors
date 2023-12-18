import assert from "assert";

/**
 * Parse an id into a number \
 * GraphQL IDs are strings but MySQL primary keys are integers
 * @param id An id of either number or string type
 * @returns An id of number type
 */
export function parseId(id: number | string): number {
  if (typeof id === "number") {
    return id;
  }

  const parsedId = parseInt(id);
  assert(!isNaN(parsedId), "Invalid id");

  return parsedId;
}
