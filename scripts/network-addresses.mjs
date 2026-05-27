import os from "node:os";

/**
 * Non-loopback IPv4 addresses (Wi‑Fi, Ethernet, etc.) for LAN / device testing.
 */
export function getLanAddresses() {
  let interfaces;
  try {
    interfaces = os.networkInterfaces();
  } catch {
    return [];
  }
  const addresses = [];
  for (const iface of Object.values(interfaces)) {
    for (const config of iface ?? []) {
      if (config.family === "IPv4" && !config.internal) {
        addresses.push(config.address);
      }
    }
  }
  return [...new Set(addresses)];
}

export function getPrimaryLanAddress() {
  return getLanAddresses()[0] ?? null;
}
