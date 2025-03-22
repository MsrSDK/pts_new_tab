function getElement(){
  const elements = document.getElementsByTagName('tbody');

  if (elements.length > 0) {
    // 変更を監視するオブザーバーのオプション
    const config = { childList: true };
    // 変更が発見されたときに実行されるコールバック関数
    const callback = (mutationList, observer) => {
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
  const tbodyEle = getElement();
  const requestFirstKey = Object.keys(message)[0];
  const dataHash = message[requestFirstKey];
  const currentUrl = window.location.href;

  trArray = tbodyEle.getElementsByTagName('tr');
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

// 最新のレコードをdevtoolsから取得
function fetchRecordData() {
  const message = { "action": "fetchRecordData" }
  chrome.runtime.sendMessage(message, function(response) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    console.log("バックエンドからの応答:",response);

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

    // テーブルによっては対象文字列が1番目ではない
    for(let i = 0; i < 3; i++) {
      replaceTdItem(request.message, i);
    }
  }
  return;
});
