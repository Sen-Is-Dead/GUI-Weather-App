# Preact / Weather App

## Set-Up Guide
- [Installation](#installation)
- [Development Workflow](#development-workflow)

**0. Before doing any of this, if you're using your own laptop/desktop, make sure you've got the latest versions of node and npm installed (npm v: 4.0.5 & node v: 7.4.0) :**

```sh
node -v
npm -v
```

## Installation

**1. Clone this repository :**

```sh
git clone --depth 1 https://github.com/Sen-Is-Dead/GUI-Weather-App GUI-Weather-App
cd GUI-Weather-App
```

**2. Make it your own :**

```sh
rm -rf .git && git init && npm init
```

> :information_source: Command above re-initializes the repo and sets up your NPM project.

**2a. Make it your own (Windows):**

If you are using Windows you can run the three necessary comand using Powershell. You might need elevated privileges.

```sh
rm -r -fo .git
git init 
npm init
```

**3. Install the dependencies :**

```sh
npm install
```

## Development Workflow


**4. Start a live-reload development server :**

```sh
npm run dev
```

> This is a full web server for your project. Any time you make changes within the `src` directory, it will rebuild and even refresh your browser.


**5. Generate a production build in `./build` :**

```sh
npm run build
```

**6. Start local production server with [serve](https://github.com/zeit/serve):**

```sh
npm start
```

> This simply serves up the contents of `./build`. Bear in mind, if you use this, the localhost port your server is running on will refresh, and you'll also need to restart it to see any changes you've made to the code in `src`.
