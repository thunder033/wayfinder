declare global {
  type KeysOfType<T, TProp> = { [P in keyof T]: T[P] extends TProp? P : never }[keyof T];

  type ObjectPathNormalize<T> =
    T extends Array<infer U>
      ? U extends object
        ? Required<U>
        : never
      : T extends object
        ? Required<T>
        : never

  type Inventory<T> = {[id: string]: T};
}

export {};
