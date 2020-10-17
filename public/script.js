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

// 新しいユーザーが接続されたら実行する関数
const connectToNewUser = (userId, stream) => {
  const call = myPeer.call(userId, stream); // callで自分の情報を渡すことで、指定したuserIdに紐づくpeerに対してvideo情報を送信できる
  const video = document.createElement('video'); // 受信したvideoんも生成
  video.muted = true;

  // streamイベントで受信
  // 送信したcall（上で定義した定数で呼んでるcall）に対して相手の応答があった場合
  // 相手のstream情報が返ってくる = userVideoStream
  call.on('stream', (userVideoStream) => {
    // 受け取ったstream情報を渡してvideoを出力
    addVideoStream(video, userVideoStream);
  });

  // videoのコネクトが切断された時（close）にvideoを取り除く
  call.on('close', () => {
    video.remove(); // videoの取り除き
  });
};

// getUserMedia API : ユーザーの使用しているデバイスのメディアを取得
// optionでvideo/audioの取得を指定することで、ビデオデータとオーディオを取得
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((stream) => { // promise関数なのでthenで返り値を取得, 引数に動画情報が入る
  // メディアを取得できたらvideoを出力
  addVideoStream(myVideo, stream);

  // 応答処理
  myPeer.on("call", (call) => {
    // 既存ユーザーに新規ユーザーのstreamを追加
    call.answer(stream);

    // 新規ユーザーに既存ユーザーのstreamを追加
    const video = document.createElement('video');
    video.muted = true;
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  });

  // user-connectedイベントの時に実行するアクション
  socket.on('user-connected', (userId) => {
    console.log('user-connected')
    connectToNewUser(userId, stream);
  });
});

// Peerオブジェクトは生成時、ランダムなIDが付与されます, ここではuserId
myPeer.on('open', userId => {
  // サーバーへのイベントの送信
  // join-roomはサーバーで設定したイベント名
  // ROOM_ID : サーバーから渡されたオブジェクトを代入した定数をここで使用
  // userId : 仮のIDを使用
  socket.emit('join-room', ROOM_ID, userId); // socket.on('join-room'...のclgに紐づく
});
