import { describe, it, expect } from "vitest";
import { parseModelName } from "../model";

describe("parseModelName", () => {
  it('should parse a simple model name without "@"', () => {
    const result = parseModelName("simpleModel");
    expect(result).toEqual({
      customModelName: "simpleModel",
      customProviderName: "",
    });
  });

  it('should parse a model name with "@"', () => {
    const result = parseModelName("modelName@providerName");
    expect(result).toEqual({
      customModelName: "modelName",
      customProviderName: "providerName",
    });
  });

  it('should parse a quoted model name without "@"', () => {
    const result = parseModelName('"quotedModel"');
    expect(result).toEqual({
      customModelName: "quotedModel",
      customProviderName: "quotedModel",
    });
  });

  it('should parse a quoted model name with "@"', () => {
    const result = parseModelName('"quotedModel@providerName"');
    expect(result).toEqual({
      customModelName: "quotedModel@providerName",
      customProviderName: "quotedModel@providerName",
    });
  });

  it('should parse a model name with multiple "@" symbols', () => {
    const result = parseModelName("modelName@providerName@extra");
    expect(result).toEqual({
      customModelName: "modelName",
      customProviderName: "providerName@extra",
    });
  });

  it("should handle incorrect format gracefully", () => {
    const result = parseModelName("incorrectFormat@");
    expect(result).toEqual({
      customModelName: "incorrectFormat",
      customProviderName: "",
    });
  });
});
