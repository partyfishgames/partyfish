# PartyFish

## Getting Started

Before running the server, you will need to install `Node.js` and `npm`. You can check if these are installed by running `node -v` and `npm -v`, respectively. If the software is installed, these commands will print your current version.

If both `Node.js` and `npm` are installed, you can proceed by running `npm install`, which will download all the dependencies listed in the `package.json` file. You only have to do this once, unless the `node_modules` folder is deleted or `package.json` is edited manually (not recommended).

## Running the Server Locally

To run the server, use the following command from the main directory:

```bash
$ npm start
```

Wait for the message indicating the server has started. You can then access the website from your browser at `localhost:3000` .

## File Structure

To separate client code from server code when developing, the `src` directory is laid out as follows:

```bash
$ tree src
src
├── host
│   └── host.ts
├── html
│   └── index.html
├── models
│   └── models.ts
├── player
│   └── player.ts
└── server
    └── index.ts
```

To accommodate serving static files and scripts, the `dist` directory is laid out as follows:

```bash
$ tree dist
dist
├── models
│   └── models.js
└── server
    ├── html
    │   └── index.html
    ├── index.js
    └── scripts
        ├── host.js
        └── player.js
```

This way, the Express server at `index.js` can easily serve all HTML and JavaScript files without extra permissions, using the following lines:

```typescript
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'html')));
```

