import "frida-il2cpp-bridge"

var log = console.log

function fuckACESDK() {
  Java.perform(function () {
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
  Java.perform(function () {
    var sdk = Java.use("com.hypergryph.platform.hgsdk.contants.SDKConst$UrlInfo")
    sdk.getRemoteUrl.implementation = function () {
      log("[Java Layer]Hooked HGSDK")
      return `http://${serverUrl}`
    }
    var URL = Java.use("java.net.URL");
    URL.$init.overload('java.lang.String').implementation = function (urlStr) {
      log("[Java Layer]url:" + urlStr)
      return this.$init(urlStr);
    };
  });
}
function confighook() {
  Il2Cpp.perform(() => {
    const Assembly_CSharp = Il2Cpp.domain.assembly("Assembly-CSharp")
    const c = Assembly_CSharp.image.class("Torappu.SDK.U8ExternalTools.InitExtConfig.NetworkOptions")
      .method(".ctor")
    // detailed trace, it traces method calls and returns and it reports every parameter
    c.implementation = function () {
      var conf = this.method<Il2Cpp.Object>(".ctor").invoke();
      //@ts-ignore
      //conf.field("sdkServerUrl").value = "http://192.168.0.7:8000/";//@ts-ignore
      //conf.field("gameServerUrl").value = "http://192.168.0.7:8000/";//@ts-ignore
      //conf.field("u8ServerUrl").value = "http://192.168.0.7:8000/";
      log(conf.toString())
      log("hooked config")
      return conf
    };
  });
  /*
  
  */
}
function dump() {
  Il2Cpp.perform(() => {
    Il2Cpp.dump("dump.cs")
    log("[Il2Cpp Layer]Dump Finished")
  })
}
function md5rsahook() {
  Il2Cpp.perform(() => {
    const VerifySignMD5RSA = Il2Cpp.domain.assembly("Assembly-CSharp").image.
      class("Torappu.CryptUtils").method<boolean>("VerifySignMD5RSA");
    //@ts-ignore
    VerifySignMD5RSA.implementation = function (a: Il2Cpp.String, b: Il2Cpp.String, c: Il2Cpp.String): boolean {
      log("[Il2Cpp Layer]Hooked VerifySignMD5RSA")
      return true;
    };

  });
}
function test() {
  Il2Cpp.perform(() => {
    log("[Il2Cpp Layer]Trace started")
    const Networker = Il2Cpp.domain.assembly("Assembly-CSharp").image
      .class("Torappu.Network.Networker");
    const SendGet = Networker.method<Il2Cpp.Object>("SendGet");

    //@ts-ignore
    SendGet.implementation = function (a: Il2Cpp.String, b: Il2Cpp.String) {
      log("[Il2Cpp Layer]Hooked SendGet")
      log("[Il2Cpp Layer]Hooked SendGet Url:" + a + " Param:" + b)
      return this.method("SendGet").invoke(a, b);
    }
    const GetOverrideRouterUrl = Networker.method<Il2Cpp.String>("get_overrideRouterUrl");
    GetOverrideRouterUrl.implementation = function () :Il2Cpp.String{
      return Il2Cpp.string("http://192.168.0.6:8000/config/prod/official/network_config");
    }
    Il2Cpp.trace().classes(Networker).and().attach();

  });
}

rpc.exports = {
  init(stage, parameters) {
    log("inited")
    test()
    
  },
  dispose() {
    log('[dispose]');
  }
}
