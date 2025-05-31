module.exports = {
  apps: [
    {
      name: 'bds-proxy',
      script: './main.js',
      exec_mode: 'fork',
      args: [
        '--host',
        '127.0.0.1',
        '--port',
        29132,
        '--destination_host',
        '127.0.0.1',
        '--destination_port',
        19132,
      ],
    },
  ],
};
