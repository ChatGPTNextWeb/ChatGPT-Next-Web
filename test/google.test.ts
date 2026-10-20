import { dedupeGoogleApiVersion } from "../app/utils/google";

describe("dedupeGoogleApiVersion", () => {
  const chatPath = "models/gemini-2.5-flash:streamGenerateContent";

  test("keeps the default endpoint unchanged", () => {
    const url = `https://generativelanguage.googleapis.com/v1beta/${chatPath}`;
    expect(dedupeGoogleApiVersion(url)).toBe(url);
  });

  test("keeps the internal api route unchanged", () => {
    const url = `/api/google/v1beta/${chatPath}`;
    expect(dedupeGoogleApiVersion(url)).toBe(url);
  });

  test("keeps a proxy path that has no api version unchanged", () => {
    const url = `https://gateway.example.com/gemini/v1beta/${chatPath}`;
    expect(dedupeGoogleApiVersion(url)).toBe(url);
  });

  test("uses the api version of a custom endpoint", () => {
    expect(
      dedupeGoogleApiVersion(
        `https://generativelanguage.googleapis.com/v1/v1beta/${chatPath}`,
      ),
    ).toBe(`https://generativelanguage.googleapis.com/v1/${chatPath}`);
  });

  test("does not repeat an api version the endpoint already has", () => {
    expect(
      dedupeGoogleApiVersion(
        `https://generativelanguage.googleapis.com/v1beta/v1beta/${chatPath}`,
      ),
    ).toBe(`https://generativelanguage.googleapis.com/v1beta/${chatPath}`);
  });

  test("keeps a prerelease api version of a custom endpoint", () => {
    expect(
      dedupeGoogleApiVersion(
        `https://generativelanguage.googleapis.com/v1alpha/v1beta/${chatPath}`,
      ),
    ).toBe(`https://generativelanguage.googleapis.com/v1alpha/${chatPath}`);
  });

  test("does not read an api version out of the host name", () => {
    const url = `https://v1.example.com/v1beta/${chatPath}`;
    expect(dedupeGoogleApiVersion(url)).toBe(url);
  });

  test("does not read an api version out of a single label host", () => {
    const url = `https://v1/v1beta/${chatPath}`;
    expect(dedupeGoogleApiVersion(url)).toBe(url);
  });
});
