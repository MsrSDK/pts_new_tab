let tbodyElement = [];

function getTbodyElement(){
  const elements = document.getElementsByTagName('tbody');

  if (elements.length > 0) {
    const config = { childList: true }; // 変更を監視するオブザーバーのオプション
    // 変更が発見されたときに実行されるコールバック関数
    const callback = (mutationList, observer) => {
      observer.disconnect();  // 既存の監視を停止

      if (mutationList[0].type === "childList") {
        console.log("子ノードが追加または削除されました。");
        // テーブルのページが変わるとき
        fetchRecordData();
      }
    };

    // コールバック関数に結びつけられたオブザーバーのインスタンスを生成
    const observer = new MutationObserver(callback);
    // 対象ノードの設定された変更の監視を開始
    observer.observe(elements[0], config);

    return elements[0];
  } else {
    // 要素が存在しない場合の処理
    console.log('tbody要素が見つかりませんでした。');
  }
}

// テーブル行内のi番目の文字列をリンクに置換
function replaceTdItem(message, i){
  // companies/pilots/usersはネストが1つ多いので処理を追加
  if(Object.keys(message)[0] == 'companies/pilots/users') {
    message = message['companies/pilots/users'];
  }
  const requestFirstKey = Object.keys(message)[0];
  const dataHash = message[requestFirstKey];
  const currentUrl = window.location.href;

  trArray = tbodyElement.getElementsByTagName('tr');
  for(const tr of trArray) {
    const tdArray = tr.getElementsByTagName('td');
    const tdText = tdArray[i].textContent;
    if(tdText in dataHash){

      const link = document.createElement('a');
      link.href = currentUrl + '/' + dataHash[tdText];
      link.textContent = tdText;
      link.addEventListener('click', function(event) {
        event.stopPropagation(); // バブリングを停止
      });

      tdArray[i].textContent = '';
      tdArray[i].appendChild(link);
    }
  }
}

// 現在のURLの末尾の文字列を取得
function getCurrentUrlLast(){
  const currentUrl = window.location.href;
  const lastSlashIndex = currentUrl.lastIndexOf('/');
  if (lastSlashIndex !== -1 && lastSlashIndex < currentUrl.length - 1) {
    const lastPart = currentUrl.substring(lastSlashIndex + 1);
    return lastPart;
  }
}

// 最新のレコードをdevtoolsから取得
function fetchRecordData() {
  const message = { "action": "fetchRecordData" }
  chrome.runtime.sendMessage(message, function(response) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    console.log("バックエンドからの応答:",response);

    // 案件>アサイン画面の場合は処理を実行しない
    const urlLastPart = getCurrentUrlLast();
    if(urlLastPart == 'spraying-project-assign') return;

    tbodyElement = getTbodyElement();
    // テーブルによっては対象文字列が1番目ではない
    for(let i = 0; i < 3; i++) {
      replaceTdItem(response, i);
    }
  });
}

// devtoolsからのレコードを受け取り
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "sendRecordData") {
    console.log("レコードを受け取りました: ", request.message);

    // 案件>アサイン画面の場合は処理を実行しない
    const urlLastPart = getCurrentUrlLast();
    if(urlLastPart == 'spraying-project-assign') return;

    tbodyElement = getTbodyElement();
    // テーブルによっては対象文字列が1番目ではない
    for(let i = 0; i < 3; i++) {
      replaceTdItem(request.message, i);
    }
  }
  return;
});
