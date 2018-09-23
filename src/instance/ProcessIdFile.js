// @flow

import { resolve as resolvePath } from "path";
import { TextFile } from "../util/TextFile";

class ProcessIdFile extends TextFile {
  constructor(directory: string) {
    super(resolvePath(directory, "instance.pid"));
  }
  async readProcessId(): Promise<?number> {
    let file;
    try {
      file = await this.readAsString();
    } catch (error) {
      return null;
    }
    return parseInt(file, 10);
  }

  async writeProcessId(processId: ?number): Promise<void> {
    if (processId == null) {
      await this.delete();
    } else {
      await this.writeFromString(processId.toString());
    }
  }
}

export default ProcessIdFile;
