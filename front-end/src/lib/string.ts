export function toTitleCase(str: unknown | string) {
  return String(str)
    .split(" ")
    .map((subStr) => {
      return subStr.substring(0, 1).toUpperCase() + subStr.substring(1);
    })
    .join(" ");
}
