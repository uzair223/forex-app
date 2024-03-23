import _ from "lodash";

export const window =
  <T>(length: number) =>
  (value: T, index: number, arr: _.List<T> | ArrayLike<T>) => {
    return _.slice(arr, index - length, index);
  };

export const sum = (arr: number[]) => _.reduce(arr, (a, b) => a + b, 0);

export const mean = (arr: number[]) => sum(arr) / arr.length;
export const stdev = (arr: number[]) => {
  const m = mean(arr);
  return Math.sqrt(arr.map(x => Math.pow(x - m, 2)).reduce((a, b) => a + b) / arr.length);
};
