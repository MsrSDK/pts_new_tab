function getElement(){
  const elements = document.getElementsByTagName('tbody');

  if (elements.length > 0) {
    // 変更を監視するオブザーバーのオプション
    const config = { childList: true };
    // 変更が発見されたときに実行されるコールバック関数
    const callback = (mutationList, observer) => {
      if (mutationList[0].type === "childList") {
        console.log("子ノードが追加または削除されました。");
      }
    };

    // コールバック関数に結びつけられたオブザーバーのインスタンスを生成
    const observer = new MutationObserver(callback);
    // 対象ノードの設定された変更の監視を開始
    observer.observe(elements[0], config);
  } else {
    // 要素が存在しない場合の処理
    console.log('tbody要素が見つかりませんでした。');
  }
}

// 最新のレコードをdevtoolsから取得
function fetchRecordData() {
  const message = { "action": "fetchRecordData" }
  chrome.runtime.sendMessage(message, function(response) {
    if (chrome.runtime.lastError) {
      // console.error(chrome.runtime.lastError);
      return;
    }
    console.log("バックエンドからの応答:", response);
  });
}

// devtoolsからのレコードを受け取り
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "sendRecordData") {
    console.log("レコードを受け取りました: ", request.message);
    getElement();
  }
  return;
});
