import ServerPropertiesFile from '../ServerPropertiesFile';

describe('ServerPropertiesFile', () => {
  it('should be a function', () => {
    expect(ServerPropertiesFile).toBeInstanceOf(Function);
  });

  describe('parse', () => {
    it('should be a function', () => {
      expect(ServerPropertiesFile.parse).toBeInstanceOf(Function);
    });

    describe('when given a valid file', () => {
      it('should parse the file', async () => {
        const actual = ServerPropertiesFile.parse(`
# Comments and empty lines are ignored
foo=bar
baz=3
enable-magic=true
      `);
        await expect(actual).resolves.toMatchObject({
          foo: 'bar',
          baz: 3,
          'enable-magic': true,
        });
      });
    });
  });

  describe('serialize', () => {
    it('should be a function', () => {
      expect(ServerPropertiesFile.serialize).toBeInstanceOf(Function);
    });

    describe('when given server properties', () => {
      it('should return a valid file', async () => {
        const actual = ServerPropertiesFile.serialize({
          foo: 'bar',
          baz: 3,
          'enable-magic': false,
        });
        await expect(actual).resolves.toBe(
          `${ServerPropertiesFile.header}\nfoo=bar\nbaz=3\nenable-magic=false`,
        );
      });
    });
  });

  describe('parseValue', () => {
    it('should be a function', () => {
      expect(ServerPropertiesFile.parseValue).toBeInstanceOf(Function);
    });

    describe('when given boolean values', () => {
      it('should parse true', () => {
        expect(ServerPropertiesFile.parseValue('true')).toBe(true);
      });
      it('should parse false', () => {
        expect(ServerPropertiesFile.parseValue('false')).toBe(false);
      });
    });
    describe('when given numeric values', () => {
      it('should parse 0', () => {
        expect(ServerPropertiesFile.parseValue('0')).toBe(0);
      });
      it('should parse 1', () => {
        expect(ServerPropertiesFile.parseValue('1')).toBe(1);
      });
      it('should parse 10.45', () => {
        expect(ServerPropertiesFile.parseValue('10.45')).toBe(10.45);
      });
      it('should parse -250', () => {
        expect(ServerPropertiesFile.parseValue('-250')).toBe(-250);
      });
    });
  });

  describe('serializeValue', () => {
    it('should be a function', () => {
      expect(ServerPropertiesFile.serializeValue).toBeInstanceOf(Function);
    });

    describe('when given boolean values', () => {
      it('should parse true', () => {
        expect(ServerPropertiesFile.serializeValue(true)).toBe('true');
      });
      it('should parse false', () => {
        expect(ServerPropertiesFile.serializeValue(false)).toBe('false');
      });
    });
    describe('when given numeric values', () => {
      it('should parse 0', () => {
        expect(ServerPropertiesFile.serializeValue(0)).toBe('0');
      });
      it('should parse 1', () => {
        expect(ServerPropertiesFile.serializeValue(1)).toBe('1');
      });
      it('should parse 10.45', () => {
        expect(ServerPropertiesFile.serializeValue(10.45)).toBe('10.45');
      });
      it('should parse -250', () => {
        expect(ServerPropertiesFile.serializeValue(-250)).toBe('-250');
      });
    });

    describe('when given string values', () => {
      it('should return them', () => {
        expect(ServerPropertiesFile.serializeValue('hey')).toBe('hey');
      });
    });
  });
});
