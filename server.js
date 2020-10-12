const express = require('express');
const app = express();

// socket.ioを使う準備
const server = require("http").Server(app); // ソケット通信用のサーバーを立てるためにhttpを読み込み、Server関数にappを渡す
const io = require('socket.io')(server); // socket.io側にどのサーバーで通信を行うか、serverを渡して知らせる

// uuid = ランダムのIDを生成してくれるパッケージ
const { v4: uuidV4 } = require('uuid'); // v4をuuidV4にリネーム

// server起動
server.listen(process.env.PORT || 3030);

// ejsをviewのテンプレートエンジンとして設定
app.set('view engine', "ejs");

// css/jsなどの静的ファイルへのパスを通す
app.use(express.static('public')); // publicが静的ファイルのディレクトリとなる

// room.jsをレンダリング localhost:3030
app.get('/', (req, res) => {
  // res.render('room');
  res.redirect(`/${uuidV4()}`); // uuidV4()を使って、ランダムなIDを付与したページにリダイレクトさせる
});

// :roomで、uuidV4で生成されたリダイレクト先をレンダリング
app.get('/:room', (req, res) => {
  // 第２引数のroomIdでuuidのidを取得 → ejs（テンプレート）で取得
  res.render('room', { roomId: req.params.room });
})

// ユーザーが接続されるたびに走るイベントハンドラ
io.on('connection', socket => { // connection : イベント名
  // ルームにユーザーが入ってきたときのイベント
  // join-room = イベント名
  socket.on('join-room', (roomId, userId) => {
    console.log({roomId, userId}); // serverのログに出力される

    socket.join(roomId); // roomへの入室, 新規ユーザーの追加
    socket
      .to(roomId) // roomを設定
      .broadcast // 送信元以外のクライアントに送信する設定
      .emit('user-connected', userId); // user-connected : イベント名, userId : 送信データ
  })
})
