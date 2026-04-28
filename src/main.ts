import { FreeAtHome, AddOn } from "@busch-jaeger/free-at-home";

/**
 * The published TypeScript declarations for @busch-jaeger/free-at-home do not
 * expose all runtime methods/events of virtual actuator channels in every
 * package version. The official example uses setAutoKeepAlive, setAutoConfirm
 * and on('isOnChanged'), so we keep the runtime API but type the channel more
 * loosely here to make the project compile across library versions.
 */
type VirtualSwitchChannel = {
  setAutoKeepAlive?: (enabled: boolean) => void;
  setAutoConfirm?: (enabled: boolean) => void;
  isAutoConfirm?: boolean;
  on?: (eventName: "isOnChanged", handler: (value: boolean) => void | Promise<void>) => void;
};

type CoffeeConfig = {
  esphomeHost?: string;
  switchSlug?: string;
};

const DEVICE_ID = "esphome-coffee-machine";
const DEVICE_NAME = "Koffiemachine";

const DEFAULT_ESPHOME_HOST = "koffiemachine.local";
const DEFAULT_SWITCH_SLUG = "koffiemachine_relay";

const freeAtHome = new FreeAtHome();
freeAtHome.activateSignalHandling();

let config: CoffeeConfig = {
  esphomeHost: process.env.ESPHOME_HOST ?? DEFAULT_ESPHOME_HOST,
  switchSlug: process.env.ESPHOME_SWITCH_SLUG ?? DEFAULT_SWITCH_SLUG,
};

function normalizeHost(host: string): string {
  const trimmed = host.trim().replace(/\/$/, "");

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `http://${trimmed}`;
}

async function callEspHomeSwitch(turnOn: boolean): Promise<void> {
  const host = normalizeHost(config.esphomeHost ?? DEFAULT_ESPHOME_HOST);
  const switchSlug = config.switchSlug ?? DEFAULT_SWITCH_SLUG;
  const action = turnOn ? "turn_on" : "turn_off";
  const url = `${host}/switch/${encodeURIComponent(switchSlug)}/${action}`;

  console.log(`Calling ESPHome endpoint: ${url}`);

  const response = await fetch(url, { method: "POST" });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `ESPHome request failed: ${response.status} ${response.statusText} ${body}`
    );
  }
}

function setupAddonConfiguration(): void {
  const metaData = AddOn.readMetaData();
  const addOn = new AddOn.AddOn(metaData.id);

  addOn.on("configurationChanged", (configuration: AddOn.Configuration) => {
    console.log("Addon configuration changed:", configuration);

    const defaultConfig = configuration.default as CoffeeConfig | undefined;

    config = {
      esphomeHost:
        defaultConfig?.esphomeHost ||
        process.env.ESPHOME_HOST ||
        DEFAULT_ESPHOME_HOST,
      switchSlug:
        defaultConfig?.switchSlug ||
        process.env.ESPHOME_SWITCH_SLUG ||
        DEFAULT_SWITCH_SLUG,
    };

    console.log("Active coffee addon config:", config);
  });

  addOn.connectToConfiguration();
}

async function main(): Promise<void> {
  setupAddonConfiguration();

  const coffeeSwitch = (await freeAtHome.createSwitchingActuatorDevice(
    DEVICE_ID,
    DEVICE_NAME
  )) as unknown as VirtualSwitchChannel;

  coffeeSwitch.setAutoKeepAlive?.(true);

  if (typeof coffeeSwitch.setAutoConfirm === "function") {
    coffeeSwitch.setAutoConfirm(true);
  } else {
    coffeeSwitch.isAutoConfirm = true;
  }

  if (typeof coffeeSwitch.on !== "function") {
    throw new Error(
      "The created free@home virtual switch does not expose an on('isOnChanged') event handler. Check the installed @busch-jaeger/free-at-home version."
    );
  }

  coffeeSwitch.on("isOnChanged", async (value: boolean) => {
    console.log(`free@home requested ${DEVICE_NAME}: ${value ? "ON" : "OFF"}`);

    try {
      await callEspHomeSwitch(value);
      console.log("ESPHome command succeeded");
    } catch (error) {
      console.error("ESPHome command failed", error);
    }
  });

  console.log(`${DEVICE_NAME} virtual switch is ready`);
}

main().catch((error) => {
  console.error("Fatal addon error", error);
  process.exit(1);
});
