import nock from "nock";
import TextFile from "../TextFile";
import RemoteFile from "../RemoteFile";
import fs from "jest-plugin-fs";

jest.mock("fs", () => require("jest-plugin-fs/mock"));

const mockContent = "hello there 💩";
const mockFileName = "text.txt";
const mockFilePath = "/" + mockFileName;
const existingFiles = { [mockFilePath]: mockContent };

const remoteHost = "http://example.com";
const remotePath = "/example.txt";
const remoteUrl = `${remoteHost}${remotePath}`;

describe("TextFile", () => {
  let scope;
  afterEach(() => {
    fs.restore();
    if (scope) scope.done();
  });

  it("should be a function", () => {
    expect(TextFile).toBeInstanceOf(Function);
  });

  describe("when not existing on disk", () => {
    beforeEach(() => fs.mock());

    describe("when constructed", () => {
      it("should not throw an error", () => {
        expect(() => new TextFile(mockFilePath)).not.toThrowError();
      });

      it("should return an instance of TextFile", () => {
        expect(new TextFile(mockFilePath)).toBeInstanceOf(TextFile);
      });
    });

    describe("when read", () => {
      let textFile;
      beforeEach(() => (textFile = new TextFile(mockFilePath)));
      it("should throw an error", async () => {
        await expect(textFile.read()).rejects.toBeInstanceOf(Error);
      });
    });

    describe("when written with a value", () => {
      let textFile;
      beforeEach(() => (textFile = new TextFile(mockFilePath)));
      it("should not error", async () => {
        await expect(textFile.write(mockContent)).resolves.toBeUndefined();
      });

      it("should write to disk", async () => {
        await textFile.write(mockContent);
        expect(fs.files()).toMatchObject(existingFiles);
      });
    });

    describe("when written without a value", () => {
      let textFile;
      beforeEach(() => (textFile = new TextFile(mockFilePath)));
      it("should throw an error", async () => {
        await expect(textFile.write()).rejects.toBeInstanceOf(Error);
      });
    });
  });

  describe("when existing on disk", () => {
    beforeEach(() => fs.mock(existingFiles));

    describe("when constructed", () => {
      it("should not throw an error", () => {
        expect(() => new TextFile(mockFilePath)).not.toThrowError();
      });

      it("should return an instance of TextFile", () => {
        expect(new TextFile(mockFilePath)).toBeInstanceOf(TextFile);
      });
    });

    describe("when read", () => {
      let textFile;
      beforeEach(() => (textFile = new TextFile(mockFilePath)));
      it("should return the processId", async () => {
        await expect(textFile.read()).resolves.toBe(mockContent);
      });
    });

    describe("when written with a value", () => {
      let textFile;
      beforeEach(() => (textFile = new TextFile(mockFilePath)));
      it("should not error", async () => {
        await expect(textFile.write(mockContent)).resolves.toBeUndefined();
      });

      it("should write to disk", async () => {
        await textFile.write(mockContent);
        expect(fs.files()).toMatchObject(existingFiles);
      });
    });

    describe("when written without a value", () => {
      let textFile;
      beforeEach(() => (textFile = new TextFile(mockFilePath)));
      it("should throw an error", async () => {
        await expect(textFile.write()).rejects.toBeInstanceOf(Error);
      });
    });
  });

  describe("writeFromStream", () => {
    let textFile;
    beforeEach(() => (textFile = new TextFile(mockFilePath)));
    it("should be a function", () => {
      expect(textFile.writeFromStream).toBeInstanceOf(Function);
    });

    describe("when called with a readable stream", () => {
      beforeEach(() => fs.mock({ "/src": mockContent }));
      it("should write to disk", async () => {
        const readStream = require("jest-plugin-fs/mock").createReadStream(
          "/src"
        );
        await expect(
          textFile.writeFromStream(readStream)
        ).resolves.toBeUndefined();
        expect(fs.files()[mockFilePath]).toBe(mockContent);
      });
    });
  });

  describe("createFromStream", () => {
    it("should be a function", () => {
      expect(TextFile.createFromStream).toBeInstanceOf(Function);
    });

    describe("when called with a readable stream", () => {
      beforeEach(() => fs.mock({ "/src": mockContent }));
      it("should write to disk", async () => {
        const readStream = require("jest-plugin-fs/mock").createReadStream(
          "/src"
        );
        await expect(
          TextFile.createFromStream(mockFilePath, readStream)
        ).resolves.toBeInstanceOf(TextFile);
        expect(fs.files()[mockFilePath]).toBe(mockContent);
      });
    });
  });

  describe("createFromRemoteFile", () => {
    it("should be a function", () => {
      expect(TextFile.createFromRemoteFile).toBeInstanceOf(Function);
    });

    describe("when called without a remote file", () => {
      it("should throw an error", async () => {
        await expect(TextFile.createFromRemoteFile()).rejects.toBeInstanceOf(
          Error
        );
      });
    });

    describe("when called without a directory", () => {
      it("should throw an error", async () => {
        await expect(
          TextFile.createFromRemoteFile(new RemoteFile(remoteUrl))
        ).rejects.toBeInstanceOf(Error);
      });
    });

    describe("when the server suggests no filename", () => {
      beforeEach(() => {
        scope = nock(remoteHost)
          .get(remotePath)
          .reply(200, mockContent);
      });

      describe("when a filename is passed", () => {
        it("should use the passed filename", async () => {
          await expect(
            TextFile.createFromRemoteFile(
              new RemoteFile(remoteUrl),
              "/",
              mockFileName
            )
          ).resolves.toBeInstanceOf(TextFile);
          expect(fs.files()[mockFilePath]).toBe(mockContent);
        });
      });

      describe("when no filename is passed", () => {
        it("should throw an error", async () => {
          await expect(
            TextFile.createFromRemoteFile(new RemoteFile(remoteUrl), "/")
          ).rejects.toBeInstanceOf(Error);
        });
      });
    });

    describe("when the server suggests a filename", () => {
      beforeEach(() => {
        scope = nock(remoteHost)
          .get(remotePath)
          .reply(200, mockContent, {
            "Content-Disposition": `attachment; filename="test2.txt"`
          });
      });

      describe("when a filename is passed", () => {
        it("should use the passed filename", async () => {
          await expect(
            TextFile.createFromRemoteFile(
              new RemoteFile(remoteUrl),
              "/",
              mockFileName
            )
          ).resolves.toBeInstanceOf(TextFile);
          expect(fs.files()[mockFilePath]).toBe(mockContent);
        });
      });

      describe("when no filename is passed", () => {
        it("should use the suggested filename", async () => {
          await expect(
            TextFile.createFromRemoteFile(new RemoteFile(remoteUrl), "/")
          ).resolves.toBeInstanceOf(TextFile);
          expect(fs.files()["/test2.txt"]).toBe(mockContent);
        });
      });
    });
  });
});
