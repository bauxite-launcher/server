import { File } from "../File";
import { TextFile } from "../TextFile";
import fs from "jest-plugin-fs";
import withContext from "./context.testUtil";

jest.mock("fs", () => require("jest-plugin-fs/mock"));

describe("TextFile", () => {
  it("should be a function", () => {
    expect(TextFile).toBeInstanceOf(Function);
  });

  describe("when called with no parameters", () => {
    it("should throw an error", () => {
      expect(() => new TextFile()).toThrowError();
    });
  });

  describe("when called with a valid file path", () => {
    let file;
    beforeEach(() => {
      file = new TextFile("/file");
    });
    it("should create an instance of TextFile", () => {
      expect(file).toBeInstanceOf(File);
      expect(file).toBeInstanceOf(TextFile);
    });
  });

  describe("createFromString", () => {
    beforeEach(() => fs.mock({}));
    afterEach(() => fs.restore());
    withContext(
      {
        file: () => TextFile.createFromString("/test", "awooga")
      },
      ctx => {
        it("should return an instance of File", () => {
          expect(ctx.file).toBeInstanceOf(File);
        });

        it("should write to the filesystem", () => {
          expect(fs.files()).toHaveProperty("/test");
          expect(fs.files()["/test"]).toEqual("awooga");
        });
      }
    );
  });

  describe("readAsString", () => {
    beforeEach(() => fs.mock({ "/test": "aaaa!" }));
    afterEach(() => fs.restore());
    withContext(
      {
        file: () => new TextFile("/test")
      },
      ctx => {
        it("should read from the filesystem", async () => {
          const result = await ctx.file.readAsString();
          expect(result).toEqual("aaaa!");
        });
      }
    );
  });

  describe("writeFromString", () => {
    beforeEach(() => fs.mock({}));
    afterEach(() => fs.restore());
    withContext(
      {
        file: () => new TextFile("/test")
      },
      ctx => {
        it("should write from the filesystem", async () => {
          await ctx.file.writeFromString("aaa");
          expect(fs.files()["/test"]).toEqual("aaa");
        });
      }
    );
  });
});
