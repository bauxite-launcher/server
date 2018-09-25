// @flow
import JsonFile from "./JsonFile";

export class DuplicateError extends Error {
  sourceConstructor: Object;
  key: string;
  value: any;

  constructor(sourceConstructor: Object, key: string, value: any) {
    super();
    this.sourceConstructor = sourceConstructor;
    this.key = key;
    this.value = value;
  }

  get message(): string {
    return `${this.sourceConstructor.name} is unique by its "${
      this.key
    }" property.\nTwo entries share the same ${this.key}, "${this.value}`;
  }
  set message(newValue: string) {
    throw new Error("DuplicateError generates its own messages");
  }
}

// Abstract(ish) class
class JsonCollectionFile<T: any = *, R = *> extends JsonFile<Array<T>> {
  static +parseItem: ?(R) => T;
  static +uniqueKeys: ?Array<string>;

  static validate(collection: Array<T>) {
    super.validate(collection);
    if (this.uniqueKeys) {
      this.validateUniqueness(collection);
    }
  }

  static validateUniqueness(collection: Array<T>) {
    const keys = this.uniqueKeys;
    if (!keys) {
      return;
    }
    collection.reduce(
      (seen, item) => {
        keys.forEach(key => {
          if (seen[key].includes(item[key])) {
            throw new DuplicateError(this, key, seen[key]);
          }
          seen[key].push(item[key]);
        });
        return seen;
      },
      keys.reduce((acc, key) => {
        acc[key] = [];
        return acc;
      }, {})
    );
  }

  // $FlowFixMe
  static async parse(rawValue: string): Promise<Array<T>> {
    const rawCollection: Array<R> = await super.parse(rawValue);
    if (!this.parseItem) {
      return rawCollection;
    }
    const collection: Array<T> = rawCollection.map(this.parseItem, this);
    return collection;
  }

  async find(callback: (item: T) => boolean): Promise<?T> {
    const collection = await this.read();
    return collection.find(callback);
  }

  async filter(callback: (item: T) => boolean): Promise<Array<T>> {
    const collection = await this.read();
    return collection.filter(callback);
  }

  async update(
    updater: (collection: Array<T>) => Promise<Array<T>> | Array<T>
  ): Promise<void> {
    const oldCollection = await this.read();
    const newCollection = await updater(oldCollection);
    return this.write(newCollection);
  }

  async write(newCollection: Array<T>): Promise<void> {
    this.constructor.validate(newCollection);
    return super.write(newCollection);
  }

  async add(entry: T): Promise<void> {
    return this.update(collection => collection.concat([entry]));
  }

  async remove(callback: (item: T) => boolean): Promise<void> {
    return this.update(collection =>
      collection.filter(item => !callback(item))
    );
  }
}

export default JsonCollectionFile;
