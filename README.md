# Backend
This nodejs-backend uses some ES6 (not everything is usable yet :/ ) and listen on an IPv6 Socket.

# Starting
Starting this requires the 'vagrant-triggers' plugin.
Please install via:

```bash
vagrant plugin install vagrant-triggers
vagrant plugin install vagrant-docker-compose
```

If you want to run this, simply run the following command and the nodejs-server is started for you.

```bash
vagrant up
```

# FAQ

## Provisioning

- If you get unexpected behavior from you virtual mashine while Running:
    __Restart it__
- If your mashine starts with tons of unreadable stuff. Try:
    ```
    vagrant halt
    vagrant up --provision
    ```
- If this isn't solved do something like this:
    ```
    vagrant destroy
    vagrant up
    ```

__Please__ don't cry before you used the FAQ!

## Virtualbox

- If your box don't start properly try to install the
[VirtualBox Extension Pack](https://www.virtualbox.org/wiki/Downloads).
- Do __NOT__ use umlauts in your home-path ($HOME) when using vagrant there
_(Wind**** sucks)_


---
!! You __won't__ anything below here unless you develop the backend !!
---
# Developer Stuff

## NPM Modules
To install the neccessary npm-modules do:
```bash
cd src
npm install
cd ../client
npm install
```

## MongoDB external
To enable external access to MongoDB run this on your console:

```bash
vagrant ssh -c "sudo sed -ri 's/^(.*?)bindIp/#  bindIp/g' /etc/mongod.conf; sudo systemctl restart mongod"
```

## Livelog
```bash
vagrant ssh -c "sudo journalctl -ef"
```

# WebStorm

## NodeJS Support
`Language and Frameworks > NodeJS and NPM`

Here click the _Enable_ Button. This should automatically change the _Usage Scope_ to NodeJS for the entire Project.

## Settings Repository

Enter in your `File > Settings Repository`:
`git@git.dark-it.net:content-loops/webstorm-settings.git`

## Plugins

Please install the following Plugins in your Webstorm under:
`File > Settings > Plugins`

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

## Code Quality

```bash
npm install -g jscs
```

### JSCS
`Language and Frameworks > JavaScript > Code Quality > JSCS`

Simply check _Enabled_. The other Fields should be filled automatically.

### JSLint
`Language and Frameworks > JavaScript > Code Quality > JSLink`

Here again: Simply check the _Enabled_. One more tweak is neccessary to use it:
Check the _Use Config_ in the upper-right corner.
