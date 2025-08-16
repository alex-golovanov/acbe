/* global OnAuthRequiredDetails */
import ga from "ga";
import log from "log";
import storage from "storage";
import browserType from "../../general/helpers/browserType";
import throttledPingSmartSettingsServers from "../pingSmartSettings";

type AuthHistoryItem = {
  periodStart: number;
  authRequestsNum: integer;
  triedServersInLocation: string[];
};

const timeFrameMs /*: integer*/ = 10000;
const authRequestsLimit /*: integer*/ = browserType.isFirefox() ? 200 : 50; // increase limit for onAuthRequired cache requests
const serverAuthLimit /*: integer*/ = 10; // attempts per server before switching
const maxServersToTry /*: integer*/ = 3; // max servers to try in location before giving up

/** @function */
const makeHostDecision = (
  hostInfo: AuthHistoryItem | undefined,
  timestamp: number,
  host: string
): {
  breakAuthProccess: boolean;
  switchToNextServer: boolean;
  newHostInfo: AuthHistoryItem | undefined;
  logs: any[][];
} => {
  // No information
  if (!hostInfo || !hostInfo.periodStart || !hostInfo.authRequestsNum) {
    let object = {
      periodStart: timestamp,
      authRequestsNum: 1,
      triedServersInLocation: [],
    };

    return {
      breakAuthProccess: false,
      switchToNextServer: false,
      newHostInfo: object,
      logs: [["No host auth history. Create record: ", object]],
    };
  }

  hostInfo = Object.assign({}, hostInfo);

  let logs = [["Host history record already exists", hostInfo]];

  let { periodStart, triedServersInLocation } = hostInfo;

  // Timeframe expired
  if (timestamp - periodStart > timeFrameMs) {
    logs.push(["Time frame already finished. Create new row."]);

    return {
      breakAuthProccess: false,
      switchToNextServer: false,
      newHostInfo: {
        periodStart: timestamp,
        authRequestsNum: 1,
        triedServersInLocation: [],
      },
      logs,
    };
  }

  logs.push([
    "We are still in tracked time frame. Increase auth requests counter",
  ]);

  let newCount = hostInfo.authRequestsNum + 1;

  if (newCount < authRequestsLimit) {
    hostInfo.authRequestsNum++;

    // Check if we hit the per-server limit
    if (newCount > 0 && newCount % serverAuthLimit === 0) {
      // Add this server to tried list if not already there
      if (!triedServersInLocation.includes(host)) {
        triedServersInLocation.push(host);
        hostInfo.triedServersInLocation = triedServersInLocation;
      }

      // Check if we've tried enough servers in this location
      if (triedServersInLocation.length >= maxServersToTry) {
        logs.push([
          "Tried maximum servers in location. Breaking auth process.",
        ]);

        return {
          breakAuthProccess: true,
          switchToNextServer: false,
          newHostInfo: undefined,
          logs,
        };
      } else {
        logs.push([
          `Server limit (${serverAuthLimit}) reached for ${host}. Switching to next server. Tried servers: ${triedServersInLocation.length}/${maxServersToTry}`,
        ]);

        return {
          breakAuthProccess: false,
          switchToNextServer: true,
          newHostInfo: hostInfo,
          logs,
        };
      }
    }

    return {
      breakAuthProccess: false,
      switchToNextServer: false,
      newHostInfo: hostInfo,
      logs,
    };
  } else {
    logs.push(["Limit exceeded. Return true and clear host auth history"]);

    return {
      breakAuthProccess: true,
      switchToNextServer: false,
      newHostInfo: undefined,
      logs,
    };
  }
};

/** @function */
export default async ({
  challenger: { host },
  timeStamp: timestamp,
}: OnAuthRequiredDetails): Promise<{
  shouldBreak: boolean;
  shouldSwitchServer: boolean;
}> => {
  let authHistory: { [key: string]: AuthHistoryItem } =
    (await storage.get("authHistory")) || {};

  let { breakAuthProccess, switchToNextServer, newHostInfo, logs } =
    makeHostDecision(authHistory[host], timestamp, host);

  if (newHostInfo) {
    authHistory[host] = newHostInfo;

    if (newHostInfo.authRequestsNum === 10) {
      logs.push(["Ping SmartSettings servers after 10 auth requests"]);
      await throttledPingSmartSettingsServers();
    }
  } else {
    delete authHistory[host];
  }

  if (breakAuthProccess) {
    ga.partial({ category: "auth_request_limit_exceeded" });
  }

  logs.push(["Save auth history"]);

  log.group("Check if onAuthRequired limit - " + host, logs);

  storage.set("authHistory", authHistory);

  return {
    shouldBreak: breakAuthProccess,
    shouldSwitchServer: switchToNextServer,
  };
};
