// @flow
import { type Argv } from 'yargs';
import chalk from 'chalk';
import createCommandHandler, {
  type CommandHandlerDefinition,
} from '../commandHandler';
import { definitionList, definitionValue } from './util/components';
import ServerPropertiesFile, {
  type ServerProperties,
  type ServerPropertyName,
  type ServerPropertyValue,
} from '../../../instance/files/ServerPropertiesFile';

type PropertiesArgs = {
  json?: boolean,
  key?: ServerPropertyName,
  value?: string,
};

type AllPropertiesOutput = { action: 'get-all', allProps: ServerProperties };
type GetPropertyOutput = {
  action: 'get',
  prop: ServerPropertyName,
  value: ServerPropertyValue,
};
type SetPropertyOutput = {
  action: 'set',
  prop: ServerPropertyName,
  oldValue: ServerPropertyValue,
  newValue: ServerPropertyValue,
  restartPending: boolean,
};

type PropertiesOutput =
  | AllPropertiesOutput
  | GetPropertyOutput
  | SetPropertyOutput;

export const propertiesCommand: CommandHandlerDefinition<
  PropertiesArgs,
  PropertiesOutput,
> = {
  command: 'properties',
  description: 'Properties Minecraft server',
  builder: {
    key: {
      type: 'string',
    },
    value: {
      type: 'string',
    },
  },
  async setup(
    { json = false, key, value }: Argv<PropertiesArgs>,
    instance,
  ): Promise<PropertiesOutput> {
    const installed = await instance.isInstalled();
    if (!installed) {
      throw new Error('The instance has not been installed yet.');
    }

    if (key != null && value != null) {
      const running = await instance.isRunning();
      if (running && !json) {
        console.warn(
          chalk.yellow(
            'New settings will not be applied until instance is restarted.',
          ),
        );
      }

      const oldValue = await instance.properties.get(key);
      const newValue = ServerPropertiesFile.parseValue(value);
      if (typeof newValue === 'undefined') {
        throw new Error('Valid value must be provided for setting');
      }
      await instance.properties.set(key, newValue);
      return {
        action: 'set',
        prop: key,
        oldValue,
        newValue,
        restartPending: running,
      };
    }

    if (key) {
      const currentValue = await instance.properties.get(key);
      return { action: 'get', prop: key, value: currentValue };
    }

    const allProps = await instance.properties.read();
    return { action: 'get-all', allProps };
  },
  render(result) {
    switch (result.action) {
      case 'get-all':
        return definitionList(result.allProps);
      case 'get':
        return definitionList({ [result.prop]: result.value });
      case 'set':
        return definitionList({
          [result.prop]: `${chalk.italic.strikethrough(
            definitionValue(result.oldValue, 'gray'),
          )} ${chalk.white('->')} ${chalk.bold(
            definitionValue(result.newValue),
          )}`,
        });
      default:
        throw new Error('Unknown command');
    }
  },
};

export default createCommandHandler(propertiesCommand);
