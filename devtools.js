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
      const RECORD_KEYS = ["companies/pilots", "companies/farmers", "spraying-projects/list", "spraying-plans/all"];
      if(RECORD_KEYS.includes(urlLast)){
        const bodyObj = JSON.parse(body);
        if(!recordData.urlLast) recordData.urlLast = {};

        switch(urlLast){
          case "companies/pilots":
            const responseArray = bodyObj.response;

            // レコード数が変わっている場合のみデータを更新
            if(Object.keys(recordData.urlLast).length != responseArray.length){
              for(const resObj of responseArray){
                recordData.urlLast[resObj.companyName] = resObj.companyId;
              }
            }
            break;

          case "companies/farmers":
            const farmerInfoArray = bodyObj.response.farmerInfoList;

            // レコード数が変わっている場合のみデータを更新
            if(Object.keys(recordData.urlLast).length != farmerInfoArray.length){
              for(const resObj of farmerInfoArray){
                recordData.urlLast[resObj.companyName] = resObj.companyId;
              }
            }
            break;

            case "spraying-projects/list":  //案件
              const sprayingProjectsArray = bodyObj.response;

              // レコード数が変わっている場合のみデータを更新
              if(Object.keys(recordData.urlLast).length != sprayingProjectsArray.length){
                for(const resObj of sprayingProjectsArray){
                  recordData.urlLast[resObj.name] = resObj.ulid;
                }
              }
              break;

            case "spraying-plans/all":  //散布計画
              const sprayingPlansArray = bodyObj.response.result;

              // レコード数が変わっている場合のみデータを更新
              if(Object.keys(recordData.urlLast).length != sprayingPlansArray.length){
                for(const resObj of sprayingPlansArray){
                  recordData.urlLast[resObj.name] = resObj.id;
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