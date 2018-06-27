const server = require('../server');

setInterval(() => {
    for (let id in server.CLS.wss.clients) {
        server.CLS.send_to(id, 'ping', {t: Date.now()})
}
}, 5000);