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
function NetworkHook(serverUrl: String) {
  log("Network hook started")
  Java.perform(function () {
    const sdk = Java.use("com.hypergryph.platform.hgsdk.contants.SDKConst$UrlInfo")
    sdk.getRemoteUrl.implementation = function () {
      log("[Java Layer]Hooked HGSDK")
      return `http://${serverUrl}`
    }
    const URL = Java.use("java.net.URL");
    URL.$init.overload('java.lang.String').implementation = function (urlStr:string) {
      log("[Java Layer]url:" + urlStr)
      if(urlStr.match("anticheat")){
        urlStr="http://127.0.0.1"
      }
      return this.$init(urlStr);
    };
  });
  Il2Cpp.perform(function(){
    const Networker = Il2Cpp.domain.assembly("Assembly-CSharp").image.class("Torappu.Network.Networker");
    const GetOverrideRouterUrl = Networker.method<Il2Cpp.String>("get_overrideRouterUrl");
    GetOverrideRouterUrl.implementation = function () :Il2Cpp.String{
      return Il2Cpp.string(`http://${serverUrl}/config/prod/official/network_config`);
    }
    const SendGet = Networker.method<Il2Cpp.Object>("SendGet");
    //@ts-ignore
    SendGet.implementation = function (a: Il2Cpp.String, b: Il2Cpp.String) {
      log("[Il2Cpp Layer]Hooked SendGet Url:" + a + " Param:" + b)
      return this.method("SendGet").invoke(a, b);
    }
  })
}

function dump() {
  Il2Cpp.perform(() => {
    Il2Cpp.dump("dump.cs")
    log("[Il2Cpp Layer]Dump Finished")
  })
}
function md5rsahook() {
  Il2Cpp.perform(() => {
    const CryptUtils=Il2Cpp.domain.assembly("Assembly-CSharp").image.class("Torappu.CryptUtils");
    const VerifySignMD5RSA = CryptUtils.method<boolean>("VerifySignMD5RSA");
    const VerifySignMD5RSA2 = VerifySignMD5RSA.overload("System.Byte[]","System.Byte[]","System.String");
    //@ts-ignore
    VerifySignMD5RSA.implementation = function (a: Il2Cpp.String, b: Il2Cpp.String, c: Il2Cpp.String): boolean {
      log("[Il2Cpp Layer]Hooked VerifySignMD5RSA")
      if(a.toString().match("sign")){
        return true;
      }
      return CryptUtils.method<boolean>("VerifySignMD5RSA").invoke(a,b,c);
    };
    //@ts-ignore
    VerifySignMD5RSA2.implementation = function (a,b,c): boolean {
      log("[Il2Cpp Layer]Hooked VerifySignMD5RSA2")
      if(a.toString().match("sign")){
        return true;
      }
      return CryptUtils.method<boolean>("VerifySignMD5RSA")
        .overload("System.Byte[]","System.Byte[]","System.String").invoke(a,b,c);
    };
  });
}
function Trace() {
  Il2Cpp.perform(() => {
    const CryptUtils=Il2Cpp.domain.assembly("Assembly-CSharp").image.class("Torappu.CryptUtils");
    Il2Cpp.trace().classes(CryptUtils).and().attach()
    
    

  });
}

rpc.exports = {
  init(stage, parameters) {
    log("inited")
    md5rsahook()
    Trace()
    NetworkHook("192.168.0.6:8000")
    
  },
  dispose() {
    log('[dispose]');
  }
}
