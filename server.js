const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);


app.use( '/node_modules', express.static(path.join(__dirname, 'node_modules')) );
app.use( express.static(path.join(__dirname, 'public')) );

let usersList = [];
let postList = [];


io.on('connection', socket => {
    const currentUser = {
        id     : null,
        pseudo : null
    };

    socket.on('setPseudo', pseudo => {

        currentUser.id     = socket.id;
        currentUser.pseudo = pseudo;
        usersList.push(currentUser);

        socket.emit('postList', postList);


        // history of post for new user
        socket.on('post', (sendPost) => {
            socket.broadcast.emit('message', sendPost)
        postList.push(sendPost);
        })

    // send to client dide new userlist after new login

    socket.emit('usersList', usersList);
        socket.broadcast.emit('newUser', currentUser);
    });

    socket.on('disconnect', () => {
    socket.broadcast.emit('userDisconnected', currentUser);


        usersList = usersList.filter(user => user !== currentUser);
    });

    // delete post server side
    socket.on('delete', (objSend) => {
        for (var i = 0; i < postList.length; i++) {
        var deletePost = postList[i];
        if (deletePost.id === objSend.id) {
            postList.splice(i, 1);
        }
    }
    // send delete to client side
    socket.broadcast.emit('delete', objSend);

    });


});


const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Le serveur écoute sur le port ${port}`));