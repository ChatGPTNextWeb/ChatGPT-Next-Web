declare let FB: any;

export function loadFacebookSDK() {
  window.fbAsyncInit = function () {
    FB.init({
      appId: "738205098381166",
      cookie: true,
      xfbml: true,
      version: "v19.0",
    });
  };

  (function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  })(document, "script", "facebook-jssdk");
}
