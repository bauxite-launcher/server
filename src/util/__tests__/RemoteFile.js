import nock from "nock";
import RemoteFile, { parseHeaderValue } from "../RemoteFile";

const mockHost = "http://example.com";
const mockFilePath = "/file.txt";
const mockUrl = mockHost + mockFilePath;
const mockResponse = "💩";

describe("RemoteFile", () => {
  it("should be a function", () => {
    expect(RemoteFile).toBeInstanceOf(Function);
  });

  describe("when instantiated with no url", () => {
    it("should throw an error", () => {
      expect(() => new RemoteFile()).toThrowError();
    });
  });

  describe("when instantiated", () => {
    it("should not throw an error", () => {
      expect(() => new RemoteFile(mockUrl)).not.toThrowError();
    });
  });

  describe("read", () => {
    let scope;
    let instance;
    beforeEach(() => {
      instance = new RemoteFile(mockUrl);
      scope = nock(mockHost)
        .get(mockFilePath)
        .reply(200, mockResponse);
    });

    afterEach(() => {
      scope.done();
    });

    it("should return the content of the remote file", async () => {
      await expect(instance.read()).resolves.toBe(mockResponse);
    });
  });
});

describe("parseHeaderValue", () => {
  it("should be a function", () => {
    expect(parseHeaderValue).toBeInstanceOf(Function);
  });

  describe("when called with a basic header value", () => {
    it("should return null", () => {
      expect(parseHeaderValue("hello", "key")).toEqual(null);
    });
  });

  describe("when called with a complex header value", () => {
    it("should return the requested key", () => {
      expect(parseHeaderValue('hello; key="value"; something', "key")).toEqual(
        "value"
      );
    });
  });
});
