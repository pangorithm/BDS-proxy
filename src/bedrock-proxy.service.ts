import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Relay } from 'bedrock-protocol';

@Injectable()
export class BedrockProxyService implements OnModuleInit, OnModuleDestroy {
  private relay : any = null;

  onModuleInit() {
    this.startProxy();
  }

  onModuleDestroy() {
    this.stopProxy();
  }

  startProxy() {
    this.relay = new Relay({
      version: '1.21.80', // The version
      /* host and port to listen for clients on */
      host: '0.0.0.0',
      port: 29132,
      /* Where to send upstream packets to */
      destination: {
        host: '127.0.0.1',
        port: 19132
      },
      raknet: {
        backend: 'raknet-js',
      },
    } as any)
    this.relay.listen() // Tell the server to start listening.

    this.relay.on('connect', player => {
      console.log('New connection', player.connection.address)

      // Server is sending a message to the client.
      player.on('clientbound', ({ name, params }, des) => {
        if (name === 'disconnect') { // Intercept kick
          params.message = 'Intercepted' // Change kick message to "Intercepted"
        }
      })
      // Client is sending a message to the server
      player.on('serverbound', ({ name, params }, des) => {
        if (name === 'text') { // Intercept chat message to server and append time.
          params.message += `, on ${new Date().toLocaleString()}`
        }

        if (name === 'command_request') { // Intercept command request to server and cancel if its "/test"
          if (params.command == "/test") {
            des.canceled = true
          }
        }
      })
    })

    console.log('Bedrock proxy server started on port 29132')
  }

  stopProxy() {
    if (this.relay) {
      this.relay.close()
      console.log('Bedrock proxy server stopped')
    }
  }
}