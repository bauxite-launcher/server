// @flow
import Rcon from 'modern-rcon';
import Instance from '../Instance';
import { type RconRequest } from './RconCommand';
import { listOnlinePlayers, stopServer } from './commands';

class MinecraftRcon extends Rcon {
  instance: Instance;

  hasAuthed: boolean;

  +send: (command: RconRequest) => Promise<string>;

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

    const rcon = new MinecraftRcon(
      instance,
      'localhost',
      rconPort,
      rconPassword,
    );

    return rcon;
  }

  async command(command: RconRequest): Promise<string> {
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
        if (typeof part === 'string') {
          return part;
        }
        return part.toString();
      })
      .filter(x => x.trim())
      .join(' ');
    return super.send(formattedMessage);
  }

  async listOnlinePlayers() {
    return listOnlinePlayers(null, this.send.bind(this));
  }

  async stopServer() {
    return stopServer(null, this.send.bind(this));
  }
}

export default MinecraftRcon;
