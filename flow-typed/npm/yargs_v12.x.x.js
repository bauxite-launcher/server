// flow-typed signature: d6f0db2a3d04a409b27a3514e5f1ab23
// flow-typed version: da30fe6876/yargs_v10.x.x/flow_>=v0.54.x

declare module 'yargs' {
  declare export type Argv<T> = T & {
    _: Array<string>,
    $0: string,
  };

  declare type Options<T> = $Shape<{
    alias: string | Array<string>,
    array: boolean,
    boolean: boolean,
    choices: Array<mixed>,
    coerce: (arg: mixed) => mixed,
    config: boolean,
    configParser: (configPath: string) => { [key: $Keys<T>]: mixed },
    conflicts: string | { [key: $Keys<T>]: string },
    count: boolean,
    default: mixed,
    defaultDescription: string,
    demandOption: boolean | string,
    desc: string,
    describe: string,
    description: string,
    global: boolean,
    group: string,
    implies: string | { [key: $Keys<T>]: string },
    nargs: number,
    normalize: boolean,
    number: boolean,
    requiresArg: boolean,
    skipValidation: boolean,
    string: boolean,
    type: 'array' | 'boolean' | 'count' | 'number' | 'string',
  }>;

  declare type CommonModuleObject<T> = {|
    command?: string | Array<string>,
    aliases?: Array<string> | string,
    builder?:
      | { [key: $Keys<T>]: Options<T> }
      | ((yargsInstance: Yargs<T>) => mixed),
    handler?: (argv: Argv<T>) => void,
  |};

  declare export type ModuleObjectDesc<T> = {|
    ...CommonModuleObject<T>,
    desc?: string | false,
  |};

  declare export type ModuleObjectDescribe<T> = {|
    ...CommonModuleObject<T>,
    describe?: string | false,
  |};

  declare export type ModuleObjectDescription<T> = {|
    ...CommonModuleObject<T>,
    description?: string | false,
  |};

  declare export type ModuleObject<T> =
    | ModuleObjectDesc<T>
    | ModuleObjectDescribe<T>
    | ModuleObjectDescription<T>;

  declare class Yargs<T: Object = *> {
    <T>(args: Array<string>): Yargs<T>;

    alias(key: $Keys<T>, alias: string): this;
    alias(alias: { [key: $Keys<T>]: string | Array<string> }): this;
    argv: Argv<T>;
    array(key: $Keys<T> | Array<$Keys<T>>): this;
    boolean(key: string | Array<string>): this;
    check(fn: (argv: Argv<T>, options: Array<string>) => ?boolean): this;
    choices(key: $Keys<T>, allowed: Array<string>): this;
    choices(allowed: { [key: $Keys<T>]: Array<string> }): this;
    coerce(key: $Keys<T>, fn: (value: any) => mixed): this;
    coerce(object: { [key: $Keys<T>]: (value: any) => mixed }): this;
    coerce(keys: Array<string>, fn: (value: any) => mixed): this;

    command(
      cmd: string | Array<string>,
      desc: string | false,
      builder?:
        | { [key: $Keys<T>]: Options<T> }
        | ((yargsInstance: Yargs<T>) => mixed),
      handler?: Function,
    ): this;

    command(
      cmd: string | Array<string>,
      desc: string | false,
      module: ModuleObject<T>,
    ): this;

    command(module: ModuleObject<T>): this;

    completion(
      cmd: string,
      description?: string,
      fn?: (
        current: string,
        argv: Argv<T>,
        done: (competion: Array<string>) => void,
      ) => ?(Array<string> | Promise<Array<string>>),
    ): this;

    config(
      key?: $Keys<T>,
      description?: string,
      parseFn?: (configPath: string) => { [key: $Keys<T>]: mixed },
    ): this;
    config(
      key: $Keys<T>,
      parseFn?: (configPath: string) => { [key: $Keys<T>]: mixed },
    ): this;
    config(config: { [key: $Keys<T>]: mixed }): this;

    conflicts(key: $Keys<T>, value: string | Array<string>): this;
    conflicts(keys: { [key: $Keys<T>]: string | Array<string> }): this;

    count(name: string): this;

    default(key: $Keys<T>, value: mixed, description?: string): this;
    default(defaults: { [key: $Keys<T>]: mixed }): this;

    // Deprecated: use demandOption() and demandCommand() instead.
    demand(key: $Keys<T>, msg?: string | boolean): this;
    demand(count: number, max?: number, msg?: string | boolean): this;

    demandOption(key: $Keys<T> | Array<$Keys<T>>, msg?: string | boolean): this;

    demandCommand(min: number, minMsg?: string): this;
    demandCommand(
      min: number,
      max: number,
      minMsg?: string,
      maxMsg?: string,
    ): this;

    describe(key: $Keys<T>, description: string): this;
    describe(describeObject: { [key: $Keys<T>]: string }): this;

    detectLocale(shouldDetect: boolean): this;

    env(prefix?: string): this;

    epilog(text: string): this;
    epilogue(text: string): this;

    example(cmd: string, desc: string): this;

    exitProcess(enable: boolean): this;

    fail(
      fn: (failureMessage: string, err: Error, yargs: Yargs<T>) => mixed,
    ): this;

    getCompletion(args: Array<string>, fn: () => void): this;

    global(globals: string | Array<string>, isGlobal?: boolean): this;

    group(key: $Keys<T> | Array<$Keys<T>>, groupName: string): this;

    help(option?: string, desc?: string): this;

    implies(key: $Keys<T>, value: string | Array<string>): this;
    implies(keys: { [key: $Keys<T>]: string | Array<string> }): this;

    locale(
      locale:
        | 'de'
        | 'en'
        | 'es'
        | 'fr'
        | 'hi'
        | 'hu'
        | 'id'
        | 'it'
        | 'ja'
        | 'ko'
        | 'nb'
        | 'pirate'
        | 'pl'
        | 'pt'
        | 'pt_BR'
        | 'ru'
        | 'th'
        | 'tr'
        | 'zh_CN',
    ): this;
    locale(): string;

    nargs(key: $Keys<T>, count: number): this;

    normalize(key: $Keys<T>): this;

    number(key: $Keys<T> | Array<$Keys<T>>): this;

    option(key: $Keys<T>, options?: Options<T>): this;
    option(optionMap: { [key: $Keys<T>]: Options<T> }): this;

    options(key: $Keys<T>, options?: Options<T>): this;
    options(optionMap: { [key: $Keys<T>]: Options<T> }): this;

    parse(
      args?: string | Array<string>,
      context?: { [key: $Keys<T>]: mixed },
      parseCallback?: (err: ?Error, argv: Argv<T>, output?: string) => void,
    ): Argv<T>;
    parse(
      args?: string | Array<string>,
      parseCallback?: (err: ?Error, argv: Argv<T>, output?: string) => void,
    ): Argv<T>;

    pkgConf(key: $Keys<T>, cwd?: string): this;

    recommendCommands(): this;

    // Alias of demand()
    require(key: $Keys<T>, msg: string | boolean): this;
    require(count: number, max?: number, msg?: string | boolean): this;

    requiresArg(key: $Keys<T> | Array<$Keys<T>>): this;

    reset(): this;

    showCompletionScript(): this;

    showHelp(consoleLevel?: 'error' | 'warn' | 'log'): this;

    showHelpOnFail(enable: boolean, message?: string): this;

    strict(): this;

    skipValidation(key: $Keys<T>): this;

    strict(global?: boolean): this;

    string(key: $Keys<T> | Array<$Keys<T>>): this;

    updateLocale(obj: { [key: $Keys<T>]: string }): this;
    updateStrings(obj: { [key: $Keys<T>]: string }): this;

    usage(message: string, opts?: { [key: $Keys<T>]: Options<T> }): this;

    version(): this;
    version(version: string): this;
    version(option: string | (() => string), version: string): this;
    version(
      option: string | (() => string),
      description: string | (() => string),
      version: string,
    ): this;

    wrap(columns: number | null): this;
  }

  declare export default Yargs<*>;
}
