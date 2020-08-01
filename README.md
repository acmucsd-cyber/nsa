# nsa

the official ACM Cyber discord bot: the **neutral server authority**

## contributing

```bash
git clone https://github.com/acmucsd-cyber/nsa.git
```

To get started developing for this project, you'll need to first install node.

#### on macOS:
```bash
brew install node
```

#### on various Linux:
```bash
# Debians
apt-get install nodejs npm
# RHELs
yum install nodejs
# btw I use arch
pacman -S nodejs
```

#### on Winblows (via [scoop](https://scoop.sh/)):
```powershell
scoop install nodejs
```
#### OR on all platforms:
...from the [website](https://nodejs.org/en/) like a rational person.

**next**, you'll need the native development tools for your platform. We assume on macOS and Linux this is fairly trivial.

#### on Winblows:
```powershell
# FROM AN ADMINISTRATIVE CONSOLE
npm install --global --production windows-build-tools
# now configure your environment
npm config set msvs_version 2017 --global
```

**now**, navigate to the working project directory and build the project dependencies:
#### all platforms:
```bash
npm install
```

don't forget to also install development dependencies if you're going to building the project itself:
```bash
npm install -D
```

### building the project
```bash
# compile ts to js:
npm run build
# launch the js bot:
npm run start
```

more runners / watcher scripts for development coming soon...