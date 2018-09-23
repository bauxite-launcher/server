// @flow
import { spawn as spawnProcess } from "child_process";
import ps from "ps-node";
import SettingsFile from "./SettingsFile";
import ProcessIdFile from "./ProcessIdFile";

class InstanceProcess {
  directory: string;
  settings: SettingsFile;
  process: *;
  processId: ProcessIdFile;

  constructor(directory: string, settings: SettingsFile) {
    this.directory = directory;
    this.settings = settings;
    this.processId = new ProcessIdFile(this.directory);
  }

  async getProcessId(): Promise<?number> {
    const processId = await this.processId.readProcessId();
    if (processId && (await this.constructor.processIsRunning(processId))) {
      return processId;
    }
    return null;
  }

  async isRunning(): Promise<boolean> {
    return !!(await this.getProcessId());
  }

  async launch(): Promise<void> {
    if (await this.isRunning()) {
      throw new Error("Process is already running");
    }

    const {
      javaBin = "java",
      serverJar = "minecraft_server.jar",
      javaArgs = []
    } = await this.settings.readSettings();

    const args = ["-jar", serverJar, "-nogui", ...javaArgs];
    const options = {
      cwd: this.directory,
      detached: true,
      stdio: "ignore"
    };
    const process = spawnProcess(javaBin, args, options);
    process.unref();
  }

  async kill(): Promise<void> {
    if (!(await this.isRunning())) {
      throw new Error("Process is not running");
    }

    const processId = await this.getProcessId();
    if (!processId) {
      throw new Error("Could not get process ID");
    }
    process.kill(processId);
  }

  static async processIsRunning(pid: number): Promise<boolean> {
    const runningProcess = await new Promise((resolve, reject) => {
      ps.lookup({ pid }, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
    return !!runningProcess;
  }
}

export default InstanceProcess;
