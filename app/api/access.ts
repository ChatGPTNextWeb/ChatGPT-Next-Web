import md5 from "spark-md5";

export function getAccessCodes(): Set<string> {
  const code = process.env.CODE;

  try {
    const codes = (code?.split(",") ?? [])
      .filter((v) => !!v)
      .map((v) => md5.hash(v.trim()));
    return new Set(codes);
  } catch (e) {
    return new Set();
  }
}

export const ACCESS_CODES = getAccessCodes();
export const IS_IN_DOCKER = process.env.DOCKER;
