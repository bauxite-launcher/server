// @flow

import JsonCollectionFile from '../../util/JsonCollectionFile';

export type WhitelistEntry = {
  uuid: string,
  name: string
};

class WhitelistFile extends JsonCollectionFile<WhitelistEntry> {
  static uniqueKeys = ['uuid', 'name'];

  async userIsWhitelisted(uuidOrName: string): Promise<boolean> {
    return !!this.find(({ uuid, name }) => [uuid, name].includes(uuidOrName));
  }
}

export default WhitelistFile;
