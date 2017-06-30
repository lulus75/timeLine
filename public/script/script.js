angular.module('timeLineApp', ['angularUUID2']).controller('timeLineController', function($scope,uuid2) {
    var timeLine = this;

    timeLine.isDisconnected = true;

    timeLine.users    = [];
    timeLine.messages = [];
    timeLine.pseudo      = '';
    timeLine.messageText = '';


    // Lorsque l'utilisateur se connecte
    timeLine.loginUser = function() {

        timeLine.isDisconnected = false;

        timeLine.socket = io('ws://localhost:3000');

        timeLine.socket.emit('setPseudo', timeLine.pseudo);


        //update userList
        timeLine.socket.on('usersList', function(usersList) {
            timeLine.users = usersList;
            $scope.$apply();
        });

        // new user
        timeLine.socket.on('newUser', function(newUser) {
            timeLine.users.push(newUser);
            $scope.$apply();
        });

        // display history for new user
        timeLine.socket.on('postList', function(sendList){
            timeLine.messages = sendList;
            $scope.$apply();
        });

        timeLine.socket.on('userDisconnected', function(userQuit) {

            timeLine.users = timeLine.users.filter(function(user) {
                return user.id !== userQuit.id;
            });
            $scope.$apply();
        });

        // new post / store in messages array
        timeLine.socket.on('message', function(message) {
            timeLine.messages.push(message);
            $scope.$apply();
        });

        // delete post

        timeLine.socket.on('delete', (objSend) => {
            for (var i = 0; i < timeLine.messages.length; i++) {
            var obj = timeLine.messages[i];
            if (obj.id === objSend.id) {
                timeLine.messages.splice(i, 1);
            }
        }
        $scope.$apply();
    });
    };

    timeLine.sendPost = function() {
        if (timeLine.messageText.trim() === '') return;

        // new post object
       var post = {
            pseudo: timeLine.pseudo,
            content: timeLine.messageText,
            date : new Date(),
            id : uuid2.newuuid(), // Using uuid to have an unique id for each post
            imgUrl : timeLine.url
        };

        // if not img then default img
        if(post.imgUrl  ==  null){
            post.imgUrl  = 'http://lorempixel.com/400/200/';
            console.log( post.imgUrl)
        }

        timeLine.socket.emit('post', post);
        timeLine.messages.push(post);

        timeLine.messageText = '';
    };
    // delete Post
    timeLine.delete = function (id) {
        for (var i = 0; i < timeLine.messages.length; i++) {
            var obj = timeLine.messages[i];
            if (obj.id === id) {
                timeLine.socket.emit('delete', obj);
                timeLine.messages.splice(i, 1);
            }
        }
    };

});
