function getElement(){
  const elements = document.getElementsByTagName('tbody');
  const message = { "action": "getRecordData" }

  if (elements.length > 0) {
    chrome.runtime.sendMessage(message, function(response) {
      if (chrome.runtime.lastError) {
        // console.error(chrome.runtime.lastError);
        return;
      }
      console.log("バックエンドからの応答:", response);

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
    });
  } else {
    // 要素が存在しない場合の処理
    console.log('要素が見つかりませんでした。');
  }
}

// ページリロード時に発火
document.addEventListener('load', (event) => { getElement(); }, true);
