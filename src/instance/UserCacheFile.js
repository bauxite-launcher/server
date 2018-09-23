// @flow
import { JsonFile } from "../util/JsonFile";

export type UsernameCacheEntry = {
  name: string,
  uuid: string,
  expiresOn: string
};
export type UsernameCache = Array<UsernameCacheEntry>;

class UserCacheFile extends JsonFile<UsernameCache> {
  writeFromBuffer() {
    throw new Error("UsernameCache is not writable");
  }

  async readUsernameCache(): Promise<UsernameCache> {
    return this.readAsObject();
  }

  async getUser(uuidOrName: string): Promise<?UsernameCacheEntry> {
    const usernameCache = await this.readUsernameCache();
    return usernameCache.find(({ uuid, name }) =>
      [uuid, name].includes(uuidOrName)
    );
  }

  async getUsername(uuid: string): Promise<?string> {
    const user = await this.getUser(uuid);
    return user && user.name;
  }

  async getUuid(name: string): Promise<?string> {
    const user = await this.getUser(name);
    return user && user.uuid;
  }
}

export default UserCacheFile;
