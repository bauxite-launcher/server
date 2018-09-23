// @flow
import { JsonFile } from "../util/JsonFile";

export type OpsEntry = {
  uuid: string,
  name: string,
  level: 1 | 2 | 3 | 4,
  bypassesPlayerLimit: boolean
};
export type Ops = Array<OpsEntry>;

class OpsFile extends JsonFile<Ops> {
  async readOps(): Promise<Ops> {
    return this.readAsObject();
  }

  async writeOps(newOps: Ops): Promise<void> {
    return this.writeFromObject(newOps);
  }

  async userOpLevel(uuidOrName: string): Promise<number> {
    const ops = await this.readOps();
    const entry = ops.find(({ uuid, name }) =>
      [uuid, name].includes(uuidOrName)
    );
    if (!entry) return 0;
    return entry.level;
  }

  async addUser(entry: OpsEntry): Promise<void> {
    if (await this.userOpLevel(entry.uuid)) {
      return;
    }
    const oldOps = await this.readOps();
    const newOps = oldOps.concat([entry]);
    return this.writeOps(newOps);
  }

  async removeUser(uuidOrName: string): Promise<void> {
    if (!(await this.userOpLevel(uuidOrName))) {
      return;
    }
    const oldOps = await this.readOps();
    const newOps = oldOps.filter(
      ({ uuid, name }) => ![uuid, name].includes(uuidOrName)
    );
    return this.writeOps(newOps);
  }

  async updateUser(entry: OpsEntry): Promise<void> {
    await this.removeUser(entry.uuid);
    await this.addUser(entry);
  }
}

export default OpsFile;
