// content_scriptからのリクエストにレコードを送信
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "fetchRecordData") {
    sendResponse(recordData);  // 応答を送信
  }
});

// URLの変化(APIの実行)をトリガーとしてcontent_scriptにレコードを送信
function sendRecord() {
  // 現在アクティブなタブを取得
  chrome.tabs.query( {active:true, currentWindow:true}, function(tabs){
    // レコードを送信
    chrome.tabs.sendMessage(tabs[0].id, {action: 'sendRecordData', message: recordData});
  });
};

function getUrlLast(url) {
  const pathname = new URL(url).pathname;
  const match = pathname.match(/v1\/(.*)/);
  if(match && match[1]){
    return match[1];
  }
}

let recordData = {};

chrome.devtools.network.onRequestFinished.addListener(request => {
  request.getContent((body) => {
    if(request.request && request.request.url){
      const urlLast = getUrlLast(request.request.url);

      // 任意のAPIのみ処理を開始
      const RECORD_KEYS = [
        "companies/farmers",        // 共同防除発注母体一覧
        "companies/pilots",         // パイロット企業一覧
        "companies/pilots/users",   // パイロット一覧
        "spraying-plans/all",       // 散布計画
        "spraying-projects/list",   // 案件一覧, アサイン
      ];
      if(RECORD_KEYS.includes(urlLast)){
        const bodyObj = JSON.parse(body);
        recordData = {};
        recordData[urlLast] = {};

        switch(urlLast){
          case "companies/farmers":
            const farmerInfoArray = bodyObj.response.farmerInfoList;

            for(const resObj of farmerInfoArray){
              recordData[urlLast][resObj.companyName] = resObj.companyId;
            }
            sendRecord();
            break;

          case "companies/pilots":
            const responseArray = bodyObj.response;

            for(const resObj of responseArray){
              recordData[urlLast][resObj.companyName] = resObj.companyId;
            }
            sendRecord();
            break;

          case "companies/pilots/users":
            const pilotsUserArray = bodyObj.response;

            // パイロット一覧は企業ごとに存在するので保存方法を変更
            // POSTのpayloadからcompanyIdを取得
            const companyId = JSON.parse(request.request.postData.text)["pilotCompanyId"].toString();
            recordData[urlLast][companyId] = {};
            for(const resObj of pilotsUserArray){
              recordData[urlLast][companyId][resObj.user.userName] = resObj.user.uuid;
            }
            sendRecord();
            break;

          case "spraying-plans/all":
            const sprayingPlansArray = bodyObj.response.result;

            for(const resObj of sprayingPlansArray){
              recordData[urlLast][resObj.name] = resObj.id;
            }
            sendRecord();
            break;

          case "spraying-projects/list":
            const sprayingProjectsArray = bodyObj.response;

            for(const resObj of sprayingProjectsArray){
              recordData[urlLast][resObj.name] = resObj.ulid;
            }
            sendRecord();
            break;
        }
      }
    }
  });
});