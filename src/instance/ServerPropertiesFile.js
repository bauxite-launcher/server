// @flow

import { TextFile } from "../util/TextFile";

type ServerPropertyValue = string | number | boolean | null;

export type ServerProperties = {
  [key: string]: ServerPropertyValue
};

export type ServerPropertiesPatch = ServerProperties;

class ServerPropertiesFile extends TextFile {
  constructor(filePath: string) {
    super(filePath, "utf8");
  }

  async readProperties(): Promise<ServerProperties> {
    const rawFile = await this.readAsString();
    return this.constructor.parseFile(rawFile);
  }

  async readProperty(name: string): Promise<ServerPropertyValue> {
    const props = await this.readProperties();
    return props[name];
  }

  async writeProperties(props: ServerProperties): Promise<void> {
    const rawFile = this.constructor.stringifyFile(props);
    return this.writeFromString(rawFile);
  }

  async updateProperties(propsPatch: ServerProperties): Promise<void> {
    const oldProps = await this.readProperties();
    const newProps = Object.assign({}, oldProps, propsPatch);
    return this.writeProperties(newProps);
  }

  async deleteProperty(name: $Keys<ServerProperties>): Promise<void> {
    const oldProps = await this.readProperties();
    const newProps = Object.assign({}, oldProps);
    delete newProps[name];
    return this.writeProperties(newProps);
  }

  static async createFromProperties(
    filePath: string,
    props: ServerProperties
  ): Promise<ServerPropertiesFile> {
    const file = new ServerPropertiesFile(filePath);
    file.unreadUpdates = false;
    await file.writeProperties(props);
    return file;
  }

  static parseFile(rawFile: string): ServerProperties {
    const pairs = rawFile
      .split(/\r?\n/g)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"))
      .map(line => line.split("="));

    return pairs.reduce((props, [key, value]) => {
      props[key] = this.parseValue(value);
      return props;
    }, {});
  }

  static stringifyFile(props: ServerProperties): string {
    const pairs = Object.keys(props).map(key => [
      key,
      this.stringifyValue(props[key])
    ]);
    return pairs.map(pair => pair.join("=")).join("\n");
  }

  static parseValue(value: ?string): ?ServerPropertyValue {
    if (value == null || value === "") {
      return null;
    }
    const asNumber = parseFloat(value);
    if (asNumber.toString() === value) {
      return asNumber;
    }
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  }

  static stringifyValue(value: ServerPropertyValue): string {
    if (value == null) {
      return "";
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (typeof value === "number") {
      return value.toString();
    }
    return value;
  }
}

export default ServerPropertiesFile;
