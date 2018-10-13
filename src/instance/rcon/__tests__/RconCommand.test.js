import createRconCommand from '../RconCommand';

describe('createRconCommand', () => {
  it('should be a function', () => {
    expect(createRconCommand).toBeInstanceOf(Function);
  });

  describe('when called', () => {
    let mockDefinition;
    let handler;
    beforeEach(() => {
      mockDefinition = {
        command: jest.fn(({ foo }) => ['baz', foo]),
        response: jest.fn(response => ({ response })),
      };
      handler = createRconCommand(mockDefinition);
    });

    it('should return a function', () => {
      expect(handler).toBeInstanceOf(Function);
    });

    describe('which when called', () => {
      let mockSendMessage;
      let instance;
      beforeEach(() => {
        mockSendMessage = jest.fn(() => Promise.resolve('quux'));
        instance = handler(mockSendMessage);
      });

      it('should return a function', () => {
        expect(instance).toBeInstanceOf(Function);
      });

      describe('which when called', () => {
        let result;
        beforeEach(() => {
          result = instance({ foo: 'bar' });
        });

        it("should call the handler's command method", () => {
          expect(mockDefinition.command).toHaveBeenCalledWith({ foo: 'bar' });
        });

        it('should call sendMessage', () => {
          expect(mockSendMessage).toHaveBeenCalledWith(['baz', 'bar']);
        });

        it("should call the handler's response method", () => {
          expect(mockDefinition.response).toHaveBeenCalledWith('quux');
        });

        it("should return the result of calling the handler's response method", async () => {
          await expect(result).resolves.toEqual({ response: 'quux' });
        });
      });
    });
  });
});
