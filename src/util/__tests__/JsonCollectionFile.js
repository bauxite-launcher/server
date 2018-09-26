// @flow
import JsonCollectionFile from "../JsonCollectionFile";
import fs from "jest-plugin-fs";

jest.mock("fs", () => require("jest-plugin-fs/mock"));

const mockContent = [{ id: "💩" }, { id: "😀" }];
const mockFileContent = JSON.stringify(mockContent, null, 2);
const mockFilePath = "/file.json";
const existingFiles = { [mockFilePath]: mockFileContent };

describe("JsonCollectionFile", () => {
  afterEach(() => fs.restore());

  it("should be a function", () => {
    expect(JsonCollectionFile).toBeInstanceOf(Function);
  });

  describe("when not existing on disk", () => {
    beforeEach(() => fs.mock());

    describe("when constructed", () => {
      it("should not throw an error", () => {
        expect(() => new JsonCollectionFile(mockFilePath)).not.toThrowError();
      });

      it("should return an instance of JsonCollectionFile", () => {
        expect(new JsonCollectionFile(mockFilePath)).toBeInstanceOf(
          JsonCollectionFile
        );
      });
    });

    describe("when read", () => {
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));
      it("should throw an error", async () => {
        await expect(file.read()).rejects.toBeInstanceOf(Error);
      });
    });

    describe("when written with a value", () => {
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));
      it("should not error", async () => {
        await expect(file.write(mockContent)).resolves.toBeUndefined();
      });

      it("should write to disk", async () => {
        await file.write(mockContent);
        expect(fs.files()).toMatchObject(existingFiles);
      });
    });

    describe("when written without a value", () => {
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));
      it("should throw an error", async () => {
        await expect(file.write()).rejects.toBeInstanceOf(Error);
      });
    });
  });

  describe("when existing on disk", () => {
    beforeEach(() => fs.mock(existingFiles));

    describe("when constructed", () => {
      it("should not throw an error", () => {
        expect(() => new JsonCollectionFile(mockFilePath)).not.toThrowError();
      });

      it("should return an instance of JsonCollectionFile", () => {
        expect(new JsonCollectionFile(mockFilePath)).toBeInstanceOf(
          JsonCollectionFile
        );
      });
    });

    describe("when read", () => {
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));
      it("should return the processId", async () => {
        await expect(file.read()).resolves.toEqual(mockContent);
      });
    });

    describe("when written with a value", () => {
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));
      it("should not error", async () => {
        await expect(file.write(mockContent)).resolves.toBeUndefined();
      });

      it("should write to disk", async () => {
        await file.write(mockContent);
        expect(fs.files()).toMatchObject(existingFiles);
      });
    });

    describe("when written without a value", () => {
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));
      it("should throw an error", async () => {
        await expect(file.write()).rejects.toBeInstanceOf(Error);
      });
    });

    describe("find", () => {
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));
      it("should return nothing when nothing matches", async () => {
        await expect(file.find(() => false)).resolves.toBeUndefined();
      });

      it("should return an item when one matches", async () => {
        await expect(
          file.find(item => item.id === "😀")
        ).resolves.toMatchObject({ id: "😀" });
      });
    });

    describe("filter", () => {
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));
      it("should return an empty array when nothing matches", async () => {
        await expect(file.filter(() => false)).resolves.toEqual([]);
      });

      it("should return an item when one matches", async () => {
        await expect(file.filter(item => item.id)).resolves.toEqual(
          mockContent
        );
      });
    });

    describe("update", () => {
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));

      it("should provide the collection to the callback", async () => {
        const callback = jest.fn(value => value);
        await file.update(callback);
        expect(callback).toHaveBeenCalledWith(mockContent);
      });

      it("should write the updated collection to disk", async () => {
        const callback = jest.fn(collection =>
          collection.map(value => ({ ...value, touched: true }))
        );
        await file.update(callback);
        expect(fs.files()[mockFilePath]).toEqual(
          JSON.stringify(
            [{ id: "💩", touched: true }, { id: "😀", touched: true }],
            null,
            2
          )
        );
      });
    });

    describe("updateItem", () => {
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));

      it("should provide the matching item of the collection to the callback", async () => {
        const callback = jest.fn(value => value);
        await file.updateItem(item => item.id === "😀", callback);
        expect(callback).toHaveBeenCalledWith(mockContent[1]);
      });

      it("should write the updated collection to disk", async () => {
        const callback = jest.fn(item => ({ ...item, touched: true }));
        await file.updateItem(item => item.id === "😀", callback);
        expect(fs.files()[mockFilePath]).toEqual(
          JSON.stringify([{ id: "💩" }, { id: "😀", touched: true }], null, 2)
        );
      });
    });

    describe("add", () => {
      const newItem = { id: "😇" };
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));
      it("should not throw an error", async () => {
        await expect(file.add(newItem)).resolves.toBeUndefined();
      });
      it("should append an item to the collection", async () => {
        await file.add(newItem);
        await expect(file.read()).resolves.toEqual([...mockContent, newItem]);
      });
    });

    describe("remove", () => {
      const removeItemId = "💩";
      let file;
      beforeEach(() => (file = new JsonCollectionFile(mockFilePath)));
      it("should not throw an error", async () => {
        await expect(
          file.remove(item => item.id === removeItemId)
        ).resolves.toBeUndefined();
      });
      it("should append an item to the collection", async () => {
        await file.remove(item => item.id === removeItemId);
        await expect(file.read()).resolves.toEqual([{ id: "😀" }]);
      });
    });
  });

  describe("validate", () => {
    const uniquelyIndexedCollection = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const nonUniquelyIndexedCollection = [{ id: 1 }, { id: 2 }, { id: 1 }];
    describe("with no uniqueKeys specified", () => {
      it("should not throw an error when given a uniquely indexed collection", () => {
        expect(() =>
          JsonCollectionFile.validate(uniquelyIndexedCollection)
        ).not.toThrowError();
      });
      it("should not throw an error when given a non-uniquely indexed collection", () => {
        expect(() =>
          JsonCollectionFile.validate(nonUniquelyIndexedCollection)
        ).not.toThrowError();
      });
    });

    describe("with uniqueKeys specified", () => {
      class UniqueCollection extends JsonCollectionFile {
        static uniqueKeys = ["id"];
      }

      it("should not throw an error when given a uniquely indexed collection", () => {
        expect(() =>
          UniqueCollection.validate(uniquelyIndexedCollection)
        ).not.toThrowError();
      });
      it("should throw an error when given a non-uniquely indexed collection", () => {
        expect(() =>
          UniqueCollection.validate(nonUniquelyIndexedCollection)
        ).toThrowError();
      });
    });
  });
});
