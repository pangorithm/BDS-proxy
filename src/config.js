import dotenv from 'dotenv';
const envResult = dotenv.config({
  path: `${process.env.ENV_PATH}`,
  // debug: true,
});
// console.log('Loaded environment variables:', envResult.parsed);

import { Command } from 'commander';

function initializeOptions() {
  if (typeof globalThis.Bun !== 'undefined') {
    console.log('▶ 런타임: Bun (process.execPath:', process.execPath, ')');
  } else {
    console.log('▶ 런타임: Node.js (process.execPath:', process.execPath, ')');
  }

  const program = new Command();
  program
    .name('bedrock-proxy')
    .description('A simple Bedrock proxy server')
    .version('1.0.0');

  program
    .option('-h, --host <host>', 'Host to bind to', '127.0.0.1')
    .option('-p, --port <port>', 'Port to listen on', '29132')
    .option(
      '-H, --destination_host <destination_host>',
      'Destination Host to bind to',
      '127.0.0.1',
    )
    .option(
      '-P, --destination_port <destination_port>',
      'Destination Port to bind to',
      '19132',
    )
    .option(
      '-s, --grpc_server <destination_server_host_port>',
      'gRPC Server to connect to (host:port)',
      '127.0.0.1:50051',
    );

  return program.parse().opts();
}

export const options = initializeOptions();
