let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let fs = require('fs');


process.env.PWD = process.cwd();
app.use(express.static(process.env.PWD + '/public'));

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

String.prototype.softEscapeHTML = function () {
    let tagsToReplace = {
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[<>]/g, function (tag) {
        return tagsToReplace[tag] || tag;
    });
};

let adminPass = 'CX';
let superAdminPass = 'XD';
let worldName = './world.json';

//System lets
let refreshRate = 20;

let deltaTime;
let lastTime = Date.now();
let currentTime;

// Commands regexp
let commandCreateRegexp = /\/create\s?\(([^,]+),\s?(\d+(?:\.\d+)?),\s?(\d+(?:\.\d+)?),\s?(\d+(?:\.\d+)?),\s?(-?\d)\)/g;
let commandRemoveRegexp = /\/remove\s?\(([^,]+)\)/g;
let adminRegexp = /\/admin (.+)/g;
let deadminRegexp = /\/deadmin/g;
let saveRegexp = /\/save/g;

// Chat media regexp
let chatImgRegexp = /\/img (.\S+)/g;

let maxNameLength = 15;

function Player(id) {
    this.id = id;
    this.name = '';
    this.skin = 0;
    this.x = 11.5;
    this.y = 9.5;
    this.rotation = 240;
    this.speedX = 0;
    this.speedY = 0;
    this.admin = 0;
}

function GameObject(name, x, y, rotation, type) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.type = type;
    this.solid = 0;
    this.distance = 0;
    this.relativeAngle = 0;
}

function ChatMessage(name, text, type) {
    this.name = name;
    this.text = text;
    this.type = type;
}



//Server data
let serverData = {
    'playerList': [],
    'deltaTime': 0
};


let worldData = {
    'spawn': {
        'x': 0,
        'y': 0,
        'rotation': 0
    },
    'world': [],
    'objects': [],
    'reSync': {
        'x': 0,
        'y': 0
    },
    'portals': []
};
worldData = require(worldName);

//Per-player functions
io.on('connection', function (client) {
    console.log('Connected ID: ' + client.id);

    let player = new Player(client.id);
    serverData.playerList.push(player);

    io.to(client.id).emit('world data', worldData);
    //client.broadcast.emit('player connected', client.id);

    client.on('disconnect', function () {
        console.log('Disconnected ID: ' + client.id);
        if (player.name !== '') io.emit('server message', new ChatMessage('<i>server</i>', 'Player ' + player.name + ' has left the game', 0));
        serverData.playerList = serverData.playerList.filter(function (player) {
            return player.id !== client.id;
        });
    });

    client.on('player joined', function () {
        io.emit('server message', new ChatMessage('<i>server</i>', 'Player ' + player.name + ' has joined the game', 0));
    });

    client.on('client data', function (clientPlayer) {
        if (clientPlayer.name.length > maxNameLength) {
            clientPlayer.name = clientPlayer.name.substring(0, maxNameLength - 1);
        }
        updatePlayerInList(client.id, clientPlayer.name, clientPlayer.skin, clientPlayer.x, clientPlayer.y, clientPlayer.rotation);
    });

    client.on('client message', function (msg) {
        if (msg.length <= 300) {

            if (player.admin) {
                if (checkForAdminCommands(msg, player, client)) return;
            }

            if (checkForNonAdminCommands(msg, player, client)) return;

            msg = msg.softEscapeHTML();

            if (checkForMedia(msg, player)) return;

            io.emit('server message', new ChatMessage(player.name, msg, 0));
        }
    });

    client.on('world change', function (x, y, type) {
        if (player.admin > 0) {
            let error = false;
            if (x < 0 || y < 0) {
                if (player.admin > 1) {
                    while (y < 0) {
                        y++;
                        worldData.world.unshift([null]);
                        worldData.reSync.y++;
                    }
                    while (x < 0) {
                        x++;
                        for (let i = 0; i < worldData.world.length; i++) worldData.world[i].unshift(null);
                        worldData.reSync.x++;
                    }
                } else {
                    error = true;
                    io.to(client.id).emit('server message', new ChatMessage('<i>server</i>', 'Insufficient powers. You need to be a superadmin to perform negative shift', 0));
                }
            }
            if (!error) {
                if (type === -1) type = null;
                while (y > worldData.world.length-1) worldData.world.push([null]);
                worldData.world[y][x] = type;
                shiftObjects();
                worldData.spawn.x += worldData.reSync.x;
                worldData.spawn.y += worldData.reSync.y;
                io.emit('world data', worldData);
                worldData.reSync.x = 0;
                worldData.reSync.y = 0;
            }
        }
    });
});

// Message functions
function checkForAdminCommands(msg, player, client) {
    let match = commandCreateRegexp.exec(msg);
    if (match != null) {
        commandCreateRegexp.lastIndex = 0;
        let name = match[1];
        let x = parseFloat(match[2]);
        let y = parseFloat(match[3]);
        let rotation = parseFloat(match[4]);
        let type = parseInt(match[5]);

        rotation = rotation % 360;
        if (rotation < 0) rotation += 360;

        if (x >= 0 && y >= 0) {
            worldData.objects.push(new GameObject(name, x, y, rotation, type));
            io.emit('world data', worldData);
        }
        return true;
    }
    match = commandRemoveRegexp.exec(msg);
    if (match != null) {
        commandRemoveRegexp.lastIndex = 0;
        let name = match[1];

        for (let i = 0; i < worldData.objects.length; i++) {
            if (worldData.objects[i].name === name) {
                worldData.objects.splice(i, 1);
                io.emit('world data', worldData);
            }
        }
        return true;
    }
    match = deadminRegexp.exec(msg);
    if (match != null) {
        deadminRegexp.lastIndex = 0;
        player.admin--;
        if (player.admin < 1) {
            io.emit('server message', new ChatMessage('<i>server</i>', 'Admin ' + player.name + ' lowered to player', 0));
            console.log('Admin ' + player.name + ' lowered to player. ID: ' + player.id);
        } else if (player.admin < 2) {
            io.emit('server message', new ChatMessage('<i>server</i>', 'Superadmin ' + player.name + ' lowered to admin', 0));
            console.log('Superadmin ' + player.name + ' lowered to admin. ID: ' + player.id);
        }
        return true;
    }
    match = saveRegexp.exec(msg);
    if (match != null) {
        saveRegexp.lastIndex = 0;
        if (player.admin < 2) {
            io.to(client.id).emit('server message', new ChatMessage('<i>server</i>', "Insufficient powers. You need to be a superadmin to save map.", 0));
        } else if (player.admin < 3) {
            io.emit('server message', new ChatMessage('<i>server</i>', 'Map has been saved.', 0));
            console.log('Map save initiated by ' + player.name + '. ID: ' + player.id);
            saveMap();
        }
        return true;
    }
    return false;
}

function checkForNonAdminCommands(msg, player, client) {
    let match = adminRegexp.exec(msg);
    if (match != null) {
        adminRegexp.lastIndex = 0;
        if (match[1] === adminPass) {
            if (player.admin < 1) {
                player.admin = 1;
                io.emit('server message', new ChatMessage('<i>server</i>', 'Player ' + player.name + ' elevated to admin', 0));
                console.log('Player ' + player.name + ' elevated to admin. ID: ' + player.id);
            } else if (player.admin < 2) {
                io.to(client.id).emit('server message', new ChatMessage('<i>server</i>', "You're already an admin", 0));
            } else {
                io.to(client.id).emit('server message', new ChatMessage('<i>server</i>', "You're already a superadmin", 0));
            }
        }
        if (match[1] === superAdminPass) {
            if (player.admin < 1) {
                player.admin = 2;
                io.emit('server message', new ChatMessage('<i>server</i>', 'Player ' + player.name + ' elevated to superadmin', 0));
                console.log('Player ' + player.name + ' elevated to superadmin. ID: ' + player.id);
            } else if (player.admin < 2) {
                player.admin = 2;
                io.emit('server message', new ChatMessage('<i>server</i>', 'Admin ' + player.name + ' elevated to superadmin', 0));
                console.log('Admin ' + player.name + ' elevated to superadmin. ID: ' + player.id);
            } else {
                io.to(client.id).emit('server message', new ChatMessage('<i>server</i>', "You're already a superadmin", 0));
            }
        }
        return true;
    }
}

function checkForMedia(msg, player, client) {
    let match = chatImgRegexp.exec(msg);
    if (match != null) {
        chatImgRegexp.lastIndex = 0;
        io.emit('server message', new ChatMessage(player.name, match[1], 1));
        return true;
    }
    return false;
}

//All players functions
function updatePlayerInList(id, name, skin, x, y, rotation) {
    for (let i = 0; i < serverData.playerList.length; i++) {
        if (serverData.playerList[i].id === id) {
            serverData.playerList[i].name = name.softEscapeHTML();
            serverData.playerList[i].skin = skin;
            serverData.playerList[i].x = x;
            serverData.playerList[i].y = y;
            serverData.playerList[i].rotation = rotation;
        }
    }
}

function shiftObjects() {
    for (let i = 0; i < worldData.objects.length; i++) {
        worldData.objects[i].x += worldData.reSync.x;
        worldData.objects[i].y += worldData.reSync.y;
    }
}

function saveMap() {
    fs.writeFile('./world.json', JSON.stringify(worldData));
}

//Main loop
setInterval(function () {
    currentTime = Date.now();
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    serverData.deltaTime = deltaTime;

    io.volatile.emit('server data', serverData);
}, refreshRate);