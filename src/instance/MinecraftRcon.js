// @flow
import Rcon from 'modern-rcon';
import Instance from './Instance';

const listCommandRegex = /^There are (\d+) of a max (\d+) players online: (.*)$/;

type Vector3D = [number, number, number];

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
          return JSON.stringify(object);
        }
        if (typeof part === 'boolean') {
          return part ? 'true' : 'false';
        }
        return part.toString();
      })
      .join(' ');
    return super.send(formattedMessage);
  }

  async getOnlinePlayers(): Promise<{
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

  async advancement(
    action: 'grant' | 'revoke',
    player: string,
    cascadeStrategy: 'only' | 'until' | 'from' | 'through' | 'everything',
    advancement?: string,
    criterion?: string,
  ) {
    const result = await this.send([
      'advancement',
      player,
      cascadeStrategy,
      advancement,
      criterion,
    ]);
    console.log('advancement result', result);
    // TODO: Figure out what this returns
  }

  async grantAdvancement(...args: *) {
    return this.advancement('grant', ...args);
  }

  async revokeAdvancement(...args: *) {
    return this.advancement('revoke', ...args);
  }

  async banPlayer(name: string, reason?: string) {
    await this.send(['ban', name, reason]);
  }

  async banIpAddress(addressOrName: string, reason?: string) {
    const result = await this.send(['ban-ip', addressOrName, reason]);
    console.log('banIp result', result);
    // TODO: Figure out what this returns
  }

  async listBannedPlayers() {
    const result = await this.send('banlist players');
    console.log('banList result', result);
  }

  async listBannedIps() {
    const result = await this.send('banlist ips');
    console.log('banList result', result);
  }

  async bossBar(
    command: 'add' | 'set' | 'remove' | 'list' | 'get',
    id: string,
    ...args: *
  ) {
    const result = await this.send(['bossbar', command, id, ...args]);
  }

  async addBossBar(id: string, name: string) {
    return this.bossBar('add', id, name);
  }

  async setBossBar(
    id: string,
    key: 'name' | 'color' | 'style' | 'value' | 'max' | 'visible' | 'players',
    value: string | number | boolean,
  ) {
    return this.bossBar('set', id, key, value);
  }

  async removeItemsFromPlayerInventories(
    targets?: string,
    item?: string,
    count?: number,
  ) {
    return this.send(['clear', targets, item, count]);
  }

  async cloneBlocks(
    begin: Vector3D,
    end: Vector3D,
    destination: Vector3D,
    maskMode?: 'filtered' | 'masked' | 'replace',
    cloneMode?: 'force' | 'move' | 'normal',
    tileName: string,
    dataValueOrState: string,
  ) {
    return this.send([
      'cloneBlocks',
      begin.join(' '),
      end.join(' '),
      destination.join(' '),
      maskMode,
      cloneMode,
      tileName,
      dataValueOrState,
    ]);
  }

  async getBlockData(position: string, path?: string, scale?: number) {
    return this.send(['data get block', position, path, scale]);
  }

  async getEntityData(target: string, path?: string, scale?: number) {
    return this.send(['data get entity', target, path, scale]);
  }

  async mergeBlockData(position: string, nbt: Object) {
    return this.send(['data merge block', position, nbt]);
  }

  async mergeEntityData(position: string, nbt?: Object) {
    return this.send(['data merge entity', position, nbt]);
  }

  async removeBlockData(position: string, path: string) {
    return this.send(['data remove block', position, path]);
  }

  async removeEntityData(position: string, path: string) {
    return this.send(['data remove entity', position, path]);
  }

  async enableDatapack(
    name: string,
    order?: 'first' | 'last' | 'before' | 'after',
    existing?: string,
  ) {
    return this.send(['datapack enable', name, order, existing]);
  }

  async disableDatapack(name: string) {
    return this.send(['datapack disable', name]);
  }

  async listDatapacks(filter?: 'available' | 'enabled') {
    return this.send(['databack list', filter]);
  }

  async listAvailableDatapacks() {
    return this.listDatapacks('available');
  }

  async listEnabledDatapacks() {
    return this.listDatapacks('enabled');
  }

  async debug(command: 'start' | 'stop') {
    return this.send(['debug', command]);
  }

  async startDebuggingSession() {
    return this.debug('start');
  }

  async stopDebuggingSession() {
    return this.debug('stop');
  }

  async setDefaultGameMode(
    mode: 'survival' | 'creative' | 'adventure' | 'spectator',
  ) {
    return this.send(['defaultgamemode', mode]);
  }

  async removeOperator(name: string) {
    return this.send(['deop', name]);
  }

  async setDifficultyLevel(
    difficulty: 'peaceful' | 'easy' | 'normal' | 'hard',
  ) {
    return this.send(['difficulty', difficulty]);
  }

  async giveStatusEffectToEntity(
    playerOrEntity: string,
    effect: string | number,
    seconds?: number,
    amplifier?: number,
    hideParticles?: boolean,
  ) {
    return this.send([
      'effect give',
      playerOrEntity,
      effect,
      seconds,
      amplifier,
      hideParticles,
    ]);
  }

  async clearStatusEffectsOnEntity(
    playerOrEntity: string,
    effect: string | number,
  ) {
    return this.send(['effect clear', playerOrEntity, effect]);
  }

  async enchantItem(
    player: string,
    enchantment: string | number,
    level?: number,
  ) {
    return this.send(['enchant', player, enchantment, level]);
  }

  async giveExperienceToPlayer(
    player: string,
    amount: number,
    unit?: 'points' | 'levels',
  ) {
    return this.send(['experience add', player, amount, unit]);
  }

  async setPlayerExperience(
    player: string,
    amount: number,
    unit?: 'points' | 'levels',
  ) {
    return this.send(['experience set', player, amount, unit]);
  }

  async getPlayerExperience(player: string, unit?: 'points' | 'levels') {
    return this.send(['experience query', player, unit]);
  }

  async execute() {
    // TODO: lol
  }

  async fillBlocks(
    nearCorner: Vector3D,
    farCorner: Vector3D,
    block: string | number,
    oldBlockHandling?: 'destroy' | 'hollow' | 'keep' | 'outline' | 'replace',
    replaceTileNameOrDataTag?: Object | string | number,
  ) {
    return this.send([
      'fill',
      nearCorner.join(' '),
      farCorner.join(' '),
      block,
      oldBlockHandling,
      replaceTileNameOrDataTag,
    ]);
  }

  async stop() {
    await this.send('stop');
  }
}

export default MinecraftRcon;
