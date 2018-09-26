import nock from "nock";
import MinecraftReleaseFile from "../MinecraftReleaseFile";

const mockManifestHost = "http://example.com";
const mockManifestPath = "/release.1.13.1.json";
const mockManifestUrl = mockManifestHost + mockManifestPath;

const mockManifestFile = {
  id: "1.13.1",
  downloads: { server: { url: "", sha1: "" } }
};

describe("MinecraftReleaseFile", () => {
  it("should be a function", () => {
    expect(MinecraftReleaseFile).toBeInstanceOf(Function);
  });

  describe("when instantiated without URL", () => {
    it("should throw an error", () => {
      expect(() => new MinecraftReleaseFile()).toThrowError();
    });
  });

  describe("when instantiated with valid URL", () => {
    const createValidInstance = () => new MinecraftReleaseFile(mockManifestUrl);
    it("should not throw an error", () => {
      expect(createValidInstance).not.toThrowError();
    });

    it("should have a read method", () => {
      expect(createValidInstance().read).toBeInstanceOf(Function);
    });
    it("should NOT have a write method", () => {
      expect(createValidInstance().write).not.toBeInstanceOf(Function);
    });
  });

  describe("read", () => {
    let scope;
    let instance;
    beforeEach(() => (instance = new MinecraftReleaseFile(mockManifestUrl)));
    beforeEach(() =>
      (scope = nock(mockManifestHost)
        .get(mockManifestPath)
        .reply(200, mockManifestFile)));
    afterEach(() => scope.done());

    it("should return the manifest file", async () => {
      await expect(instance.read()).resolves.toMatchObject(mockManifestFile);
    });
  });
});
