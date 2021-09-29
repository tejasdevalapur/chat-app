const path= require('path');
const http= require('http');
const express= require('express');
const Filter = require('bad-words');
const app=express();
const socketio=require('socket.io');
const { generateMessage,generatelocationMessage } = require('./utils/messages');
const { addUser,removeUser,getUser,getUsersInRoom}= require('./utils/users')
const PORT= process.env.PORT || 5000;


const publicDirectoryPath=path.join(__dirname, '../public');

const server = http.createServer(app);

const io= socketio(server);
app.use(express.static(publicDirectoryPath));

let msg="Welcome";
io.on('connection',(socket)=>{
    console.log('New websocket Connection');
    

    socket.on('join',({username,room},callback)=>{

        const { error,user}=addUser({id:socket.id, username,room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        console.log(user.username)
        socket.emit('message',generateMessage(msg));
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined!`));

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('SendMessage',(message,callback)=>{
        const filter= new Filter()
        const currentUser=getUser(socket.id)
        if (filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(currentUser.room).emit('message',generateMessage(currentUser.username,message))
        callback()
    })

    socket.on('Sendlocation',(coords,back)=>{
        const user=getUser(socket.id)

        io.to(user.room).emit('locationMessage', generatelocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        back()
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id) 
        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} has left!`));
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })

});
server.listen(PORT,(req,res)=>{

    console.log(`Server is up and running on port ${PORT} `);

});




