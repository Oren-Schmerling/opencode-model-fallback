import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "../src/config/defaults.js";
import { mergeWithDefaults, parseConfig } from "../src/config/schema.js";

describe("retry/quarantine config", () => {
  it("defaults retriesBeforeFallback to 0", () => {
    expect(DEFAULT_CONFIG.defaults.retriesBeforeFallback).toBe(0);
    expect(mergeWithDefaults({}).defaults.retriesBeforeFallback).toBe(0);
  });

  it("defaults quarantineAfterFallbackMs to 0", () => {
    expect(DEFAULT_CONFIG.defaults.quarantineAfterFallbackMs).toBe(0);
    expect(mergeWithDefaults({}).defaults.quarantineAfterFallbackMs).toBe(0);
  });

  it("accepts retriesBeforeFallback within 0-10", () => {
    const { config, warnings } = parseConfig({
      defaults: { retriesBeforeFallback: 3 },
    });
    expect(warnings).toHaveLength(0);
    expect(config.defaults?.retriesBeforeFallback).toBe(3);
  });

  it("rejects retriesBeforeFallback below 0", () => {
    const { config, warnings } = parseConfig({ defaults: { retriesBeforeFallback: -1 } });
    expect(config.defaults?.retriesBeforeFallback).toBeUndefined();
    expect(warnings.some((w) => w.includes("defaults.retriesBeforeFallback"))).toBe(true);
  });

  it("rejects retriesBeforeFallback above 10", () => {
    const { config, warnings } = parseConfig({ defaults: { retriesBeforeFallback: 11 } });
    expect(config.defaults?.retriesBeforeFallback).toBeUndefined();
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("rejects non-integer retriesBeforeFallback", () => {
    const { config, warnings } = parseConfig({ defaults: { retriesBeforeFallback: 1.5 } });
    expect(config.defaults?.retriesBeforeFallback).toBeUndefined();
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("accepts quarantineAfterFallbackMs >= 0", () => {
    const { config, warnings } = parseConfig({
      defaults: { quarantineAfterFallbackMs: 21_600_000 },
    });
    expect(warnings).toHaveLength(0);
    expect(config.defaults?.quarantineAfterFallbackMs).toBe(21_600_000);
  });

  it("accepts quarantineAfterFallbackMs of 0", () => {
    const { config, warnings } = parseConfig({
      defaults: { quarantineAfterFallbackMs: 0 },
    });
    expect(warnings).toHaveLength(0);
    expect(config.defaults?.quarantineAfterFallbackMs).toBe(0);
  });

  it("rejects negative quarantineAfterFallbackMs", () => {
    const { config, warnings } = parseConfig({
      defaults: { quarantineAfterFallbackMs: -1 },
    });
    expect(config.defaults?.quarantineAfterFallbackMs).toBeUndefined();
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("merges explicit retry/quarantine values", () => {
    const result = mergeWithDefaults({
      defaults: { retriesBeforeFallback: 4, quarantineAfterFallbackMs: 1_000 },
    });
    expect(result.defaults.retriesBeforeFallback).toBe(4);
    expect(result.defaults.quarantineAfterFallbackMs).toBe(1_000);
  });
});