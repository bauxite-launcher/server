// @flow
import { spawn as spawnProcess } from 'child_process';
import {
  lookup as lookupProcess,
  type LookupQuery,
  type LookupResultList,
} from 'ps-node';
import { resolve as resolvePath } from 'path';
import SettingsFile from './files/SettingsFile';
import ProcessIdFile from './files/ProcessIdFile';

const lookupProcessAsync = (query: LookupQuery): Promise<LookupResultList> => new Promise((resolve, reject) => lookupProcess(
  query,
  (err, res) => (err || !res ? reject(err) : resolve(res)),
));

class InstanceProcess {
  directory: string;

  settings: SettingsFile;

  processId: ProcessIdFile;

  constructor(directory: string, settings: SettingsFile) {
    this.directory = directory;
    this.settings = settings;
    this.processId = new ProcessIdFile(
      resolvePath(this.directory, 'instance.pid'),
    );
  }

  async getProcessId(): Promise<?number> {
    const processId = await this.processId.read();
    if (processId && (await this.constructor.processIsRunning(processId))) {
      return processId;
    }
    return null;
  }

  async isRunning(): Promise<boolean> {
    return !!(await this.getProcessId());
  }

  async generateJavaArgs() {
    const {
      serverJar = 'minecraft_server.jar',
      javaArgs = [],
    } = await this.settings.read();

    return ['-jar', serverJar, ...javaArgs, 'nogui'];
  }

  async launch(): Promise<void> {
    if (await this.isRunning()) {
      throw new Error('Process is already running');
    }
    const args = await this.generateJavaArgs();
    const { javaBin = 'java' } = await this.settings.read();
    const options = {
      cwd: this.directory,
      detached: true,
      stdio: 'ignore',
    };
    const process = spawnProcess(javaBin, args, options);
    await this.processId.write(process.pid);
    process.unref();
  }

  async kill(): Promise<void> {
    if (!(await this.isRunning())) {
      throw new Error('Process is not running');
    }

    const processId = await this.getProcessId();
    if (!processId) {
      throw new Error('Could not get process ID');
    }
    process.kill(processId);
  }

  static async processIsRunning(pid: number): Promise<boolean> {
    const [runningProcess] = await lookupProcessAsync({ pid: pid.toString() });
    return !!runningProcess;
  }
}

export default InstanceProcess;
