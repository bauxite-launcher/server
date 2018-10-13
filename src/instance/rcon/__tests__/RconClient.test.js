import RconClient from '../RconClient';
import Instance from '../../Instance';

jest.mock('../../Instance');
// jest.mock('rcon');

describe('RconClient', () => {
  it('should be a function', () => {
    expect(RconClient).toBeInstanceOf(Function);
  });

  describe('class methods', () => {
    let instance;
    let rcon;

    beforeEach(() => {
      instance = new Instance();
      rcon = new RconClient(instance, 'localhost', 25575, 'yoyoyoyo');
      rcon.send = jest.fn();
    });

    it('should be an instance of RconClient', () => {
      expect(instance).toBeInstanceOf(Instance);
      expect(rcon).toBeInstanceOf(RconClient);
    });

    describe('listOnlinePlayers', () => {
      it('should be a method', () => {
        expect(rcon.listOnlinePlayers).toBeInstanceOf(Function);
      });

      describe('when there are no players online', () => {
        beforeEach(() => {
          rcon.send.mockResolvedValue(
            'There are 0 of a max 20 players online: ',
          );
        });

        it('should return an empty array', async () => {
          await expect(rcon.listOnlinePlayers()).resolves.toMatchObject({
            count: 0,
            max: 20,
            players: [],
          });
          expect(rcon.send).toHaveBeenCalledWith('list');
        });
      });

      describe('when there is one player online', () => {
        beforeEach(() => {
          rcon.send.mockResolvedValue(
            'There are 1 of a max 20 players online: jimotosan',
          );
        });

        it('should return a less empty array', async () => {
          await expect(rcon.listOnlinePlayers()).resolves.toMatchObject({
            count: 1,
            max: 20,
            players: ['jimotosan'],
          });
          expect(rcon.send).toHaveBeenCalledWith('list');
        });
      });

      describe('when there is three players online', () => {
        beforeEach(() => {
          rcon.send.mockResolvedValue(
            'There are 3 of a max 20 players online: jimotosan, AJtastic, SippyTango',
          );
        });

        it('should return a less empty array', async () => {
          await expect(rcon.listOnlinePlayers()).resolves.toMatchObject({
            count: 3,
            max: 20,
            players: ['jimotosan', 'AJtastic', 'SippyTango'],
          });
          expect(rcon.send).toHaveBeenCalledWith('list');
        });
      });
    });
  });
});
