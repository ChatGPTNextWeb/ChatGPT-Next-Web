module.exports = {
  apps : [{
    name   : "chat",
    script : "yarn",
    args   : "start",
    env    : {
      PORT : 23000
    },
    autorestart: true,
    interpreter: '/bin/bash',
  }]
}
