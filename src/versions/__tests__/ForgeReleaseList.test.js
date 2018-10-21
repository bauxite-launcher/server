import nock from 'nock';
import { ForgeReleaseListFile } from '../ForgeReleaseList';

const mockForgeManifest = {
  adfocus: 'test-adfocus',
  artifact: 'forge-test',
  branches: {},
  homepage: 'https://files.minecraftforge.net/test/',
  mcversion: {
    '1.10.2': [1],
    '1.12.2': [2, 3],
  },
  name: 'Forge Testing',
  number: {
    1: {
      build: 1,
      files: [],
      version: '13.245.39',
      branch: null,
      modified: +new Date(2018, 0, 1),
      mcversion: '1.10.2',
    },
    2: {
      build: 2,
      files: [
        [
          'txt',
          'test',
          Array(40)
            .fill(0)
            .join(''),
        ],
      ],
      version: '12.345.33',
      branch: null,
      modified: +new Date(2017, 0, 3),
      mcversion: '1.12.2',
    },
    3: {
      build: 3,
      files: [
        [
          'txt',
          'test',
          Array(40)
            .fill(0)
            .join(''),
        ],
      ],
      version: '12.345.33',
      branch: null,
      modified: +new Date(2017, 0, 3),
      mcversion: '1.12.2',
    },
  },
  promos: {
    '1.12.2-recommended': 2,
    '1.12.2-latest': 3,
  },
  webpath: 'https://files.minecraftforge.net/test/',
};

const mockForgeRelease = {
  id: 2,
  files: {
    test: {
      fileType: 'txt',
      sha1: Array(40)
        .fill(0)
        .join(''),
      url:
        'https://files.minecraftforge.net/test/1.12.2-12.345.33/forge-test-1.12.2-test.txt',
    },
  },
};

describe('ForgeReleaseListFile', () => {
  it('should be a function', () => {
    expect(ForgeReleaseListFile).toBeInstanceOf(Function);
  });

  describe('constructor', () => {
    it('should not throw an error', () => {
      expect(() => new ForgeReleaseListFile()).not.toThrowError();
    });
  });

  describe('when instantiated', () => {
    let instance;
    beforeEach(() => {
      instance = new ForgeReleaseListFile();
    });

    let scope; // eslint-disable-line no-unused-vars
    beforeEach(() => {
      scope = nock('https://files.minecraftforge.net')
        .get('/maven/net/minecraftforge/forge/json')
        .reply(200, mockForgeManifest);
    });
    afterEach(() => scope.done());

    describe('read', () => {
      it('should return a ForgeReleaseManifest', async () => {
        await expect(instance.read()).resolves.toMatchObject(mockForgeManifest);
      });
    });

    describe('getReleaseByBuildId', () => {
      it('should return a ForgeRelease', async () => {
        await expect(instance.getReleaseByBuildId(2)).resolves.toMatchObject(
          mockForgeRelease,
        );
      });
      it('should throw an error when the release does not exist', async () => {
        await expect(instance.getReleaseByBuildId(10)).rejects.toBeInstanceOf(
          Error,
        );
      });
    });

    describe('getReleasesByMinecraftVersion', () => {
      it('should return an array of compatible versions', async () => {
        await expect(
          instance.getReleasesByMinecraftVersion('1.12.2'),
        ).resolves.toMatchObject([mockForgeRelease, { id: 3 }]);
      });

      it('should throw an error when no compatible versions exists', async () => {
        await expect(
          instance.getReleasesByMinecraftVersion('1.8.7'),
        ).rejects.toBeInstanceOf(Error);
      });
    });

    describe('getLatestReleaseByMinecraftVersion', () => {
      it('should return the latest recommended release', async () => {
        await expect(
          instance.getLatestForMinecraftVersion('1.12.2'),
        ).resolves.toMatchObject(mockForgeRelease);
      });

      it('should throw an error when no recommended version exists', async () => {
        await expect(
          instance.getLatestForMinecraftVersion('1.8.7'),
        ).rejects.toBeInstanceOf(Error);
      });

      it('should return the latest recommended release when the recommended channel is specified', async () => {
        await expect(
          instance.getLatestForMinecraftVersion('1.12.2', 'recommended'),
        ).resolves.toMatchObject(mockForgeRelease);
      });

      it('should return the latest release when the latest channel is specified', async () => {
        await expect(
          instance.getLatestForMinecraftVersion('1.12.2', 'latest'),
        ).resolves.toMatchObject({ id: 3 });
      });
    });
  });
});
