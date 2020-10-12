const socket = io('/'); // socket.ioがサーバーでセットしたlocalhost3030のルートパスとコネクトする
const myPeer = new Peer(); // WebRTCを利用したP2P通信が簡単に実装できるライブラリ（http://yankee.cv.ics.saitama-u.ac.jp/~kunolab/yoshimi/peerjs-master/docs/）

// videoタグ生成
const myVideo = document.createElement('video');
myVideo.muted = true; // 自分の声がデバイスから反射するのを防ぐ
const videoWrap = document.getElementById('video-wrap'); // videoの出力先DOMのID

// <video>に受け取ったストリームを追加する関数
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  // メタデータ読み込まれたときの処理, loadedmetadata = イベント名
  video.addEventListener('loadedmetadata', () => {
    video.play(); // videoの再生を実行
  });

  videoWrap.append(video); // videoの出力
};

// getUserMedia API : ユーザーの使用しているデバイスのメディアを取得
// optionでvideo/audioの取得を指定することで、ビデオデータとオーディオを取得
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((stream) => { // promise関数なのでthenで返り値を取得, 引数に動画情報が入る
  // メディアを取得できたらvideoを出力
  addVideoStream(myVideo, stream);
})

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