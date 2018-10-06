# Bauxite Server Instance API

> Note: Package is not yet published on npm
>
> TODO: Decide on structure; monorepo vs individual packages

## Installation

Install the API as a dependency in your project using either [npm](https://npmjs.com) or [yarn](https://yarnpkg.com).

```sh
npm install --save @bauxite/instance-api
```

```sh
yarn add @bauxite/instance-api
```

## `Instance` class

The main export of this package is the `Instance` class, which represents a single Minecraft server instance, in terms of its files in the filesystem, and any running process it may have.

You can import `Instance` like so:

```js
// ES6 Modules
import Instance from "@bauxite/instance-api";

// CommonJS
const Instance = require("@bauxite/instance-api").default;
```

Once imported, you can instantiate it in one of two ways:

```js
// Instantiate only
const myExistingInstance = new Instance("./instance");

// Instantiate and install
const myNewInstance = await Instance.create("./instance", {
  minecraftVersion: "1.13.1"
});
```
