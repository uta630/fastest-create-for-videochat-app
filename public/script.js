const socket = io('/'); // socket.ioがサーバーでセットしたlocalhost3030のルートパスとコネクトする
const myPeer = new Peer(); // WebRTCを利用したP2P通信が簡単に実装できるライブラリ（http://yankee.cv.ics.saitama-u.ac.jp/~kunolab/yoshimi/peerjs-master/docs/）

// videoタグ生成
const myVideo = document.createElement('video');
myVideo.muted = true; // 自分の声がデバイスから反射するのを防ぐ
const videoWrap = document.getElementById('video-wrap'); // videoの出力先DOMのID

// ユーザーごとにpeer情報を含むメディアアクションを保存する
const peers = {};

// 制御関数からvideoStreamにアクセスできるように変数を定義しておく（あとで情報を代入する）
let myVideoStream;

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

  // 切断処理用 : 新規ユーザーのメディア情報はcallで受け取っているので代入
  peers[userId] = call;
};

// getUserMedia API : ユーザーの使用しているデバイスのメディアを取得
// optionでvideo/audioの取得を指定することで、ビデオデータとオーディオを取得
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((stream) => { // promise関数なのでthenで返り値を取得, 引数に動画情報が入る
  // stream情報の代入
  myVideoStream = stream;

  // メディアを取得できたらvideoを出力
  addVideoStream(myVideo, stream);

  // 応答処理
  myPeer.on("call", (call) => {
    // 既存ユーザーに新規ユーザーのstreamを追加
    call.answer(stream);

    // 新規ユーザーに既存ユーザーのstreamを追加
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });

    // 切断処理用 : 自身のメディア情報はcallで受け取っているので代入
    const userId = call.peer;
    peers[userId] = call;
  });

  // user-connectedイベントの時に実行するアクション
  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
  });
});

// user-disconnectedイベント
socket.on('user-disconnected', (userId) => {
    if(peers[userId]) peers[userId].close() ; // close() : コネクションの削除（video画面ごと削除される）
});

// Peerオブジェクトは生成時、ランダムなIDが付与されます, ここではuserId
myPeer.on('open', userId => {
  // サーバーへのイベントの送信
  // join-roomはサーバーで設定したイベント名
  // ROOM_ID : サーバーから渡されたオブジェクトを代入した定数をここで使用
  // userId : 仮のIDを使用
  socket.emit('join-room', ROOM_ID, userId); // socket.on('join-room'...のclgに紐づく
});

myPeer.on('disconnected', (userId) => {
  console.log({userId})
});

//** 以下でビデオの制御に使うボタン用の関数を定義 ** //
// - 音声制御用関数
// videoStreamに含まれるaudioTracksのon/offをbooleanで制御
// 受け取ったDOMに対しては、classを付け外しして表示切替
const muteUnmute = (e) => {
  // getAudioTracks : オーディオトラックを取得
  // enabled : 音声の可否をbooleanで制御
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    e.classList.add('active');
    myVideoStream.getAudioTracks()[0].enabled = false;
  } else {
    e.classList.remove('active');
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

// - ビデオ制御用 : getAudioTracks -> getVideoTracks だけ
const playStop = (e) => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    e.classList.add('active');
    myVideoStream.getVideoTracks()[0].enabled = false;
  } else {
    e.classList.remove('active');
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

// 接続解除用関数
const leaveVideo = (e) => {
  // 接続解除
  socket.disconnect();
  myPeer.disconnect();

  // <video>の削除
  const videos = document.getElementsByTagName('video');
  for (let i = videos.length - 1; i >= 0; --i) {
    videos[i].remove();
  }
};
