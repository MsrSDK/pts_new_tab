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

    return elements[0];
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

    const tbodyEle = getElement();
    const requestFirstKey = Object.keys(request.message)[0];
    const dataList = request.message[requestFirstKey];

    trArray = tbodyEle.getElementsByTagName('tr');
    for(const tr of trArray) {
      const tdArray = tr.getElementsByTagName('td');
      if(tdArray[0].textContent in dataList){

        const currentUrl = window.location.href;
        const link = document.createElement('a');
        link.href = currentUrl + '/' + dataList[tdArray[0].textContent];
        link.textContent = tdArray[0].textContent;
        link.addEventListener('click', function(event) {
          event.stopPropagation(); // バブリングを停止
        });

        tdArray[0].textContent = '';
        tdArray[0].appendChild(link);
      }
    }
  }
  return;
});
