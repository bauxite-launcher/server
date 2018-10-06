# `bx-instance` tool

The `bx-instance` command-line tool can be used to manage individual Minecraft server instances installed on the local machine.

> Note: Package is not yet published on npm
>
> TODO: Decide on structure; monorepo vs individual packages

## Installation

Install the CLI globally on your system using either [npm](https://npmjs.com) or [yarn](https://yarnpkg.com).

```sh
npm install --global @bauxite/instance-cli
```

```sh
yarn global add @bauxite/instance-cli
```

## Usage

If run without arguments, or passing the `--help` flag, information about the different commands is shown:

```
$ bx-instance --help

bx-instance <command>

Commands:
  bx-instance status   Show the current status of the instance
  bx-instance install  Install Minecraft server
  bx-instance upgrade  Upgrade Minecraft server
  bx-instance start    Start Minecraft server
  bx-instance stop     Stop Minecraft server

Options:
  --help       Show help                                             [boolean]
  --version    Show version number                                   [boolean]
  --directory  The directory of the Minecraft instance  [string] [default: ./]
  --json       Output results as a JSON object      [boolean] [default: false]
```

## Quick Start

After following the installation instructions above, we can create our first instance.

```sh
bx-instance install --directory ~/minecraft
```

This will install the latest version of Minecraft into `~/minecraft` ─ the directory will be created automatically if it does not already exist.

If we had wanted to install a different version, we can use the `--minecraftVersion` flag, like so:

```sh
bx-instance install --directory ~/minecraft --version 1.12.2
```

Once installed, we can start up our server!

```sh
bx-instance start --directory ~/minecraft
```

This will launch our server process in the background. Now, to access our logs, we can use `tail`:

```sh
tail -f ~/minecraft/logs/latest.log
```

## Commands

All of the following commands accept a `--directory` flag. Alternatively, you may set the `BAUXITE_DIRECTORY` environment flag. By default, the current working directory will be used.

All commands also accept a `--json` parameter, which when set will return all output as JSON once the command has finished executing.

### `bx-instance create`

Installs a new instance of Minecraft server.

```sh
bx-instance create [--minecraft-version <version>]
```

#### Parameters

- `--minecraft-version` ─ The version of Minecraft server to install. If none is passed, the latest stable version will be used.

#### Notes

- If the instance is already installed, an error will occur. To upgrade an existing instance, use the `upgrade` command.

### `bx-instance status`

Shows the current status of the Minecraft server instance.

```sh
bx-instance status
```

### `bx-instance upgrade`

Upgrades an existing instance of Minecraft server to a different version.

```sh
bx-instance upgrade [--minecraft-version <version>]
```

#### Parameters

- `--minecraft-version` ─ The version of Minecraft server to upgrade to. If none is passed, the latest stable version will be used.

#### Notes

- If the instance does not yet exist, an error will occur.
- If the new version is the same as the current version, an error will occur.

### `bx-instance start`

Launches the Minecraft server instance.

```sh
bx-instance start
```

#### Notes

- If the instance is not installed, an error will occur.
- If the instance already has a running process, an error will occur.
- An `instance.pid` file will be created in the instance directory, containing the process ID of the server process.

### `bx-instance stop`

Attempts to gracefully stop a running Minecraft server instance.

```sh
bx-instance stop
```

#### Notes

- If the instance is not installed, an error will occur.
- If the instance does not have a running process, an error will occur.
