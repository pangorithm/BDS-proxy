import { Command } from 'commander';
import { Relay } from 'bedrock-protocol';

function initializeOptions() {
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
    );

  return program.parse().opts();
}

async function main({ host, port, destination_host, destination_port }) {
  console.log('Starting proxy with config:', {
    host,
    port,
    destination_host,
    destination_port,
  });

  try {
    const relay = new Relay({
      /* The version defaults to the latest version supported by bedrock-protocol.
       You can specify a specific version if needed, e.g., '1.21.80' */
      // version: '1.21.80',

      /* host and port to listen for clients on */
      host: host,
      port: parseInt(port),
      offline: true,

      /* Where to send upstream packets to */
      destination: {
        host: destination_host,
        port: parseInt(destination_port),
      },
    });

    console.log('Attempting to bind relay...');
    await relay.listen().catch((e) => {
      console.error('relay.listen() failed:', e);
    }); // Tell the server to start listening.

    relay.on('connect', (player) => {
      try {
        console.log('New connection', player.connection.address);

        // Server is sending a message to the client.
        player.on('clientbound', ({ name, params }, des) => {
          if (name === 'disconnect') {
            // Intercept kick
            params.message = 'Intercepted'; // Change kick message to "Intercepted"
          }
        });
        // Client is sending a message to the server
        player.on('serverbound', ({ name, params }, des) => {
          if (name === 'text') {
            // Intercept chat message to server and append time.
            params.message += `, on ${new Date().toLocaleString()}`;
          }

          if (name === 'command_request') {
            // Intercept command request to server and cancel if its "/test"
            if (params.command == '/test') {
              des.canceled = true;
            }
          }
        });
      } catch (error) {
        console.error('Error handling player connection:', error);
      }
    });
  } catch (error) {
    console.error('Failed to create relay:', error);
  }

  console.log(`proxy server started`);
}

main(initializeOptions());
