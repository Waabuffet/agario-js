socket.on('init', (data) => {
    console.log('received init from server');
    initServer(data);
    console.log(data);
});

socket.on('update-dot', (data) => {
    updateDot(data);
});

socket.on('player-disconnected', (data) => {
    playerDisconnected(data);
});

socket.on('other-player-moved', (player) => {
    playerMoved(player);
});

socket.on('player-remove', (id) => {
    console.log('removing player ' + id);
    playerRemove(id);
});

socket.on('player-connected', (player) => {
    playerConnected(player);
});

//TODO player connected broadcast to all to add him if not in their list yet