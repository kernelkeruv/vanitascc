"use strict";
// Browser-only, read-only, permission-scoped BLE GATT prototype. No telemetry.
(() => {
  const $ = id => document.getElementById(id);
  const ui = Object.fromEntries([
    "secure-status", "bluetooth-status", "device-status", "battery-status",
    "heart-status", "connect", "battery", "heart-start", "heart-stop",
    "disconnect", "audio-test", "events", "clear-events"
  ].map(id => [id, $(id)]));
  const services = Object.freeze({ battery: "battery_service", heart: "heart_rate" });
  let device = null;
  let server = null;
  let heartCharacteristic = null;
  let monitoring = false;
  let busy = false;
  let audioContext = null;

  function event(message) {
    // Only predefined human-readable events and sanitized error types, never device IDs.
    const at = new Date().toLocaleTimeString();
    const entry = document.createElement("div");
    entry.textContent = `${at}  ${message}`;
    if (ui.events.textContent.includes("Ready. No scan")) ui.events.textContent = "";
    ui.events.prepend(entry);
    while (ui.events.childElementCount > 40) ui.events.lastChild.remove();
  }
  function render() {
    const connected = Boolean(server && server.connected);
    const capable = Boolean(navigator.bluetooth && window.isSecureContext);
    ui.connect.disabled = !capable || connected || busy;
    ui.disconnect.disabled = !connected || busy;
    ui.battery.disabled = !connected || busy;
    ui["heart-start"].disabled = !connected || monitoring || busy;
    ui["heart-stop"].disabled = !connected || !monitoring || busy;
    ui["device-status"].textContent = connected ? "Connected (BLE)" : "Not connected";
  }
  function showError(action, err) {
    const type = err && typeof err.name === "string" ? err.name : "Error";
    // Avoid rendering arbitrary OS/device identifiers from error messages.
    event(`${action}: ${type}. Check permissions, pairing, and supported GATT services.`);
  }
  function disconnectHandler() {
    monitoring = false;
    heartCharacteristic = null;
    server = null;
    device = null;
    ui["heart-status"].textContent = "Not monitoring";
    ui["battery-status"].textContent = "Not read";
    event("BLE device disconnected.");
    render();
  }
  async function operation(action, fn) {
    if (busy) return;
    busy = true; render();
    try { await fn(); }
    catch(err) { showError(action, err); }
    finally { busy = false; render(); }
  }
  async function chooseDevice() {
    await operation("Connection", async () => {
      const chosen = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [services.battery, services.heart]
      });
      device = chosen;
      device.addEventListener("gattserverdisconnected", disconnectHandler, {once:true});
      server = await device.gatt.connect();
      event("Connected to user-selected BLE peripheral.");
    });
  }
  async function readBattery() {
    await operation("Battery", async () => {
      const svc = await server.getPrimaryService(services.battery);
      const chr = await svc.getCharacteristic("battery_level");
      const value = await chr.readValue();
      if (value.byteLength < 1) throw new RangeError("Battery value was empty");
      const level = value.getUint8(0);
      if (level > 100) throw new RangeError("Battery value was invalid");
      ui["battery-status"].textContent = `${level}%`;
      event("Battery level read from standard GATT service.");
    });
  }
  function heartValue(evt) {
    const view = evt.target.value;
    if (!view || view.byteLength < 2) return;
    const is16 = Boolean(view.getUint8(0) & 1);
    if (is16 && view.byteLength < 3) return;
    const bpm = is16 ? view.getUint16(1,true) : view.getUint8(1);
    ui["heart-status"].textContent = `${bpm} bpm (live)`;
  }
  async function startHeart() {
    await operation("Heart rate", async () => {
      const svc = await server.getPrimaryService(services.heart);
      heartCharacteristic = await svc.getCharacteristic("heart_rate_measurement");
      heartCharacteristic.addEventListener("characteristicvaluechanged", heartValue);
      try { await heartCharacteristic.startNotifications(); }
      catch(err) {
        heartCharacteristic.removeEventListener("characteristicvaluechanged", heartValue);
        heartCharacteristic = null;
        throw err;
      }
      monitoring = true;
      ui["heart-status"].textContent = "Waiting for measurement";
      event("Heart-rate notifications enabled at user's request.");
    });
  }
  async function stopHeart() {
    await operation("Stop heart rate", async () => {
      if (heartCharacteristic) {
        const previous = heartCharacteristic;
        heartCharacteristic = null;
        previous.removeEventListener("characteristicvaluechanged",heartValue);
        try { await previous.stopNotifications(); }
        finally { monitoring=false; }
      }
      ui["heart-status"].textContent = "Not monitoring";
      event("Heart-rate notifications stopped.");
    });
  }
  function disconnect() {
    if (device && device.gatt && device.gatt.connected) device.gatt.disconnect();
    else disconnectHandler();
  }
  async function playAudio() {
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) { event("Web Audio not supported in this browser."); return; }
      audioContext ??= new AudioCtor();
      await audioContext.resume();
      const osc = audioContext.createOscillator();
      const vol = audioContext.createGain();
      osc.frequency.value = 440;
      vol.gain.setValueAtTime(0.0001,audioContext.currentTime);
      vol.gain.exponentialRampToValueAtTime(0.025,audioContext.currentTime+0.04);
      vol.gain.exponentialRampToValueAtTime(0.0001,audioContext.currentTime+0.38);
      osc.connect(vol).connect(audioContext.destination);
      osc.start(); osc.stop(audioContext.currentTime+0.4);
      event("Short test tone played via OS-selected audio route.");
    } catch(err) { showError("Audio",err); }
  }
  ui["secure-status"].textContent = window.isSecureContext ? "Yes" : "No, use HTTPS or localhost";
  ui["bluetooth-status"].textContent = navigator.bluetooth ? "Available" : "Unsupported in this browser";
  ui.connect.addEventListener("click",chooseDevice);
  ui.battery.addEventListener("click",readBattery);
  ui["heart-start"].addEventListener("click",startHeart);
  ui["heart-stop"].addEventListener("click",stopHeart);
  ui.disconnect.addEventListener("click",disconnect);
  ui["audio-test"].addEventListener("click",playAudio);
  ui["clear-events"].addEventListener("click",() => {ui.events.textContent="Session log cleared.";});
  render();
})();
