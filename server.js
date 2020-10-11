const express = require('express');
const app = express();

// socket.ioを使う準備
const server = require("http").Server(app); // ソケット通信用のサーバーを立てるためにhttpを読み込み、Server関数にappを渡す
const io = require('socket.io')(server); // socket.io側にどのサーバーで通信を行うか、serverを渡して知らせる

// server起動
server.listen(process.env.PORT || 3030);

// ejsをviewのテンプレートエンジンとして設定
app.set('view engine', "ejs");

// css/jsなどの静的ファイルへのパスを通す
app.use(express.static('public')); // publicが静的ファイルのディレクトリとなる

// room.jsをレンダリング localhost:3030
app.get('/', (req, res) => {
  res.render('room');
});
