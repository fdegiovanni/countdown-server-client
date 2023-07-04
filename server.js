const fs = require('fs');
const ws = require('ws');
const http = require('http');
const path = require('path');
const ifaces = require('os').networkInterfaces();

const PORT_FILESERVER = 3000;
const PORT_WSSERVER = 3010;
const PUBLIC_DIR = './public';

let ipAddress = '';
Object.keys(ifaces).forEach(dev => {
    ifaces[dev].filter(details => {
        if (details.family === 'IPv4' && details.internal === false) ipAddress = details.address;
    });
});

const wsServer = new ws.Server({ port: PORT_WSSERVER });

const broadcast = (message) => {
    wsServer.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) client.send(message);
    });
}

wsServer.on('connection', (socket) => {
    console.log('Dispositivo conectado');

    socket.on('message', (data) => {
        console.log(`Mensaje: ${data}`);
        broadcast(data.toString());
    });
});

wsServer.on('close', () => {
    console.log('Dispositivo desconectado');
});

const fileServer = http.createServer((req, res) => {
    const filePath = path.join(__dirname, PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);

    // console.log(filePath);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.statusCode = 404;
            res.end('File not found');
            return;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Internal server error');
                return;
            }

            const ext = path.extname(filePath);
            let contentType = 'text/html';
            if (ext === '.css') {
                contentType = 'text/css';
            } else if (ext === '.js') {
                contentType = 'text/javascript';
            } else if (ext === '.json') {
                contentType = 'application/json';
            } else if (ext === '.png') {
                contentType = 'image/png';
            } else if (ext === '.jpg' || ext === '.jpeg') {
                contentType = 'image/jpeg';
            }

            res.setHeader('Content-Type', contentType);
            res.end(data);
        });
    });
});

fileServer.listen(PORT_FILESERVER, () => {
    console.log(`File server listening on http://${ipAddress}:${PORT_FILESERVER}`);
    console.log(`Websocket server listening on http://${ipAddress}:${PORT_WSSERVER}`);
});
