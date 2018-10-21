// @flow
import { type Argv } from 'yargs';
import chalk from 'chalk';
import { taskProgress } from './util/components';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';
import Releases from '../../../versions/MinecraftReleaseList';

type UpgradeArgs = {
  json?: boolean,
  directory: string,
  minecraftVersion?: string,
  snapshot?: boolean,
  stable?: boolean,
};

type UpgradeOutput = {
  directory: string,
  oldVersion: string,
  newVersion: string,
};

export const upgradeCommand: CommandHandlerDefinition<
  UpgradeArgs,
  UpgradeOutput,
> = {
  command: 'upgrade',
  description: 'Upgrade Minecraft server',
  builder: yargs => yargs
    .options({
      minecraftVersion: {
        description: 'The specific version of Minecraft to install',
        type: 'string',
      },
      stable: {
        description: 'Install the latest stable version',
        type: 'boolean',
      },
      snapshot: {
        description: 'Install the latest snapshot version',
        type: 'boolean',
      },
    })
    .conflicts({
      minecraftVersion: ['stable', 'snapshot'],
      snapshot: 'stable',
    }),
  async setup(
    {
      json = false,
      minecraftVersion: inputVersion,
      snapshot,
      stable,
      $0,
    }: Argv<UpgradeArgs>,
    instance,
  ): Promise<UpgradeOutput> {
    const installed = await instance.isInstalled();
    if (!installed) {
      throw new Error(
        `Instance not installed. Run \`${$0} install --help\` for more information`,
      );
    }

    let version = inputVersion;
    if (!version) {
      const releaseChannel = snapshot ? 'snapshot' : 'release';
      if (!json && !stable && !snapshot) {
        console.warn(
          chalk.yellow(
            `No Minecraft version specified, will use latest version from the ${releaseChannel} release channel`,
          ),
        );
      }
      const latest = await Releases.latest(releaseChannel);
      if (!latest) {
        throw new Error(
          `Could not find latest version from the ${releaseChannel} release channel of Minecraft`,
        );
      }
      version = latest.id;
    }

    const { minecraftVersion } = await instance.settings.read();
    if (minecraftVersion === version) {
      throw new Error(
        `Instance is already on Minecraft server version ${minecraftVersion}`,
      );
    }

    if (!json) {
      console.log(
        chalk.cyan(
          `Upgrading Minecraft server from ${chalk.white(
            minecraftVersion,
          )} to ${chalk.white(version)}…`,
        ),
      );
    }

    await instance.install(
      version,
      !json
        ? ({ progress }) => {
          process.stdout.write(taskProgress('Downloading', progress));
        }
        : undefined,
      true,
    );

    process.stdout.write('\n');
    const { minecraftVersion: newVersion } = await instance.settings.read();
    return {
      directory: instance.directory,
      oldVersion: minecraftVersion,
      newVersion,
    };
  },
  render({ oldVersion, newVersion }) {
    return chalk.green(
      `Successfully upgraded Minecraft server instance from ${chalk.white(
        oldVersion,
      )} to ${chalk.white(newVersion)}`,
    );
  },
};

export default createCommandHandler(upgradeCommand);
