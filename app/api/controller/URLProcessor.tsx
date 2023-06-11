/** A class for processing URL based on the current working environment */
export default class URLProcessor {
  /** cached base path */
  private static basePathCache: string[] | null = null;
  /** public domain / IP address */
  static publicDomain: string = "3.145.18.130:5000";
  /** local IP address */
  static localIP: string = "localhost:5000";

  /** Get a URL hostname based on current working environment */
  public static getCurURLHost() {
    const winHostName = window.location.hostname;
    return winHostName.includes("localhost") ? this.localIP : this.publicDomain;
  }

  /** get the base path of current URL
   * @intdex define the index of base path after split('/')
   */
  public static getPathComponent(index = 1) {
    if (!this.basePathCache)
      this.basePathCache = window.location.pathname.split("/");
    return this.basePathCache[index];
  }
}
