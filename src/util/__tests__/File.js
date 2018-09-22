import { File } from "../File";
import fs from "jest-plugin-fs";
import withContext from "./context.testUtil";

jest.mock("fs", () => require("jest-plugin-fs/mock"));

describe("File", () => {
  it("should be a function", () => {
    expect(File).toBeInstanceOf(Function);
  });

  describe("when called with no parameters", () => {
    it("should throw an error", () => {
      expect(() => new File()).toThrowError();
    });
  });

  describe("when called with a valid file path", () => {
    withContext({ file: () => new File("/file") }, ctx => {
      it("should create an instance of File", () => {
        expect(ctx.file).toBeInstanceOf(File);
      });
    });
  });

  describe("createFromBuffer", () => {
    beforeEach(() => fs.mock({}));
    afterEach(() => fs.restore());
    withContext(
      { file: () => File.createFromBuffer("/test", Buffer.from([97, 97, 97])) },
      ctx => {
        it("should return an instance of File", () => {
          expect(ctx.file).toBeInstanceOf(File);
        });

        it("should write to the filesystem", () => {
          expect(fs.files()).toHaveProperty("/test");
          expect(fs.files()["/test"]).toEqual("aaa");
        });
      }
    );
  });

  describe("readAsBuffer", () => {
    beforeEach(() => fs.mock({}));
    afterEach(() => fs.restore());
    withContext(
      { file: () => File.createFromBuffer("/test", Buffer.from([97, 97, 97])) },
      ctx => {
        it("should read from the filesystem", async () => {
          const result = await ctx.file.readAsBuffer();
          expect(result).toEqual(Buffer.from("aaa"));
        });
      }
    );
  });

  describe("writeFromBuffer", () => {
    beforeEach(() => fs.mock({}));
    afterEach(() => fs.restore());
    withContext(
      {
        file: () => new File("/test")
      },
      ctx => {
        it("should write to the filesystem", async () => {
          await ctx.file.writeFromBuffer(Buffer.from("aaa"));
          expect(fs.files()["/test"]).toEqual("aaa");
        });
      }
    );
  });
});
