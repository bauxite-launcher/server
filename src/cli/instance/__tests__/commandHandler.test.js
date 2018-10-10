import createCommandHandler from '../commandHandler';

jest.mock('../../../instance/Instance');

// TODO: Test '--json' functionality

describe('createCommandHandler', () => {
  let handlerDefinition;
  let instance;
  const originalStdoutWrite = process.stdout.write;

  beforeEach(() => {
    global.process.stdout.write = jest.fn();
    handlerDefinition = {
      command: 'test',
      description: 'Run test',
      setup: jest.fn(argv => ({ argv })),
      render: jest.fn(() => 'hello'),
      renderError: jest.fn(error => ['FAIL', error.message]),
      isTest: Symbol('TEST'),
    };
    instance = createCommandHandler(handlerDefinition);
  });

  afterEach(() => {
    global.process.stdout.write = originalStdoutWrite;
  });

  it('should be a function', () => {
    expect(createCommandHandler).toBeInstanceOf(Function);
  });

  describe('when called with a valid command handler definition', () => {
    it('should return a yargs-compatible command handler', () => {
      expect(instance).toHaveProperty('command', handlerDefinition.command);
      expect(instance).toHaveProperty(
        'description',
        handlerDefinition.description,
      );
      expect(instance).toHaveProperty('handler');
    });

    it('should pass through any extra properties to the returned object', () => {
      expect(instance).toHaveProperty('isTest', handlerDefinition.isTest);
    });
  });

  describe('when setup and render succeed', () => {
    let argv;
    beforeEach(() => {
      argv = { directory: '/', text: 'foo' };
    });
    describe('when called', () => {
      beforeEach(() => instance.handler(argv));
      it('should call setup with the supplied argv object', () => {
        expect(handlerDefinition.setup).toHaveBeenCalledTimes(1);
        expect(handlerDefinition.setup.mock.calls[0][0]).toMatchObject(argv);
      });
      it('should call render with whatever setup returned', () => {
        expect(handlerDefinition.render).toHaveBeenCalledTimes(1);
        expect(handlerDefinition.render.mock.calls[0][0]).toMatchObject({
          argv,
        });
      });
    });

    describe('when render returns a string', () => {
      beforeEach(() => {
        handlerDefinition.render = jest.fn(
          ({ argv: { directory, text } }) => directory + text,
        );
        instance = createCommandHandler(handlerDefinition);
        instance.handler(argv);
      });
      it('should log that string to the console', () => {
        expect(process.stdout.write).toHaveBeenCalledTimes(1);
        expect(process.stdout.write).toHaveBeenCalledWith('/foo\n');
      });
    });
    describe('when render returns an array of strings', () => {
      beforeEach(() => {
        handlerDefinition.render = jest.fn(({ argv: { directory, text } }) => [
          directory,
          text,
        ]);
        instance = createCommandHandler(handlerDefinition);
        instance.handler(argv);
      });
      it('should log a joined version of that array to the console', () => {
        expect(process.stdout.write).toHaveBeenCalledTimes(1);
        expect(process.stdout.write).toHaveBeenCalledWith('/\nfoo\n');
      });
    });

    describe('when render throws an error', () => {
      beforeEach(() => {
        handlerDefinition.render = jest.fn(() => {
          throw new Error('Whoops!');
        });
        instance = createCommandHandler(handlerDefinition);
        instance.handler(argv);
      });
      it('should call renderError with that error', () => {
        expect(handlerDefinition.renderError).toHaveBeenCalledTimes(1);
        expect(handlerDefinition.renderError.mock.calls[0][0]).toBeInstanceOf(
          Error,
        );
      });
    });

    describe('when the --json flag is passed', () => {
      beforeEach(() => {
        instance = createCommandHandler(handlerDefinition);
        instance.handler({ ...argv, json: true });
      });

      it('should log the result as valid JSON', () => {
        expect(process.stdout.write).toHaveBeenCalledTimes(1);
        expect(JSON.parse(process.stdout.write.mock.calls[0][0])).toMatchObject(
          { argv: { ...argv, json: true } },
        );
      });
    });
  });
});
