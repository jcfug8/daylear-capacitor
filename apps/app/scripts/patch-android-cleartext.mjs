#!/usr/bin/env node
/**
 * Capacitor merges cleartext into the cordova-plugins manifest; some setups still
 * need it on the app manifest for fetch() to http://10.0.2.2:3000 (dev API).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const androidDir = resolve(appDir, "android");
const manifestPath = resolve(
  androidDir,
  "app/src/main/AndroidManifest.xml",
);
const xmlDir = resolve(androidDir, "app/src/main/res/xml");
const networkConfigPath = resolve(xmlDir, "network_security_config.xml");

if (!existsSync(manifestPath)) {
  process.exit(0);
}

const networkConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">10.0.2.2</domain>
    <domain includeSubdomains="true">localhost</domain>
    <domain includeSubdomains="true">127.0.0.1</domain>
  </domain-config>
</network-security-config>
`;

if (!existsSync(xmlDir)) {
  mkdirSync(xmlDir, { recursive: true });
}
writeFileSync(networkConfigPath, networkConfig);

let manifest = readFileSync(manifestPath, "utf8");

if (!manifest.includes("android:usesCleartextTraffic")) {
  manifest = manifest.replace(
    "<application",
    '<application\n        android:usesCleartextTraffic="true"',
  );
}

if (!manifest.includes("android:networkSecurityConfig")) {
  manifest = manifest.replace(
    "<application",
    '<application\n        android:networkSecurityConfig="@xml/network_security_config"',
  );
}

writeFileSync(manifestPath, manifest);

const cordovaManifest = resolve(
  androidDir,
  "capacitor-cordova-android-plugins/src/main/AndroidManifest.xml",
);
if (existsSync(cordovaManifest)) {
  let cordova = readFileSync(cordovaManifest, "utf8");
  if (!cordova.includes("android:usesCleartextTraffic")) {
    cordova = cordova.replace(
      "<application",
      '<application android:usesCleartextTraffic="true"',
    );
    writeFileSync(cordovaManifest, cordova);
  }
}

console.log("Patched Android manifest for local HTTP (cleartext) API access.");
