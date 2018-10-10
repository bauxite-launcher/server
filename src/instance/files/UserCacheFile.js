// @flow
import parseDate from 'date-fns/parse';
import JsonCollectionFile from '../../util/file/JsonCollectionFile';

export type RawCachedUser = {
  name: string,
  uuid: string,
  expiresOn: string,
};

export type CachedUser = {
  name: string,
  uuid: string,
  expiresOn: Date,
};

class UserCacheFile extends JsonCollectionFile<CachedUser, RawCachedUser> {
  static parseItem({ expiresOn, ...item }: RawCachedUser): CachedUser {
    return { ...item, expiresOn: parseDate(expiresOn) };
  }

  async writeRaw() {
    throw new Error(`UsernameCache is not writable (${this.path})`);
  }

  async findByUuid(uuid: string): Promise<?CachedUser> {
    return this.find(user => user.uuid === uuid);
  }

  async findByName(name: string): Promise<?CachedUser> {
    return this.find(user => user.name === name);
  }
}

export default UserCacheFile;
