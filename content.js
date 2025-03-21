// ページ利ロード時に発火
document.addEventListener('load', (event) => { getElement(); }, true);


function getElement(){
  const elements = document.getElementsByTagName('tbody');
  const message = { "action": "getRecordData" }

  if (elements.length > 0) {
    chrome.runtime.sendMessage(message, function(response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      console.log("バックエンドからの応答:", response);
    });
  } else {
    // 要素が存在しない場合の処理
    console.log('要素が見つかりませんでした。');
  }
}
