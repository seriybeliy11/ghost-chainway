#!/usr/bin/env bun
const { Client } = require('ssh2');
const fs = require('fs');

const args = process.argv.slice(2);
let host = '';
let user = 'git';
let port = 22;
let cmdStart = 2;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-p' && args[i + 1]) { port = parseInt(args[i + 1]); i++; cmdStart = i + 2; continue; }
  if (!host) { host = args[i]; cmdStart = i + 1; }
}
if (host.includes('@')) { [user, host] = host.split('@'); }
const cmd = args.slice(cmdStart).join(' ');
const privKey = fs.readFileSync('/home/z/.ssh/phantom_deploy', 'utf-8');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(cmd, (err, stream) => {
    if (err) { process.stderr.write(err.message + '\n'); conn.end(); process.exit(1); }
    process.stdin.pipe(stream);
    stream.pipe(process.stdout);
    stream.stderr.pipe(process.stderr);
    stream.on('close', (code) => { conn.end(); process.exit(code || 0); });
  });
}).on('error', (err) => {
  process.stderr.write(err.message + '\n');
  process.exit(1);
}).connect({ host, port, username: user, privateKey: privKey, readyTimeout: 15000 });