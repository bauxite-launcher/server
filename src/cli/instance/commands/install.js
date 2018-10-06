// @flow
import { inspect } from 'util';
import { type Argv } from 'yargs';
import {
  createCommandHandler,
  type CommandHandlerDefinition,
} from '../../util/commandHandler';
import MinecraftReleasesFile from '../../../versions/MinecraftReleaseListFile';

const Releases = new MinecraftReleasesFile();

type InstallArgs = {
  json?: boolean,
  directory: string,
  version?: string,
  name?: string,
};

type InstallOutput = {
  directory: string,
  version: string,
  name: string,
};

const installCommand: CommandHandlerDefinition<InstallArgs, InstallOutput> = {
  command: 'install',
  description: 'Install Minecraft server',
  async setup(
    {
      json = false,
      name: inputName,
      version: inputVersion,
      $0,
    }: Argv<InstallArgs>,
    instance,
  ): Promise<InstallOutput> {
    const installed = await instance.isInstalled();
    if (installed) {
      throw new Error(
        `An instance is already installed. Run \`${$0} status\` for more information`,
      );
    }

    let version = inputVersion;
    if (!version) {
      if (!json) {
        console.warn(
          'No Minecraft version specified, will use latest stable version',
        );
      }
      const latest = await Releases.latest('release');
      if (!latest) {
        throw new Error('Could not find latest version of Minecraft');
      }
      version = latest.id;
    }

    let name = inputName;
    if (!name) {
      if (!json) {
        console.warn('No name specified for instance, falling back to default');
      }
      name = `Unnamed ${version}`;
    }

    if (!json) {
      console.log(`Installing Minecraft server ${version}…`);
    }

    await instance.install(
      version,
      !json
        ? ({ progress }) => {
          if (progress) {
            const {
              transferred, length, percentage, speed, eta,
            } = progress;
            process.stdout.write(
              `\rDownloading ${Math.round(
                transferred / (1024 * 1024),
              )}/${Math.round(length / (1024 * 1024))}MB (${Math.round(
                percentage,
              )}%) at ${Math.round(speed / 1024)}kBps ─ ${Math.round(
                eta,
              )}s remaining`,
            );
          }
        }
        : undefined,
    );

    process.stdout.write('\n');
    const { minecraftVersion } = await instance.settings.read();
    return {
      directory: instance.directory,
      version: minecraftVersion,
      name,
    };
  },
  render({ directory, version, name }) {
    return `Successfully installed Minecraft server ${version} to ${directory}`;
  },
};

export default createCommandHandler(installCommand);
