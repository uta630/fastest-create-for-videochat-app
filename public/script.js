const socket = io('/'); // socket.ioがサーバーでセットしたlocalhost3030のルートパスとコネクトする
const userId = 12345; // 仮のID

// サーバーへのイベントの送信
// join-roomはサーバーで設定したイベント名
// ROOM_ID : サーバーから渡されたオブジェクトを代入した定数をここで使用
// userId : 仮のIDを使用
socket.emit('join-room', ROOM_ID, userId); // socket.on('join-room'...のclgに紐づく

// user-connectedイベントの時に実行するアクション
socket.on('user-connected', userId => {
  console.log(userId)
})