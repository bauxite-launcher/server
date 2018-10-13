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
        name: 'fooBar',
        command: jest.fn(({ foo }) => ['baz', foo]),
        response: jest.fn(response => ({ response })),
      };
      handler = createRconCommand(mockDefinition);
    });

    it('should return a function', () => {
      expect(handler).toBeInstanceOf(Function);
    });

    it('should have a commandName property', () => {
      expect(handler).toHaveProperty('commandName', mockDefinition.name);
    });

    describe('which when called', () => {
      let mockSendMessage;
      let result;
      beforeEach(async () => {
        mockSendMessage = jest.fn(() => Promise.resolve('quux'));
        result = await handler({ foo: 'bar' }, mockSendMessage);
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

      it("should return the result of calling the handler's response method", () => {
        expect(result).toEqual({ response: 'quux' });
      });
    });
  });
});
