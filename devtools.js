//ctrl + クリックで発火
document.addEventListener('mousedown', function(event){
  if(event.ctrlKey && event.button === 0){
    mainFunction();
  }
});

function getUrlLast(url) {
  const pathname = new URL(url).pathname;
  return pathname.substring(pathname.lastIndexOf('/') + 1);
}

let recordData = {};

chrome.devtools.network.onRequestFinished.addListener(request => {
  request.getContent((body) => {
    if(request.request && request.request.url){
      const urlLast = getUrlLast(request.request.url);

      // 任意のAPIのみ処理を開始
      const RECORD_KEYS = ["pilots", "farmers"];
      if(RECORD_KEYS.includes(urlLast)){
        const bodyObj = JSON.parse(body);
        if(!recordData.urlLast) recordData.urlLast = {};

        switch(urlLast){
          case "pilots":
            const responseArray = bodyObj.response;

            // レコード数が変わっている場合のみデータを更新
            if(Object.keys(recordData.urlLast).length != responseArray.length){
              for(const resObj of responseArray){
                recordData.urlLast[resObj.companyName] = resObj.companyId;
              }
            }
            break;

          case "farmers":
            const farmerInfoArray = bodyObj.response.farmerInfoList;

            // レコード数が変わっている場合のみデータを更新
            if(Object.keys(recordData.urlLast).length != farmerInfoArray.length){
              for(const resObj of farmerInfoArray){
                recordData.urlLast[resObj.companyName] = resObj.companyId;
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