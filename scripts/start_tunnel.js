import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const statusFile = path.join(__dirname, '..', 'tunnel_url.txt');

console.log('Starting persistent localhost.run HTTPS tunnel on port 5000 with keep-alive heartbeat...');

let currentUrl = null;
let heartbeatInterval = null;

function startHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(async () => {
    if (currentUrl) {
      try {
        await fetch(`${currentUrl}/api/opportunities/stats/summary`);
      } catch (e) {}
    }
  }, 10000);
}

function startTunnel() {
  const ssh = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=15',
    '-o', 'ServerAliveCountMax=6',
    '-o', 'ExitOnForwardFailure=yes',
    '-R', '80:localhost:5000',
    'nokey@localhost.run'
  ]);

  ssh.stdout.on('data', (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9.-]+\.lhr\.life/);
    if (match) {
      currentUrl = match[0];
      console.log('✅ ACTIVE LIVE PRODUCTION URL:', currentUrl);
      fs.writeFileSync(statusFile, currentUrl, 'utf8');
      startHeartbeat();
    }
  });

  ssh.stderr.on('data', (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9.-]+\.lhr\.life/);
    if (match) {
      currentUrl = match[0];
      console.log('✅ ACTIVE LIVE PRODUCTION URL:', currentUrl);
      fs.writeFileSync(statusFile, currentUrl, 'utf8');
      startHeartbeat();
    }
  });

  ssh.on('close', (code) => {
    console.log(`Tunnel closed (${code}), reconnecting in 2 seconds...`);
    setTimeout(startTunnel, 2000);
  });
}

startTunnel();
