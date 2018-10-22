// @flow
import { type Argv } from 'yargs';
import chalk from 'chalk';
import { taskProgress } from './util/components';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';
import Releases from '../../../versions/MinecraftReleaseList';
import ForgeReleases, {
  type ForgeReleaseId,
} from '../../../versions/ForgeReleaseList';

type InstallArgs = {
  json?: boolean,
  directory: string,
  minecraftVersion?: string,
  name?: string,
  stable?: boolean,
  snapshot?: boolean,
  forge?: boolean,
  forgeVersion?: ForgeReleaseId,
};

type InstallOutput = {
  directory: string,
  minecraftVersion: string,
  forgeVersion?: string,
  name: string,
};

export const installCommand: CommandHandlerDefinition<
  InstallArgs,
  InstallOutput,
> = {
  command: 'install',
  description: 'Install Minecraft server',
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
      name: {
        description: 'A name for the server. Not currently used',
        type: 'string',
      },
      forge: {
        type: 'boolean',
        description: 'Whether to install Forge',
      },
      forgeVersion: {
        description: 'The version of Forge to install',
        type: 'string',
        implies: 'forge',
      },
    })
    .conflicts({
      minecraftVersion: ['stable', 'snapshot'],
      snapshot: 'stable',
    }),
  async setup(
    {
      json = false,
      name: inputName,
      minecraftVersion: inputVersion,
      stable,
      snapshot,
      forge,
      forgeVersion: inputForgeVersion,
      $0,
    }: Argv<InstallArgs>,
    instance,
  ): Promise<InstallOutput> {
    const installed = await instance.isInstalled();
    if (installed && !forge && !inputForgeVersion) {
      throw new Error(
        `An instance is already installed. Run \`${$0} status\` for more information`,
      );
    }

    let forgeVersion = inputForgeVersion;
    let version = inputVersion;
    const releaseChannel = snapshot ? 'snapshot' : 'release';
    if (!version && !installed) {
      if (!json && !stable && !snapshot) {
        if (forgeVersion || forge) {
          console.warn(
            chalk.yellow(
              'No Minecraft version specified, will use version specified by Forge',
            ),
          );
        } else {
          console.warn(
            chalk.yellow(
              `No Minecraft version specified, will use latest ${releaseChannel} version`,
            ),
          );
        }
      }
    }

    if (!version && !forge && !forgeVersion) {
      const latest = await Releases.latest(releaseChannel);
      if (!latest) {
        throw new Error(
          `Could not find latest version from the ${releaseChannel} release channel of Minecraft`,
        );
      }
      version = latest.id;
    }

    if (forge && !forgeVersion) {
      if (installed) {
        const settings = await instance.settings.read();
        version = settings.minecraftVersion;
      }
      if (!json) {
        if (version) {
          console.warn(
            chalk.yellow(
              `No Forge version specified, will use recommended version for Minecraft ${version}`,
            ),
          );
        } else {
          console.warn(
            chalk.yellow(
              'No Forge version specified, will use latest stable version',
            ),
          );
        }
      }

      let forgeRelease;
      if (version) {
        forgeRelease = await ForgeReleases.getLatestForMinecraftVersion(
          version,
        );
      } else {
        forgeRelease = await ForgeReleases.getLatest();
        version = forgeRelease.minecraftVersion;
      }

      forgeVersion = forgeRelease.name;
    }

    if (!version) {
      throw new Error('No Minecraft version was specified');
    }

    if (forgeVersion) {
      const chosenForgeRelease = await ForgeReleases.getReleaseById(
        forgeVersion,
      );
      if (!json && chosenForgeRelease.minecraftVersion !== version) {
        console.warn(
          chalk.yellow(
            `The selected version of Forge (${chalk.white(
              forgeVersion,
            )}) is incompatible with Minecraft ${chalk.white(version)}`,
          ),
        );
      }
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

    if (!installed) {
      await instance.install(
        version,
        !json
          ? ({ progress }) => {
            if (!progress) return;
            process.stdout.write(
              taskProgress('Downloading Minecraft server', progress),
            );
          }
          : undefined,
      );
    }

    process.stdout.write('\n');

    if (forgeVersion) {
      await instance.installForge(
        forgeVersion,
        !json
          ? ({ stage, progress }) => {
            if (stage.toString() === 'Symbol(Installing)') {
              process.stdout.write(taskProgress('Installing Forge'));
            }
            if (!progress) return;
            process.stdout.write(
              taskProgress('Downloading Forge Installer', progress),
            );
          }
          : undefined,
      );

      process.stdout.write('\n');
    }

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
