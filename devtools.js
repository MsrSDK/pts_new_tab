//ctrl + クリックで発火
document.addEventListener('mousedown', function(event){
  if(event.ctrlKey && event.button === 0){
    mainFunction();
  }
});

function getUrlLast(url) {
  const pathname = new URL(url).pathname;
  const match = pathname.match(/v1\/(.*)/);
  if(match && match[1]){
    chrome.devtools.inspectedWindow.eval(
      'console.table("' + match[1] + '")'
    );
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
        //"companies/pilots/users",   // パイロット一覧
        "spraying-plans/all",       // 散布計画
        "spraying-projects/list",   // 案件一覧, アサイン
      ];
      if(RECORD_KEYS.includes(urlLast)){
        const bodyObj = JSON.parse(body);
        if(!recordData.urlLast) recordData.urlLast = {};

        switch(urlLast){
          case "companies/farmers":
            const farmerInfoArray = bodyObj.response.farmerInfoList;

            if(Object.keys(recordData.urlLast).length != farmerInfoArray.length){
              for(const resObj of farmerInfoArray){
                recordData.urlLast[resObj.companyName] = resObj.companyId;
              }
            }
            break;

          case "companies/pilots":
            const responseArray = bodyObj.response;

            if(Object.keys(recordData.urlLast).length != responseArray.length){
              for(const resObj of responseArray){
                recordData.urlLast[resObj.companyName] = resObj.companyId;
              }
            }
            break;

            case "spraying-plans/all":
              const sprayingPlansArray = bodyObj.response.result;

              if(Object.keys(recordData.urlLast).length != sprayingPlansArray.length){
                for(const resObj of sprayingPlansArray){
                  recordData.urlLast[resObj.name] = resObj.id;
                }
              }
              break;

            case "spraying-projects/list":
              const sprayingProjectsArray = bodyObj.response;

              if(Object.keys(recordData.urlLast).length != sprayingProjectsArray.length){
                for(const resObj of sprayingProjectsArray){
                  recordData.urlLast[resObj.name] = resObj.ulid;
                }
              }
              break;
        }
        chrome.devtools.inspectedWindow.eval(
          'console.table("' + Object.keys(recordData.urlLast) + '")'
        );
      }
    }
  });
});