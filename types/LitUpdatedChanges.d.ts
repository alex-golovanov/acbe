declare type LitUpdatedChanges<T> = {
  keys(): IterableIterator<keyof T>;
  get<Key extends string & keyof T>( key: Key ): T[ Key ];
  has<Key extends string & keyof T>( key: Key ): boolean;
};