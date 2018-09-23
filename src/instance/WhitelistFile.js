// @flow

import { JsonFile } from "../util/JsonFile";

export type WhitelistEntry = {
  uuid: string,
  name: string
};
export type Whitelist = Array<WhitelistEntry>;

class WhitelistFile extends JsonFile<Whitelist> {
  async readWhitelist(): Promise<Whitelist> {
    return this.readAsObject();
  }

  async writeWhitelist(newWhitelist: Whitelist): Promise<void> {
    return this.writeFromObject(newWhitelist);
  }

  async userIsWhitelisted(uuidOrName: string): Promise<boolean> {
    const whitelist = await this.readWhitelist();
    return whitelist.some(({ uuid, name }) =>
      [uuid, name].includes(uuidOrName)
    );
  }

  async addUser(uuid: string, name: string): Promise<void> {
    if (await this.userIsWhitelisted(uuid)) {
      return;
    }
    const oldWhitelist = await this.readWhitelist();
    const newWhitelist = oldWhitelist.concat([{ uuid, name }]);
    return this.writeWhitelist(newWhitelist);
  }

  async removeUser(uuidOrName: string): Promise<void> {
    if (!(await this.userIsWhitelisted(uuidOrName))) {
      return;
    }
    const oldWhitelist = await this.readWhitelist();
    const newWhitelist = oldWhitelist.filter(
      ({ uuid, name }) => ![uuid, name].includes(uuidOrName)
    );
    return this.writeWhitelist(newWhitelist);
  }
}

export default WhitelistFile;
