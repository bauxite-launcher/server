import TextFile from "../TextFile";
import fs from "jest-plugin-fs";

jest.mock("fs", () => require("jest-plugin-fs/mock"));

const mockContent = "hello there 💩";
const mockFilePath = "/text.txt";
const existingFiles = { [mockFilePath]: mockContent };

describe("TextFile", () => {
  afterEach(() => fs.restore());

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
});
