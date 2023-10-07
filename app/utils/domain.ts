export const domain = function (location: any) {
  const protocol = location.protocol,
    hostName = location.hostname,
    http = protocol == "http:" ? "http://" : "https://";
  // let url = http + "h5.scimall.org.cn";
  let url = http + "h5-test.scimall.org.cn";
  let ajaxUrl = http + "zt-test.scimall.org.cn";

  if (hostName.indexOf("kejie") > -1) {
    url = http + "h5.scimall.org.cn";
    ajaxUrl = http + "zt.scimall.org.cn";
  }
  return { url, ajaxUrl };
};
