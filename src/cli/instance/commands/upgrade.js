// @flow
import { type Argv } from 'yargs';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../../util/commandHandler';
import MinecraftReleasesFile from '../../../versions/MinecraftReleaseListFile';

const Releases = new MinecraftReleasesFile();

type UpgradeArgs = {
  json?: boolean,
  directory: string,
  minecraftVersion?: string,
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
  async setup(
    { json = false, minecraftVersion: inputVersion, $0 }: Argv<UpgradeArgs>,
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

    const { minecraftVersion } = await instance.settings.read();
    if (minecraftVersion === version) {
      throw new Error(
        `Instance is already on Minecraft server version ${minecraftVersion}`,
      );
    }

    if (!json) {
      console.log(
        `Upgrading Minecraft server from ${minecraftVersion} to ${version}…`,
      );
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
              )}MB/${Math.round(length / (1024 * 1024))}MB (${Math.round(
                percentage,
              )}%) at ${Math.round(speed / 1024)}kBps ─ ${Math.round(
                eta,
              )}s remaining`,
            );
          }
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
    return `Successfully upgraded Minecraft server instance from ${oldVersion} to ${newVersion}`;
  },
};

export default createCommandHandler(upgradeCommand);
