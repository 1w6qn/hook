import "frida-il2cpp-bridge"

var log = console.log

function NetworkHook(serverUrl: String) {
  log("Network hook started")
  Java.perform(function () {
    const sdk = Java.use("com.hypergryph.platform.hgsdk.contants.SDKConst$UrlInfo")
    sdk.getRemoteUrl.implementation = function () {
      log("[Java Layer]Changed Hypergryph SDK")
      return `http://${serverUrl}`
    }
    const sdk2 = Java.use("com.hypergryph.platform.hguseragreement.contans.SDKConst$UrlInfo")
    sdk2.getRemoteUrl.implementation = function () {
      log("[Java Layer]Changed Hypergryph user agreement")
      return `http://${serverUrl}`
    }
    
    /*
    const URL = Java.use("java.net.URL");
    URL.$init.overload('java.lang.String').implementation = function (urlStr:string) {
      log("[Java Layer]url:" + urlStr)
      return this.$init(urlStr);
    };
    */
  });
  Il2Cpp.perform(function(){
    const Networker = Il2Cpp.domain.assembly("Assembly-CSharp").image.class("Torappu.Network.Networker");
    const GetOverrideRouterUrl = Networker.method<Il2Cpp.String>("get_overrideRouterUrl");
    GetOverrideRouterUrl.implementation = function () :Il2Cpp.String{
      return Il2Cpp.string(`http://${serverUrl}/config/prod/official/network_config`);
    }
    
  })
}

function dump() {
  Il2Cpp.perform(() => {
    Il2Cpp.dump("dump.cs")
    log("[Il2Cpp Layer]Dump Finished")
  })
}
function SignHook() {
  Il2Cpp.perform(() => {
    const CryptUtils=Il2Cpp.domain.assembly("Assembly-CSharp").image.class("Torappu.CryptUtils");
    const VerifySignMD5RSA = CryptUtils.method<boolean>("VerifySignMD5RSA");
    //@ts-ignore
    VerifySignMD5RSA.implementation = function (a: Il2Cpp.String, b: Il2Cpp.String, c: Il2Cpp.String): boolean {
      log("[Il2Cpp Layer]Hooked VerifySignMD5RSA")
      return true
    };
  });
}
function Trace() {
  Il2Cpp.perform(() => {

  });
}

rpc.exports = {
  init(stage, parameters) {
    log("[inited]")
    SignHook()
    NetworkHook("192.168.0.6:8000")
  },
  dispose() {
    log('[dispose]');
  }
}
