const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
var url = require("url");
var mysql = require("mysql");
var fs = require("fs");
var gString = require("querystring");
var Router = require('routes')()

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  database: "erparoma_demo",
  user: "root",
  password: "",
});

const PORT = process.env.PORT || 5050;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.get('/', function(request, res){
    res.sendFile(__dirname + '/templates/index.html');
});

io.on("connection", (socket) => {
  socket.on("join", ({ name, socketId }) => {
    // socket.emit('connect', {name, socketId});

    // socket.broadcast.to(socketId).emit('pesan', name);

    // socket.join(socketId);
    // let datas = [name, socket.id]
    connection.query(
      "SELECT COUNT(*) AS rcount FROM usr_auth_log where ?", {name : name},
      function (err, rows, field) {
        if (err) throw err; 
        if (rows[0].rcount > 0) {
            connection.query("UPDATE usr_auth_log set ? where ?",[{socket:socket.id}, {name:name} ],  function(err, rows, field){
                if(err) throw err;
            })
        } else {
            let datalog = [name, socket.id]
            connection.query("INSERT INTO usr_auth_log (name, socket) VALUES(?,?)", datalog,  function(err, rows, field){
                if(err) throw err;
            })
        }
        
        // console.log(rows[0].rcount);
      }
    );

    console.log("user has been connect " + socketId);

    // callback();
  });

  socket.on("send", ({ name, message, room }) => {
    console.log(name, message, room);

    // io.emit('accept', {name, message});
    socket.broadcast.to(room).emit("accept", { name, type: "chat", message });
  });

  socket.on("disconnect", () => {
    connection.query(
        "SELECT * from usr_auth_log where ?",
        { socket: socket.id },
        function (err, rows, field) {
          if (err) throw err;
          let name = rows[0].name;
        //   console.log(name);
        //   console.log();
          connection.query(
              "DELETE from usr_auth_pos where ?",
              { usr: name },
              function (err, rows, field) {
                if (err) throw err;
                console.log(rows);
              }
            );
          connection.query(
              "DELETE from usr_auth_log where ?",
              { name: name},
              function (err, rows, field) {
                if (err) throw err;
                console.log(rows);
              }
            );
        }
      );
    console.log("user has been disconnect " + socket.id);
  });
});

app.use(router);
app.use(cors());

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
