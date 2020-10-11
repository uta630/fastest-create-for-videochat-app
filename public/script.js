const socket = io('/'); // socket.ioがサーバーでセットしたlocalhost3030のルートパスとコネクトする
const myPeer = new Peer(); // WebRTCを利用したP2P通信が簡単に実装できるライブラリ

// Peerオブジェクトは生成時、ランダムなIDが付与されます, ここではuserId
myPeer.on('open', userId => {
  // サーバーへのイベントの送信
  // join-roomはサーバーで設定したイベント名
  // ROOM_ID : サーバーから渡されたオブジェクトを代入した定数をここで使用
  // userId : 仮のIDを使用
  socket.emit('join-room', ROOM_ID, userId); // socket.on('join-room'...のclgに紐づく
});

// user-connectedイベントの時に実行するアクション
socket.on('user-connected', userId => {
  console.log(userId)
})