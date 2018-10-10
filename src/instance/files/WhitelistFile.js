// @flow

import JsonCollectionFile from '../../util/file/JsonCollectionFile';

export type WhitelistEntry = {
  uuid: string,
  name: string,
};

class WhitelistFile extends JsonCollectionFile<WhitelistEntry> {
  static uniqueKeys = ['uuid', 'name'];

  async userIsWhitelisted(uuidOrName: string): Promise<boolean> {
    const existingUser = await this.find(({ uuid, name }) => [uuid, name].includes(uuidOrName));
    return !!existingUser;
  }
}

export default WhitelistFile;
