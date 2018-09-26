import InstanceProcess from "../Process";
import fs from "jest-plugin-fs";
import SettingsFile from "../files/SettingsFile";

jest.mock("fs", () => require("jest-plugin-fs/mock"));
jest.mock("child_process", () => {
  const cp = { spawn: jest.fn(() => ({ pid: 1, unref: jest.fn() })) };
  return cp;
});
jest.mock("ps-node", () => {
  const ps = {
    lookup: jest.fn()
  };
  return ps;
});

describe("InstanceProcess", () => {
  it("should be a function", () => {
    expect(InstanceProcess).toBeInstanceOf(Function);
  });

  describe("when not running", () => {
    const files = {
      "/instance.json": JSON.stringify({})
    };
    let instance;
    beforeEach(() => {
      fs.mock(files);
      instance = new InstanceProcess("/", new SettingsFile("/instance.json"));
    });
    afterEach(() => {
      fs.restore();
    });

    it("should be an instance of InstanceProcess", () => {
      expect(instance).toBeInstanceOf(InstanceProcess);
    });

    describe("getProcessId", () => {
      it("should return null", async () => {
        await expect(instance.getProcessId()).resolves.toBeFalsy();
      });
    });

    describe("isRunning", () => {
      it("should return false", async () => {
        await expect(instance.isRunning()).resolves.toBeFalsy();
      });
    });

    describe("launch", () => {
      it("should not throw an error", async () => {
        await expect(instance.launch()).resolves.toBeFalsy();
      });

      it("should attempt to spawn a process", async () => {
        await instance.launch();
        expect(require("child_process").spawn).toBeCalledWith(
          "java",
          ["-jar", "minecraft_server.jar", "-nogui"],
          {
            cwd: "/",
            detached: true,
            stdio: "ignore"
          }
        );
      });

      it("should write a process ID file", async () => {
        await instance.launch();
        expect(fs.files()["/instance.pid"]).toBe("1");
      });
    });

    describe("kill", () => {
      it("should throw an error", async () => {
        await expect(instance.kill()).rejects.toBeInstanceOf(Error);
      });
    });
  });
});
