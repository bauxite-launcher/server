import nock from "nock";
import MinecraftReleaseListFile from "../MinecraftReleaseListFile";

const mockReleaseManifest = {
  versions: [
    {
      id: "1.13.1",
      type: "release",
      url: "http://example.com/manifest.1.13.1.json"
    },
    {
      id: "18w20a",
      type: "snapshot",
      url: "http://example.com/manifest.18w20a.json"
    }
  ],
  latest: { release: "1.13.1", snapshot: "18w20a" }
};

describe("MinecraftReleaseListFile", () => {
  it("should be a function", () => {
    expect(MinecraftReleaseListFile).toBeInstanceOf(Function);
  });

  describe("constructor", () => {
    it("should not throw an error", () => {
      expect(() => new MinecraftReleaseListFile()).not.toThrowError();
    });
  });

  describe("when instantiated", () => {
    let instance;
    beforeEach(() => (instance = new MinecraftReleaseListFile()));

    let scope;
    beforeEach(() => {
      scope = nock("https://launchermeta.mojang.com")
        .get("/mc/game/version_manifest.json")
        .reply(200, mockReleaseManifest);
    });
    afterEach(() => scope.done());

    describe("read", () => {
      it("should return a MinecraftReleaseManifest", async () => {
        await expect(instance.read()).resolves.toMatchObject(
          mockReleaseManifest
        );
      });
    });

    describe("releases", () => {
      it("should return an array of releases", async () => {
        await expect(instance.releases()).resolves.toEqual(
          mockReleaseManifest.versions
        );
      });
    });

    describe("latest", () => {
      describe("called with no argument", () => {
        it("should return the latest stable release", async () => {
          await expect(instance.latest()).resolves.toEqual(
            mockReleaseManifest.versions[0]
          );
        });
      });

      describe("called with 'release' argument", () => {
        it("should return the latest stable release", async () => {
          await expect(instance.latest("release")).resolves.toEqual(
            mockReleaseManifest.versions[0]
          );
        });
      });

      describe("called with 'snapshot' argument", () => {
        it("should return the latest snapshot release", async () => {
          await expect(instance.latest("snapshot")).resolves.toEqual(
            mockReleaseManifest.versions[1]
          );
        });
      });

      describe("called with 'old_alpha' argument", () => {
        it("should not return anything", async () => {
          await expect(instance.latest("old_alpha")).resolves.toEqual(null);
        });
      });
    });
  });
});
