import os from "node:os";

export function getLanAddresses(): string[] {
  let interfaces: ReturnType<typeof os.networkInterfaces>;
  try {
    interfaces = os.networkInterfaces();
  } catch {
    return [];
  }
  const addresses: string[] = [];
  for (const iface of Object.values(interfaces)) {
    for (const config of iface ?? []) {
      if (config.family === "IPv4" && !config.internal) {
        addresses.push(config.address);
      }
    }
  }
  return [...new Set(addresses)];
}
