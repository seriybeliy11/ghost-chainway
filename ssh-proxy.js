#!/usr/bin/env node
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let host = 'github.com';
let user = 'git';
let port = 22;
let cmdArgs = [];
let i = 0;

while (i < args.length) {
  const a = args[i];
  if (a === '-p' && args[i + 1]) { port = parseInt(args[i + 1], 10); i += 2; }
  else if (a === '-l' && args[i + 1]) { user = args[i + 1]; i += 2; }
  else if (a === '-o') { i += 2; }
  else if (a.startsWith('-')) { i++; }
  else if (a.includes('@')) {
    // user@host format
    const [u, h] = a.split('@', 2);
    if (u) user = u;
    if (h) host = h;
    i++;
  }
  else if (cmdArgs.length === 0 && !a.includes(' ') && a.includes('.')) {
    host = a;
    i++;
  }
  else {
    cmdArgs = args.slice(i);
    break;
  }
}

const cmdStr = cmdArgs.join(' ');

const keyPath = path.join(process.env.HOME || '/home/z', '.ssh', 'phantom_deploy');
const privateKey = fs.readFileSync(keyPath, 'utf8');

const conn = new Client();

conn.on('ready', () => {
  conn.exec(cmdStr, (err, stream) => {
    if (err) { console.error('exec error:', err.message); conn.end(); process.exit(1); }
    process.stdin.pipe(stream);
    stream.pipe(process.stdout);
    stream.stderr.on('data', (d) => process.stderr.write(d));
    stream.on('close', (code) => { conn.end(); process.exit(code || 0); });
  });
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host, port, username: user, privateKey, readyTimeout: 15000 });