declare global {
  type KeysOfType<T, TProp> = { [P in keyof T]: T[P] extends TProp ? P : never }[keyof T];

  // prettier-ignore
  type ObjectPathNormalize<T> =
    T extends Array<infer U>
      ? U extends object
        ? Required<U>
        : never
      : T extends object
        ? Required<T>
        : never

  type Inventory<T> = { [id: string]: T };
  type Nullable<T> = T | undefined | null;
  // eslint-disable-next-line @typescript-eslint/ban-types
  type Constructor<T = {}> = new (...args: any[]) => T;
}

export {};
