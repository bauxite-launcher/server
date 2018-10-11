import MinecraftRcon from '../MinecraftRcon';
import Instance from '../Instance';

jest.mock('../Instance');
// jest.mock('rcon');

describe('MinecraftRcon', () => {
  it('should be a function', () => {
    expect(MinecraftRcon).toBeInstanceOf(Function);
  });

  describe('class methods', () => {
    let instance;
    let rcon;

    beforeEach(() => {
      instance = new Instance();
      rcon = new MinecraftRcon(instance, 'localhost', 25575, 'yoyoyoyo');
      rcon.send = jest.fn();
    });

    it('should be an instance of MinecraftRcon', () => {
      expect(instance).toBeInstanceOf(Instance);
      expect(rcon).toBeInstanceOf(MinecraftRcon);
    });

    describe('list', () => {
      it('should be a method', () => {
        expect(rcon.list).toBeInstanceOf(Function);
      });

      describe('when there are no players online', () => {
        beforeEach(() => {
          rcon.send.mockResolvedValue(
            'There are 0 of a max 20 players online: ',
          );
        });

        it('should return an empty array', async () => {
          await expect(rcon.list()).resolves.toMatchObject({
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
          await expect(rcon.list()).resolves.toMatchObject({
            count: 1,
            max: 20,
            players: ['jimotosan'],
          });
          expect(rcon.send).toHaveBeenCalledWith('list');
        });
      });

      describe('when there is three player online', () => {
        beforeEach(() => {
          rcon.send.mockResolvedValue(
            'There are 3 of a max 20 players online: jimotosan, AJtastic, SippyTango',
          );
        });

        it('should return a less empty array', async () => {
          await expect(rcon.list()).resolves.toMatchObject({
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
