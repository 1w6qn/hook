import "frida-il2cpp-bridge"
function log(data: string) {
  var Log = Java.use("android.util.Log");

  var TAG_L = "[FRIDA_SCRIPT]";

  Log.v(TAG_L, data);
}

function fuckACESDK() {
  Java.perform(function() {
    const MTPProxyApplication = Java.use('com.hg.sdk.MTPProxyApplication');
    MTPProxyApplication.onProxyCreate.implementation = () => {
      log(`[Java Layer] ACE already f**ked`)
    };
    const MTPDetection = Java.use('com.hg.sdk.MTPDetection');
    MTPDetection.onUserLogin.implementation = (a: Int64, b: Int64, c: String, d: String) => {
      log(`[Java Layer] ACE 过于饥渴，现在已经坏掉了`)
    };
  });
}
function changeUrl(serverUrl: String) {
  Java.perform(function() {
    var sdk = Java.use("com.hypergryph.platform.hgsdk.contants.SDKConst$UrlInfo")
    sdk.getRemoteUrl.implementation = function() {
      log("[Java Layer]Hooked HGSDK")
      return `http://${serverUrl}`
    }
    var URL = Java.use("java.net.URL");
    URL.$init.overload('java.lang.String').implementation = function(urlStr) {
      if (urlStr.match("https://ak-conf.hypergryph.com/config/prod/official/network_config")) {
        urlStr = `http://${serverUrl}/config/prod/official/network_config`
        log("[Java Layer]Successfully Change remote_config")
      }
      return this.$init(urlStr);
    };
  });
}
function confighook() {
  Il2Cpp.perform(() => {
    const get_configuration = Il2Cpp.domain.assembly("Assembly-CSharp").image.class("Torappu.Network.Networker")
      .method<Il2Cpp.Object>("get_configuration");
    get_configuration.implementation = function() {
      var conf = this.method<Il2Cpp.Object>("get_configuration").invoke();
      log(conf.field<Il2Cpp.String>("sdkServerUrl").toString());
      log("hooked config")
      return conf
    };
  });
}
function md5rsahook() {
  Il2Cpp.perform(() => {
    const VerifySignMD5RSA = Il2Cpp.domain.assembly("Assembly-CSharp").image.
      class("Torappu.CryptUtils").method<boolean>("VerifySignMD5RSA");
    VerifySignMD5RSA.implementation = function(a: Il2Cpp.String, b: Il2Cpp.String, c: Il2Cpp.String, d: Il2Cpp.String,): boolean {
      log("[Il2Cpp Layer]Hooked VerifySignMD5RSA")
      return true;
    };

  });
}
rpc.exports = {
  init(stage, parameters) {
    md5rsahook();
    changeUrl("192.168.0.7:8000");
    fuckACESDK();
  },
  dispose() {
    log('[dispose]');
  }
};
