// @flow
import Rcon from 'modern-rcon';
import Instance from '../Instance';

const listCommandRegex = /^There are (\d+) of a max (\d+) players online: (.*)$/;

class MinecraftRcon extends Rcon {
  instance: Instance;

  constructor(
    instance: Instance,
    host: string,
    port?: number,
    password: string,
  ) {
    super(host, port, password);
    this.instance = instance;
  }

  static async createFromInstance(instance: Instance) {
    const props = await instance.properties.read();
    if (!props['enable-rcon']) {
      throw new Error('Rcon is not enabled on this instance');
    }

    if (!props['rcon.password']) {
      throw new Error(
        'Rcon password has not been set; Minecraft requires a password to use rcon',
      );
    }
    const rconPassword = props['rcon.password'].toString();
    if (!props['rcon.port']) {
      console.warn('No rcon port has been set; using default of 25575');
    }
    const rconPort = parseInt(props['rcon.port'], 10) || 25575;

    return new MinecraftRcon(instance, 'localhost', rconPort, rconPassword);
  }

  async send(
    command: string | Array<?(string | number | boolean | Object)>,
  ): Promise<string> {
    const messageParts = command instanceof Array ? command.filter(Boolean) : [command];
    const formattedMessage = messageParts
      .map((part) => {
        if (typeof part === 'object') {
          // TODO: Verify that this works with MC's NBT-JSON thing
          return JSON.stringify(part);
        }
        if (typeof part === 'boolean') {
          return part ? 'true' : 'false';
        }
        return part.toString();
      })
      .filter(x => x.trim())
      .join(' ');
    return super.send(formattedMessage);
  }

  async listOnlinePlayers(): Promise<{
    count: number,
    max: number,
    players: Array<string>,
  }> {
    const result = await this.send('list');
    // There are 1 of a max 20 players online: jimotosan

    const [, count, max, players] = result.match(listCommandRegex) || [];

    if (!count || !max) {
      throw new Error(
        `Could not read response from 'list' command. Expected something matching:\n\n\t/${
          listCommandRegex.source
        }/\n\n...but instead got:\n\n\t"${result}"`,
      );
    }

    return {
      count: parseInt(count, 10),
      max: parseInt(max, 10),
      players: players.split(/,|(?:,?\s+)/g).filter(Boolean),
    };
  }

  async stopServer() {
    await this.send('stop');
  }
}

export default MinecraftRcon;
