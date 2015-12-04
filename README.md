# Backend
This nodejs-backend uses some ES6 (not everything is usable yet :/ ) and listen on an IPv6 Socket.

# Starting
Starting this requires the 'vagrant-triggers' plugin.
Please install via:

```bash
vagrant plugin install vagrant-triggers
```

If you want to run this, simply run the following command and the nodejs-server is started for you.

```bash
vagrant up
```

## NPM Modules
To install the neccessary npm-modules do:
```bash
cd src
npm install
cd ../client
npm install
```

## Notes for Virtualbox

- If your box don't start properly try to install the
[VirtualBox Extension Pack](https://www.virtualbox.org/wiki/Downloads).
- Do __NOT__ use umlauts in your home-path ($HOME) when using vagrant there
_(Wind**** sucks)_

# WebStorm

## Settings Repository

Enter in your ```File > Settings Repository```:
```git@git.dark-it.net:content-loops/webstorm-settings.git```

## Plugins

Please install the following Plugins in your Webstorm under:
```File -> Settings -> Plugins```

- bash support
- .ignore
- gittoolbox
- gitlab projects
- latex
- markdown support
- mongo plugin
- nginx support
- puppet support
- regexptester
- settings repository
- spell checker english
- spell checker german
- vagrant
