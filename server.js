// const express = require("express")
// const {Server} = require("socket.io");
// const http = require('http');

// const app = express();

// // const wss = new Server(app);
// // app.get("/", (req,res)=>{
// //     res.send("Here we built express and socket.io")
// // })
// // const httpServer = http.createServer((req,res)=>{
// //     if(req.url === '/'){
// //         res.end("Api is working")
// //     }else if(req.url === "/signup" && req.method === "post"){
// //         res.end("Api is working")
// //     }
// // })
// const httpServer = http.createServer(app)

// const wss = new Server(httpServer);
// app.get("/", (req,res)=>{
//     res.send("Here we built express and socket.io")
// })

// let count =0;
// let info = {a: "jhj"};
// wss.on("connection" , (Socket)=>{
//     console.log("client connected")
//     count++;
//     console.log(count)
//     wss.emit("count", count);
//     // Socket.on("message" , (data)=>{
//     //     console.log(data);
//     //     if(data == 'hello'){
//     //         Socket.emit("server_message", "hi");
//     //     }else if(data == 'bye'){
//     //         Socket.emit("server_message", "bye")
//     //     }
//     // })
//     Socket.on("send_username" , (data)=>{
//          info[data.username] = Socket.id;
//          console.log(info);

//         //  wss.to(obj["c"]).emit("private_msg" , "hey there are the msg for you")
//     })
    
    
//     // console.log(info);
//     Socket.on("disconnect", ()=>{
//         count--;
//         console.log(count);
//         wss.emit("count", count);
//     })
// })

// httpServer.listen(5000)

// // app.listen(5000,()=>{
// //     console.log("your server is running on port 5000")
// // })

// --------------------------------------------------------------------------------------------------

const express = require("express");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.get("/", (req, res) => {
    res.send("Socket.io Group & Private Chat Server Running...");
});

let users = {}; // Stores { username: socketId }

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Register username
    socket.on("send_username", (username) => {
        users[username] = socket.id; // Store username and socket ID
        console.log(`User Registered: ${username} - Socket ID: ${socket.id}`);
        socket.emit("username_received", `Welcome ${username}, you are now registered!`);
        io.emit("chat_notification", { message: `${username} joined the chat!`, type: "join" });
    });

    // Broadcast group message to all users
    socket.on("group_message", ({ sender, message }) => {
        console.log(`Group Message from ${sender}: ${message}`);
        io.emit("receive_group_message", { sender, message });
    });

    // Send private message to specific user
    socket.on("private_message", ({ sender, receiver, message }) => {
        if (!users[receiver]) {
            socket.emit("error_message", `User ${receiver} not found!`);
            return;
        }

        let receiverSocketId = users[receiver];
        let senderSocketId = users[sender];

        io.to(receiverSocketId).to(senderSocketId).emit("receive_private_message", { sender, message });
    });
    
    

    // Handle user disconnect
    socket.on("disconnect", () => {
        for (let user in users) {
            if (users[user] === socket.id) {
                console.log(`User ${user} disconnected.`);
                io.emit("chat_notification", { message: `${user} left the chat.`, type: "leave" });
                delete users[user];
                break;
            }
        }
    });
});

httpServer.listen(5000, () => {
    console.log("Server running on port 5000...");
});
 