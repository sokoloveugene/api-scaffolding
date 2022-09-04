export const compose =
  (...fns: Function[]) =>
  (arg: unknown) =>
    fns.reduce((composed, f) => f(composed), arg)

export const capitalize = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
