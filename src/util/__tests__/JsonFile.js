import { File } from "../File";
import { TextFile } from "../TextFile";
import { JsonFile } from "../JsonFile";
import fs from "jest-plugin-fs";
import withContext from "./context.testUtil";

jest.mock("fs", () => require("jest-plugin-fs/mock"));

describe("JsonFile", () => {
  it("should be a function", () => {
    expect(JsonFile).toBeInstanceOf(Function);
  });

  describe("when called with no parameters", () => {
    it("should throw an error", () => {
      expect(() => new JsonFile()).toThrowError();
    });
  });

  describe("when called with a valid file path", () => {
    let file;
    beforeEach(() => {
      file = new JsonFile("/file");
    });

    it("should create an instance of JsonFile", () => {
      expect(file).toBeInstanceOf(File);
      expect(file).toBeInstanceOf(TextFile);
      expect(file).toBeInstanceOf(JsonFile);
    });
  });

  describe("createFromObject", () => {
    beforeEach(() => fs.mock({}));
    afterEach(() => fs.restore());
    withContext(
      {
        file: () =>
          JsonFile.createFromObject("/test", { foo: "bar", bax: "💩" })
      },
      ctx => {
        it("should be an instance of JsonFile", () => {
          expect(ctx.file).toBeInstanceOf(JsonFile);
        });

        it("should write to the filesystem", () => {
          expect(fs.files()).toHaveProperty("/test");
          expect(fs.files()["/test"]).toBe('{"foo":"bar","bax":"💩"}');
        });
      }
    );
  });

  describe("readAsObject", () => {
    beforeEach(() => fs.mock({ "/test": '{"foo":"bar","bax":"💩"}' }));
    afterEach(() => fs.restore());
    withContext(
      {
        file: () => new JsonFile("/test")
      },
      ctx => {
        it("should read from the filesystem", async () => {
          const result = await ctx.file.readAsObject();
          expect(result).toMatchObject({ foo: "bar", bax: "💩" });
        });
      }
    );
  });

  describe("writeFromObject", () => {
    beforeEach(() => fs.mock({}));
    afterEach(() => fs.restore());
    withContext(
      {
        file: () => new JsonFile("/test")
      },
      ctx => {
        it("should write from the filesystem", async () => {
          await ctx.file.writeFromObject({ foo: "bar", bax: "💩" });
          expect(fs.files()["/test"]).toEqual('{"foo":"bar","bax":"💩"}');
        });
      }
    );
  });
});
