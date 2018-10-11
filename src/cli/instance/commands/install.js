// @flow
import { type Argv } from 'yargs';
import chalk from 'chalk';
import { taskProgress } from './util/components';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';
import Releases from '../../../versions/MinecraftReleaseListFile';

type InstallArgs = {
  json?: boolean,
  directory: string,
  minecraftVersion?: string,
  name?: string,
};

type InstallOutput = {
  directory: string,
  minecraftVersion: string,
  name: string,
};

export const installCommand: CommandHandlerDefinition<
  InstallArgs,
  InstallOutput,
> = {
  command: 'install',
  description: 'Install Minecraft server',
  builder: {
    minecraftVersion: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
  },
  async setup(
    {
      json = false,
      name: inputName,
      minecraftVersion: inputVersion,
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
          chalk.yellow(
            'No Minecraft version specified, will use latest stable version',
          ),
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
        console.warn(
          chalk.yellow(
            'No name specified for instance, falling back to default',
          ),
        );
      }
      name = `Unnamed ${version}`;
    }

    if (!json) {
      console.log(
        chalk.cyan(`Installing Minecraft server ${chalk.white(version)}…`),
      );
    }

    await instance.install(
      version,
      !json
        ? ({ progress }) => {
          process.stdout.write(taskProgress('Downloading', progress));
        }
        : undefined,
    );

    process.stdout.write('\n');
    const { minecraftVersion } = await instance.settings.read();
    return {
      directory: instance.directory,
      minecraftVersion,
      name,
    };
  },
  render({ directory, minecraftVersion }) {
    return chalk.green(
      `Successfully installed Minecraft server ${chalk.white(
        minecraftVersion,
      )} to ${chalk.white(directory)}`,
    );
  },
};

export default createCommandHandler(installCommand);
