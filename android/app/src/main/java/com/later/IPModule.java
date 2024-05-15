package com.later;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiInfo;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;

public class IPModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "IPModule";

    public IPModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

   @ReactMethod
    public void getIPAddress(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            WifiManager wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
            if (wifiManager != null) {
                WifiInfo wifiInfo = wifiManager.getConnectionInfo();
                int ipAddress = wifiInfo.getIpAddress();
                String ip = String.format(
                    "%d.%d.%d.%d",
                    (ipAddress & 0xff),
                    (ipAddress >> 8 & 0xff),
                    (ipAddress >> 16 & 0xff),
                    (ipAddress >> 24 & 0xff)
                );
                WritableMap map = Arguments.createMap();
                map.putString("ipAddress", ip);
                promise.resolve(map);
            } else {
                promise.reject("ERROR", "WifiManager is null");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
} 