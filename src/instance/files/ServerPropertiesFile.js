// @flow

import TextFile from "../../util/TextFile";
import pkg from "../../../package.json";

export type ServerPropertyValue = string | number | boolean | null;
export type ServerPropertyName =
  | "allow-flight"
  | "allow-nether"
  | "difficulty"
  | "enable-query"
  | "enable-rcon"
  | "enable-command-block"
  | "force-gamemode"
  | "gamemode"
  | "generate-structures"
  | "generator-settings"
  | "hardcore"
  | "level-name"
  | "level-seed"
  | "level-type"
  | "max-build-height"
  | "max-players"
  | "max-tick-time"
  | "max-world-size"
  | "motd"
  | "network-compression-threshold"
  | "online-mode"
  | "op-permission-level"
  | "player-idle-timeout"
  | "prevent-proxy-connections"
  | "pvp"
  | "query.port"
  | "rcon.password"
  | "rcon-port"
  | "resource-pack"
  | "resource-pack-sha1"
  | "server-ip"
  | "server-port"
  | "snooper-enabled"
  | "spawn-animals"
  | "spawn-monsters"
  | "spawn-npcs"
  | "spawn-protection"
  | "use-native-transport"
  | "view-distance"
  | "white-list"
  | "enforce-whitelist";

export type ServerProperties = {
  [key: ServerPropertyName]: ServerPropertyValue
};

class ServerPropertiesFile extends TextFile<ServerProperties> {
  static header = `Generated by ${pkg.name} v${
    pkg.version
  } at ${new Date().toLocaleString()}`;
  static async parse(rawFile: string): Promise<ServerProperties> {
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

  static async serialize(props: ServerProperties): Promise<string> {
    const pairs = Object.keys(props).map(key => [
      key,
      this.serializeValue(props[key])
    ]);
    return [this.header, ...pairs.map(pair => pair.join("="))].join("\n");
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

  static serializeValue(value: ServerPropertyValue): string {
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
