// @flow
import JsonCollectionFile from "../../util/JsonCollectionFile";

export type OpsEntry = {
  uuid: string,
  name: string,
  level: 1 | 2 | 3 | 4,
  bypassesPlayerLimit: boolean
};

class OpsFile extends JsonCollectionFile<OpsEntry> {
  static uniqueKeys = ["uuid", "name"];

  async findByUuid(uuid: string): Promise<?OpsEntry> {
    return this.find(entry => entry.uuid === uuid);
  }

  async findByName(name: string): Promise<?OpsEntry> {
    return this.find(entry => entry.name === name);
  }
}

export default OpsFile;
