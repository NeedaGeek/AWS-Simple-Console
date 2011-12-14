function encodeJSONMap(map)
{
    var pairs = new Array();
    for (k in map) {
        if (map.hasOwnProperty(k)) {
            var v = map[k];
            if (v != null) {
                if (typeof v === 'object') {
                    pairs.push("'" + k + "':" + encodeJSONMap(v));
                } else
                    if (typeof v != 'function') {
                        pairs.push("'" + k + "':'" + v + "'");
                    }
            }
        }
    }
    return "({" + pairs.join(',') + "})";
}

function WrappedMapTags(map, prefs)
{
    var wmap = new WrappedMap(map);
    wmap.prefs = prefs;

    wmap.put = function(key, value, method)
    {
        this.map[key] = value;
        eval("this.prefs." + method + "(this)");
    };

    wmap.removeKey = function(key, method)
    {
        this.map[key] = null;
        eval("this.prefs." + method + "(this)");
    };

    return wmap;
}

function WrappedMapAccounts(map, prefs)
{
    var wmap = new WrappedMap(map);
    wmap.prefs = prefs;
    // Since this object is not yet formed, you need to pass
    // wmap to the prefs so wmap the map can be written out
    // to the preferences store.
    prefs.setAccountIdMap(wmap);

    wmap.put = function(key, value)
    {
        this.map[key] = value;
        this.prefs.setAccountIdMap(this);
    };

    wmap.removeKey = function(key)
    {
        this.map[key] = null;
        this.prefs.setAccountIdMap(this);
    };

    return wmap;
}

function WrappedMapEndpoints(map, prefs)
{
    var wmap = new WrappedMap(map);
    wmap.prefs = prefs;
    // Since this object is not yet formed, you need to pass
    // wmap to the prefs so wmap the map can be written out
    // to the preferences store.
    prefs.setEndpointMap(wmap);

    wmap.put = function(key, value)
    {
        this.map[key] = value;
        this.prefs.setEndpointMap(this);
    };

    wmap.removeKey = function(key)
    {
        this.map[key] = null;
        this.prefs.setEndpointMap(this);
    };

    return wmap;
}

function WrappedMap(map)
{
    this.map = map;

    this.get = function(key)
    {
        return this.map[key];
    };

    this.put = function(key, value)
    {
        this.map[key] = value;
    };

    this.removeKey = function(key)
    {
        this.map[key] = null;
    };

    this.toArray = function(block)
    {
        var list = null;
        if (block) {
            list = new Array();
        } else {
            list = {};
        }
        var keys = this.keys();
        var key = "";
        var v = null;
        for ( var i in keys) {
            key = keys[i];
            v = this.map[key];
            if (block) {
                list.push(block(key, v));
            } else {
                list[key] = v;
            }
        }
        return list;
    };

    this.keys = function()
    {
        var list = new Array();
        var v = null;
        for (k in this.map) {
            if (this.map.hasOwnProperty(k) && typeof this.map[k] != "function") {
                v = this.map[k];
                if (v != null) {
                    list.push(k);
                }
            }
        }
        return list;
    };

    this.toJSONString = function()
    {
        return encodeJSONMap(this.map);
    };

    return this;
};

var ec2ui_prefs = {
    ACTIVE_USER_NAME : "ec2ui.active.credentials.name",
    ACTIVE_ENDPOINT : "ec2ui.active.endpoint",
    RDP_COMMAND : "ec2ui.tools.rdp.command",
    RDP_ARGS : "ec2ui.tools.rdp.args",
    SSH_COMMAND : "ec2ui.tools.ssh.command",
    SSH_ARGS : "ec2ui.tools.ssh.args",
    SSH_USER : "ec2ui.tools.ssh.user",
    DEBUG_ENABLED : "ec2ui.debugging.enabled",
    OFFLINE : "ec2ui.offline.enabled",
    QUERY_ON_START : "ec2ui.queryonstart.enabled",
    REFRESH_ON_CHANGE : "ec2ui.refreshonchange.enabled",
    REFRESH_BUNDLE_VIEW : "ec2ui.refreshBundleView.enabled",
    AUTOFETCH_LP : "ec2ui.autofetchlaunchpermissions.enabled",
    OPEN_IN_NEW_TAB : "ec2ui.usenewtab.enabled",
    EC2_URL : "ec2ui.url",
    CURRENT_TAB : "ec2ui.current.tab",
    REQUEST_TIMEOUT : "ec2ui.timeout.request",
    KNOWN_ACCOUNT_IDS : "ec2ui.known.account.ids",
    LAST_EC2_PKEY_FILE : "ec2ui.last.ec2privatekey.file",
    ENDPOINTS : "ec2ui.endpoints",
    IMAGE_TAGS : "ec2ui.imagetags",
    EIP_TAGS : "ec2ui.eiptags",
    INSTANCE_TAGS : "ec2ui.instancetags",
    VOLUME_TAGS : "ec2ui.volumetags",
    SNAPSHOT_TAGS : "ec2ui.snapshotTags",
    VPC_TAGS : "ec2ui.vpcTags",
    SUBNET_TAGS : "ec2ui.subnetTags",
    VGW_TAGS : "ec2ui.vgwTags",
    VPN_TAGS : "ec2ui.vpnTags",
    CGW_TAGS : "ec2ui.cgwTags",
    DHCP_OPTIONS_TAGS : "ec2ui.dhcpOptionsTags",
    CONCURRENT_S3_CONN : "ec2ui.concurrent.S3.conns",
    PROMPT_OPEN_PORT : "ec2ui.prompt.open.port",
    OPEN_CONNECTION_PORT : "ec2ui.open.connection.port",
    OPENSSL_COMMAND : "ec2ui.tools.openssl.command",
    AMI_FAVORITES: "ec2ui.ami.favorites",
    endpoints : null,

    prefs : null,

    init : function()
    {
        if (this.prefs == null) {
            this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
            this.setQueryOnStartEnabled(this.isQueryOnStartEnabled());
            this.setRefreshOnChangeEnabled(this.isRefreshOnChangeEnabled());
            this.setRefreshBundleViewEnabled(this.isRefreshBundleViewEnabled());
            this.setLastUsedAccount(this.getLastUsedAccount());
            this.setLastUsedEndpoint(this.getLastUsedEndpoint());
            this.setRDPCommand(this.getRDPCommand());
            this.setRDPArgs(this.getRDPArgs());
            this.setRequestTimeout(this.getRequestTimeout());
            this.setServiceURL(this.getServiceURL());
            this.setCurrentTab(this.getCurrentTab());
            this.setDebugEnabled(this.isDebugEnabled());
            this.setOfflineEnabled(this.isOfflineEnabled());
            this.setOpenInNewTabEnabled(this.isOpenInNewTabEnabled());
            this.setAutoFetchLaunchPermissionsEnabled(this.isAutoFetchLaunchPermissionsEnabled());
            this.setAccountIdMap(this.getAccountIdMap());
            this.setLastEC2PKeyFile(this.getLastEC2PKeyFile());
            this.setInstanceTags(this.getInstanceTags());
            this.setVolumeTags(this.getVolumeTags());
            this.setSnapshotTags(this.getSnapshotTags());
            this.setVpcTags(this.getVpcTags());
            this.setSubnetTags(this.getSubnetTags());
            this.setDhcpOptionsTags(this.getDhcpOptionsTags());
            this.setVpnGatewayTags(this.getVpnGatewayTags());
            this.setCustomerGatewayTags(this.getCustomerGatewayTags());
            this.setVpnConnectionTags(this.getVpnConnectionTags());
            this.setConcurrentS3Conns(this.getConcurrentS3Conns());
            this.setPromptForPortOpening(this.getPromptForPortOpening());
            this.setOpenConnectionPort(this.getOpenConnectionPort());
        }
        DirIO.create(DirIO.open(this.getHome() + DirIO.sep + this.getAppName()))
    },

    setLastUsedAccount : function(value)
    {
        this.setStringPreference(this.ACTIVE_USER_NAME, value);
    },
    setRDPCommand : function(value)
    {
        this.setStringPreference(this.RDP_COMMAND, value);
    },
    setRDPArgs : function(value)
    {
        this.setStringPreference(this.RDP_ARGS, value);
    },
    setSSHCommand : function(value)
    {
        this.setStringPreference(this.SSH_COMMAND, value);
    },
    setSSHArgs : function(value)
    {
        this.setStringPreference(this.SSH_ARGS, value);
    },
    setSSHUser : function(value)
    {
        this.setStringPreference(this.SSH_USER, value);
    },
    setRequestTimeout : function(value)
    {
        this.setIntPreference(this.REQUEST_TIMEOUT, value);
    },
    setServiceURL : function(value)
    {
        this.setStringPreference(this.EC2_URL, value);
    },
    setCurrentTab : function(value)
    {
        this.setIntPreference(this.CURRENT_TAB, value);
    },
    setDebugEnabled : function(enabled)
    {
        this.setBoolPreference(this.DEBUG_ENABLED, enabled);
    },
    setOfflineEnabled : function(enabled)
    {
        this.setBoolPreference(this.OFFLINE, enabled);
    },
    setOpenInNewTabEnabled : function(enabled)
    {
        this.setBoolPreference(this.OPEN_IN_NEW_TAB, enabled);
    },
    setQueryOnStartEnabled : function(enabled)
    {
        this.setBoolPreference(this.QUERY_ON_START, enabled);
    },
    setRefreshOnChangeEnabled : function(enabled)
    {
        this.setBoolPreference(this.REFRESH_ON_CHANGE, enabled);
    },
    setRefreshBundleViewEnabled : function(enabled)
    {
        this.setBoolPreference(this.REFRESH_BUNDLE_VIEW, enabled);
    },
    setAutoFetchLaunchPermissionsEnabled : function(enabled)
    {
        this.setBoolPreference(this.AUTOFETCH_LP, enabled);
    },
    setLastEC2PKeyFile : function(value)
    {
        this.setEC2PKeyForUser(value, this.getLastUsedAccount());
    },
    setConcurrentS3Conns : function(value)
    {
        this.setIntPreference(this.CONCURRENT_S3_CONN, value);
    },
    setOpenConnectionPort : function(value)
    {
        this.setBoolPreference(this.OPEN_CONNECTION_PORT, value);
    },
    setPromptForPortOpening : function(value)
    {
        this.setBoolPreference(this.PROMPT_OPEN_PORT, value);
    },
    setOpenSSLCommand : function(value)
    {
        this.setStringPreference(this.OPENSSL_COMMAND, value);
    },

    getDirSeparator : function()
    {
        return navigator.platform.toLowerCase().indexOf('win') > -1 ? '\\' : '/';
    },
    getAppName : function()
    {
        return ec2ui_client.getAppName();
    },
    getAppPath : function()
    {
        return DirIO.get("CurProcD").path;
    },
    getUserHome : function()
    {
        return DirIO.get("Home").path;
    },
    getLastUsedAccount : function()
    {
        return this.getStringPreference(this.ACTIVE_USER_NAME, "");
    },
    getRDPCommand : function()
    {
        return this.getStringPreference(this.RDP_COMMAND, this.getDefaultRDPCommandArgs()[0]);
    },
    getRDPArgs : function()
    {
        return this.getStringPreference(this.RDP_ARGS, this.getDefaultRDPCommandArgs()[1]);
    },
    getSSHCommand : function()
    {
        return this.getStringPreference(this.SSH_COMMAND, this.getDefaultSSHCommandArgs()[0]);
    },
    getSSHArgs : function()
    {
        return this.getStringPreference(this.SSH_ARGS, this.getDefaultSSHCommandArgs()[1]);
    },
    getSSHUser : function()
    {
        return this.getStringPreference(this.SSH_USER, "root");
    },
    getRequestTimeout : function()
    {
        return this.getIntPreference(this.REQUEST_TIMEOUT, 15000);
    },
    getServiceURL : function()
    {
        return this.getStringPreference(this.EC2_URL, "https://ec2.us-east-1.amazonaws.com");
    },
    getCurrentTab : function()
    {
        return this.getIntPreference(this.CURRENT_TAB, 0);
    },
    getLastEC2PKeyFile : function()
    {
        return this.getEC2PKeyForUser(this.getLastUsedAccount());
    },
    isDebugEnabled : function()
    {
        return this.getBoolPreference(this.DEBUG_ENABLED, false);
    },
    isOfflineEnabled : function()
    {
        return this.getBoolPreference(this.OFFLINE, false);
    },
    isOpenInNewTabEnabled : function()
    {
        return this.getBoolPreference(this.OPEN_IN_NEW_TAB, true);
    },
    isQueryOnStartEnabled : function()
    {
        return this.getBoolPreference(this.QUERY_ON_START, true);
    },
    isRefreshOnChangeEnabled : function()
    {
        return this.getBoolPreference(this.REFRESH_ON_CHANGE, true);
    },
    isRefreshBundleViewEnabled : function()
    {
        return this.getBoolPreference(this.REFRESH_BUNDLE_VIEW, true);
    },
    isAutoFetchLaunchPermissionsEnabled : function()
    {
        return this.getBoolPreference(this.AUTOFETCH_LP, false);
    },
    getConcurrentS3Conns : function()
    {
        return this.getIntPreference(this.CONCURRENT_S3_CONN, 32);
    },
    getOpenConnectionPort : function()
    {
        return this.getBoolPreference(this.OPEN_CONNECTION_PORT, true);
    },
    getPromptForPortOpening : function()
    {
        return this.getBoolPreference(this.PROMPT_OPEN_PORT, true);
    },
    getOpenSSLCommand : function()
    {
        return this.getStringPreference(this.OPENSSL_COMMAND, this.getDefaultOpenSSLCommand());
    },

    // default helpers
    getPrefForUserInRegion : function(pref, dflt)
    {
        var orig = this.getStringPreference(pref, dflt);
        pref = pref + "." + this.getLastUsedAccount() + ".";
        // Get the current endpoint
        pref = pref + this.getLastUsedEndpoint();

        return this.getStringPreference(pref, orig);
    },

    // get a [cmd, argument-string] pair
    getDefaultRDPCommandArgs : function()
    {
        var rdesktopargs = "-g 1440x900 -u administrator -p ${pass} -x l ${host}"

        if (isMacOS(navigator.platform)) {
            if (FileIO.exists("/Applications/Remote Desktop Connection.app")) {
                return [ "/Applications/Remote Desktop Connection.app/Contents/MacOS/Remote Desktop Connection", "${host}" ];
            } else
                if (FileIO.exists("/opt/local/bin/rdesktop")) {
                    return [ "/opt/local/bin/rdesktop", rdesktopargs ]
                }
        } else

            if (isWindows(navigator.platform)) {
                return [ "c:\\Windows\\System32\\mstsc.exe", '/v ${host}' ];
            }

        return [ "/usr/bin/rdesktop", rdesktopargs ];
    },

    // get a [cmd, argument-string] pair
    getDefaultSSHCommandArgs : function()
    {
        var args = " -i ${key} ${login}@${host}"

        if (isMacOS(navigator.platform)) {
            var cmdline = [
                    'on run argv',
                    '  tell app "System Events" to set termOn to (exists process "Terminal")',
                    '  set cmd to "ssh ' + args + '"',
                    '  if (termOn) then',
                    '    tell app "Terminal" to do script cmd',
                    '  else',
                    '    tell app "Terminal" to do script cmd in front window',
                    '  end if',
                    '  tell app "Terminal" to activate',
                    'end run'];
                // turn into -e 'line1' -e 'line2' etc.
            cmdline = cmdline.map(function(s) { return "-e '" + s.replace(/^\s+/, '') + "'" }).join(" ");

            return ["/usr/bin/osascript", cmdline];
        } else

        if (isWindows(navigator.platform)) {
            cmd = this.getAppPath() + '\\ssh.exe'
            if (FileIO.exists(cmd)) {
                cmd = '"set CYGWIN=nodosfilewarning&&set HOME=' + this.getHome().replace(/\s/g, "\\ ") + '&&' + cmd + args + '"'
                return [ 'c:\\\Windows\\System32\\cmd.exe', '/K ' + cmd ]
            }

            cmd = this.getAppPath() + '"\\putty.exe'
            if (FileIO.exists(cmd)) {
                return [ cmd, args ]
            }
            return [ "", args ];
        }

        return [ '"/usr/bin/xterm', '-e /usr/bin/ssh ' + args ];
    },

    getDefaultOpenSSLCommand : function()
    {
        var cmd = "/usr/bin/openssl"

        if (isWindows(navigator.platform)) {
            cmd = this.getAppPath() + "\\openssl.exe"
            if (FileIO.exists(cmd)) {
                return cmd
            }
        }
        return cmd;
    },

    getPrivateKeyFile : function(name)
    {
        return this.getTemplateProcessed("${home}" + this.getDirSeparator() + this.getAppName() + this.getDirSeparator() + "PrivateKey_${keyname}.pem", [ [ "keyname", sanitize(name ? name : this.getLastUsedAccount()) ] ]);
    },

    getPublicKeyFile : function(name)
    {
        return this.getTemplateProcessed("${home}" + this.getDirSeparator() + this.getAppName() + this.getDirSeparator() + "PublicKey_${keyname}.pem", [ [ "keyname", sanitize(name ? name : this.getLastUsedAccount()) ] ]);
    },

    getCertificateFile : function(name)
    {
        return this.getTemplateProcessed("${home}" + this.getDirSeparator() + this.getAppName() + this.getDirSeparator() + "X509Certificate_${keyname}.pem", [ [ "keyname", sanitize(name ? name : this.getLastUsedAccount()) ] ]);
    },

    getTemplateProcessed : function(file, args)
    {
        var keyname = null
        // Custom variables
        for ( var i = 0; args && i < args.length; i++) {
            var val = args[i][1]
            if (file.indexOf("${" + args[i][0] + "}") > -1) {
                file = file.replace(new RegExp("\\${" + args[i][0] + "}", "g"), val);
            }
            switch (args[i][0]) {
            case "keyname":
                keyname = val
                break;
            }
        }
        // Global variables
        if (file.indexOf("${login}") > -1) {
            file = file.replace(/\${login}/g, this.getSSHUser());
        }
        if (file.indexOf("${home}") > -1) {
            var home = this.getHome()
            file = file.replace(/\${home}/g, isWindows(navigator.platform) ? home.replace(/\s/g, "\\ ") : home);
        }
        if (file.indexOf("${user}") > -1) {
            file = file.replace(/\${user}/g, this.getLastUsedAccount());
        }
        if (file.indexOf("${key}") > -1) {
            file = file.replace(/\${key}/g, this.getPrivateKeyFile(keyname));
        }
        return file
    },

    getEmptyWrappedMap : function()
    {
        return new WrappedMap({});
    },

    getEmptyTagMap : function()
    {
        return new WrappedMapTags({}, this);
    },

    getEC2PKeyForUser : function(user)
    {
        var pref = this.LAST_EC2_PKEY_FILE + "." + user;
        var orig = this.getStringPreference(pref, "");
        pref = +"." + this.getLastUsedEndpoint();
        return this.getStringPreference(pref, orig);
    },

    setEC2PKeyForUser : function(value, user)
    {
        var pref = this.LAST_EC2_PKEY_FILE + "." + user + "." + this.getLastUsedEndpoint();
        var orig = this.setStringPreference(pref, value);
    },

    getHome : function()
    {
        var home = "";
        var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);
        if (isWindows(navigator.platform)) {
            if (env.exists("HOMEDRIVE") && env.exists("HOMEPATH")) {
                home = env.get("HOMEDRIVE") + env.get("HOMEPATH");
            }
        }
        if (home == "" && env.exists('HOME')) {
            home = env.get("HOME");
        }
        return home
    },

    getEnv : function(name)
    {
        var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);
        if (env.exists(name)) {
            return env.get(name);
        }
        return ""
    },

    setEnv : function(name, value)
    {
        var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);
        env.set(name, value);
    },

    // These ones manage a pseudo-complex pref. This preference is a JSON encoded JavaScript "map" mapping account IDs to friendly names.
    setAccountIdMap : function(value)
    {
        this.setStringPreference(this.KNOWN_ACCOUNT_IDS, value.toJSONString());
    },

    getAccountIdMap : function()
    {
        var packedMap = this.getStringPreference(this.KNOWN_ACCOUNT_IDS, null);
        var unpackedMap = {};
        if (packedMap != null) {
            // Unpack the map and return it
            unpackedMap = eval(packedMap);
        }

        return new WrappedMapAccounts(unpackedMap, this);
    },

    getEC2Endpoints : function()
    {
        var me = this;
        var wrap = function(regionMap)
        {
            log("Endpoints callback");
            me.endpoints = regionMap;
        }
        ec2ui_session.controller.describeRegions(wrap);
    },

    // These ones manage a pseudo-complex pref. This preference is a JSON
    // encoded JavaScript "map" mapping endpoints to friendly names.
    setEndpointMap : function(value)
    {
        this.setStringPreference(this.ENDPOINTS, value.toJSONString());
    },

    getEndpointMap : function()
    {
        var packedMap = this.getStringPreference(this.ENDPOINTS, null);

        // Default regions
        var endpointmap = new Object();
        endpointmap['us-east-1'] = new Endpoint('us-east-1', 'https://ec2.us-east-1.amazonaws.com');
        endpointmap['eu-west-1'] = new Endpoint('eu-west-1', 'https://ec2.eu-west-1.amazonaws.com');
        endpointmap['us-west-1'] = new Endpoint('us-west-1', 'https://ec2.us-west-1.amazonaws.com');
        endpointmap['ap-southeast-1'] = new Endpoint('ap-southeast-1', 'https://ec2.ap-southeast-1.amazonaws.com');
        endpointmap['ap-northeast-1'] = new Endpoint('ap-northeast-1', 'https://ec2.ap-northeast-1.amazonaws.com');
        endpointmap['us-gov-west-1'] = new Endpoint('us-gov-west-1', 'https://ec2.us-gov-west-1.amazonaws.com');

        if (packedMap != null && packedMap.length > 0) {
            var map = eval(packedMap);
            for (k in map) {
                if (map.hasOwnProperty(k)) {
                    var v = map[k];
                    if (v != null && endpointmap[k] == null) {
                        endpointmap[k] = v;
                    }
                }
            }
        }

        log("Retrieve endpoints from service");
        this.getEC2Endpoints();

        // Reconcile the endpointmap with the map retrieved from EC2
        var map = this.endpoints;
        for (k in map) {
            if (map.hasOwnProperty(k)) {
                var v = map[k];
                if (v != null && endpointmap[k] == null) {
                    endpointmap[k] = v;
                }
            }
        }

        return new WrappedMapEndpoints(endpointmap, this);
    },

    setEIPTags : function(value)
    {
        this.setTags(this.EIP_TAGS, value);
    },

    setImageTags : function(value)
    {
        this.setTags(this.IMAGE_TAGS, value);
    },

    setInstanceTags : function(value)
    {
        this.setTags(this.INSTANCE_TAGS, value);
    },

    setVolumeTags : function(value)
    {
        this.setTags(this.VOLUME_TAGS, value);
    },

    setSnapshotTags : function(value)
    {
        this.setTags(this.SNAPSHOT_TAGS, value);
    },

    setVpcTags : function(value)
    {
        this.setTags(this.VPC_TAGS, value);
    },

    setSubnetTags : function(value)
    {
        this.setTags(this.SUBNET_TAGS, value);
    },

    setDhcpOptionsTags : function(value)
    {
        this.setTags(this.DHCP_OPTIONS_TAGS, value);
    },

    setVpnGatewayTags : function(value)
    {
        this.setTags(this.VGW_TAGS, value);
    },

    setCustomerGatewayTags : function(value)
    {
        this.setTags(this.CGW_TAGS, value);
    },

    setVpnConnectionTags : function(value)
    {
        this.setTags(this.VPN_TAGS, value);
    },

    setTags : function(pref, value)
    {
        pref = pref + "." + this.getLastUsedAccount();
        // Get the current endpoint
        pref = pref + "." + this.getLastUsedEndpoint();

        this.setStringPreference(pref, value.toJSONString());
    },

    getEIPTags : function()
    {
        return this.getTags(this.EIP_TAGS);
    },

    getImageTags : function()
    {
        return this.getTags(this.IMAGE_TAGS);
    },

    getInstanceTags : function()
    {
        return this.getTags(this.INSTANCE_TAGS);
    },

    getVolumeTags : function()
    {
        return this.getTags(this.VOLUME_TAGS);
    },

    getSnapshotTags : function()
    {
        return this.getTags(this.SNAPSHOT_TAGS);
    },

    getVpcTags : function()
    {
        return this.getTags(this.VPC_TAGS);
    },

    getSubnetTags : function()
    {
        return this.getTags(this.SUBNET_TAGS);
    },

    getDhcpOptionsTags : function()
    {
        return this.getTags(this.DHCP_OPTIONS_TAGS);
    },

    getVpnGatewayTags : function()
    {
        return this.getTags(this.VGW_TAGS);
    },

    getCustomerGatewayTags : function()
    {
        return this.getTags(this.CGW_TAGS);
    },

    getVpnConnectionTags : function()
    {
        return this.getTags(this.VPN_TAGS);
    },

    getTags : function(pref)
    {
        var orig = this.getStringPreference(pref, null);
        pref = pref + "." + this.getLastUsedAccount();
        // Get the current endpoint
        pref = pref + "." + this.getLastUsedEndpoint();

        var packedMap = this.getStringPreference(pref, orig);
        var unpackedMap = {};
        if (packedMap != null) {
            // Unpack the map and return it
            unpackedMap = eval(packedMap);
        }

        return new WrappedMapTags(unpackedMap, this);
    },

    setLastUsedEndpoint : function(value)
    {
        this.setStringPreference(this.ACTIVE_ENDPOINT, value);
    },

    getLastUsedEndpoint : function()
    {
        return this.getStringPreference(this.ACTIVE_ENDPOINT, "us-east-1");
    },

    getStringPreference : function(name, defValue)
    {
        if (this.prefs) {
            if (!this.prefs.prefHasUserValue(name)) {
                return defValue;
            }
            if (this.prefs.getPrefType(name) != this.prefs.PREF_STRING) {
                return defValue;
            }

            var prefValue = this.prefs.getCharPref(name).toString();
            if (prefValue.length == 0) {
                prefValue = defValue;
            }

            return prefValue;
        }

        return defValue;
    },

    getIntPreference : function(name, defValue)
    {
        if (this.prefs) {
            if (!this.prefs.prefHasUserValue(name)) {
                return defValue;
            }
            if (this.prefs.getPrefType(name) != this.prefs.PREF_INT) {
                return defValue;
            }

            return this.prefs.getIntPref(name);
        }

        return defValue;
    },

    getBoolPreference : function(name, defValue)
    {
        if (this.prefs) {
            if (!this.prefs.prefHasUserValue(name)) {
                return defValue;
            }
            if (this.prefs.getPrefType(name) != this.prefs.PREF_BOOL) {
                return defValue;
            }

            return this.prefs.getBoolPref(name);
        }
        return defValue;
    },

    setStringPreference : function(name, value)
    {
        this.prefs.setCharPref(name, value);
    },

    setIntPreference : function(name, value)
    {
        this.prefs.setIntPref(name, value);
    },

    setBoolPreference : function(name, value)
    {
        this.prefs.setBoolPref(name, value);
    }
}
