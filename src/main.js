import { Relay } from 'bedrock-protocol';
import { options } from './config.js';
import { jsonStringify } from './common.js';
import { put } from './grpc/packet.js';

function main({ host, port, destination_host, destination_port }) {
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

    console.log(
      `Attempting to bind relay...
      "Unknown bind__() error -1; port ${port}." 라고 나오지만 실제로는 binding 성공함
      (racknet-native에서 ubuntu24용 prebuild를 제공하지 않아서 발생하는 에러)`,
    );
    relay.listen().catch((e) => {
      console.error('relay.listen() failed:', e);
    }); // Tell the server to start listening.

    const clientboundSet = new Set();
    const serverboundSet = new Set();

    relay.on('connect', (player) => {
      try {
        console.log('New connection', player.connection.address);

        // Server is sending a message to the client.
        player.on('clientbound', async ({ name, params }, des) => {
          try {
            switch (name) {
              default:
                if (!clientboundSet.has(name)) {
                  console.log(
                    `Clientbound packet: ${name} (${
                      des ? jsonStringify(des.data) : 'no des.data obj'
                    })`,
                  );
                  clientboundSet.add(name);
                  await put({
                    sender: 'clientbound',
                    event: name,
                    des_json: jsonStringify(des.data),
                  });
                }
                break;
            }

            if (name === 'disconnect') {
              // Intercept kick
              params.message = 'Intercepted'; // Change kick message to "Intercepted"
            }
          } catch (error) {
            console.error('Error processing clientbound packet:', error);
          }
        });

        // Client is sending a message to the server
        player.on('serverbound', async ({ name, params }, des) => {
          try {
            switch (name) {
              default:
                if (!serverboundSet.has(name)) {
                  console.log(
                    `Serverbound packet: ${name} (${
                      des ? jsonStringify(des.data) : 'no des.data obj'
                    })`,
                  );
                  serverboundSet.add(name);
                  await put({
                    sender: 'serverbound',
                    event: name,
                    des_json: jsonStringify(des.data),
                  });
                }
                break;
            }

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
          } catch (error) {
            console.error('Error processing serverbound packet:', error);
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

main(options);
