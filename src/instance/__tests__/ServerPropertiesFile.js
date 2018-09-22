import ServerPropertiesFile from "../ServerPropertiesFile";

describe("ServerPropertiesFile", () => {
  it("should be a function", () => {
    expect(ServerPropertiesFile).toBeInstanceOf(Function);
  });

  describe("parseFile", () => {
    it("should be a function", () => {
      expect(ServerPropertiesFile.parseFile).toBeInstanceOf(Function);
    });

    describe("when given a valid file", () => {
      it("should parse the file", () => {
        const actual = ServerPropertiesFile.parseFile(`
# Comments and empty lines are ignored
foo=bar
baz=3
enable-magic=true
      `);
        expect(actual).toMatchObject({
          foo: "bar",
          baz: 3,
          "enable-magic": true
        });
      });
    });
  });

  describe("stringifyFile", () => {
    it("should be a function", () => {
      expect(ServerPropertiesFile.stringifyFile).toBeInstanceOf(Function);
    });

    describe("when given server properties", () => {
      it("should return a valid file", () => {
        const actual = ServerPropertiesFile.stringifyFile({
          foo: "bar",
          baz: 3,
          "enable-magic": false
        });
        expect(actual).toBe("foo=bar\nbaz=3\nenable-magic=false");
      });
    });
  });

  describe("parseValue", () => {
    it("should be a function", () => {
      expect(ServerPropertiesFile.parseValue).toBeInstanceOf(Function);
    });

    describe("when given boolean values", () => {
      it("should parse true", () => {
        expect(ServerPropertiesFile.parseValue("true")).toBe(true);
      });
      it("should parse false", () => {
        expect(ServerPropertiesFile.parseValue("false")).toBe(false);
      });
    });
    describe("when given numeric values", () => {
      it("should parse 0", () => {
        expect(ServerPropertiesFile.parseValue("0")).toBe(0);
      });
      it("should parse 1", () => {
        expect(ServerPropertiesFile.parseValue("1")).toBe(1);
      });
      it("should parse 10.45", () => {
        expect(ServerPropertiesFile.parseValue("10.45")).toBe(10.45);
      });
      it("should parse -250", () => {
        expect(ServerPropertiesFile.parseValue("-250")).toBe(-250);
      });
    });
  });

  describe("stringifyValue", () => {
    it("should be a function", () => {
      expect(ServerPropertiesFile.stringifyValue).toBeInstanceOf(Function);
    });

    describe("when given boolean values", () => {
      it("should parse true", () => {
        expect(ServerPropertiesFile.stringifyValue(true)).toBe("true");
      });
      it("should parse false", () => {
        expect(ServerPropertiesFile.stringifyValue(false)).toBe("false");
      });
    });
    describe("when given numeric values", () => {
      it("should parse 0", () => {
        expect(ServerPropertiesFile.stringifyValue(0)).toBe("0");
      });
      it("should parse 1", () => {
        expect(ServerPropertiesFile.stringifyValue(1)).toBe("1");
      });
      it("should parse 10.45", () => {
        expect(ServerPropertiesFile.stringifyValue(10.45)).toBe("10.45");
      });
      it("should parse -250", () => {
        expect(ServerPropertiesFile.stringifyValue(-250)).toBe("-250");
      });
    });

    describe("when given string values", () => {
      it("should return them", () => {
        expect(ServerPropertiesFile.stringifyValue("hey")).toBe("hey");
      });
    });
  });
});
