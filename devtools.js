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
      if(urlLast == "pilots"){
        const bodyObj = JSON.parse(body);
        const responseArray = bodyObj.response;

        if(!recordData.urlLast) recordData.urlLast = {};
        // レコード数が変わっている場合のみデータを更新
        if(Object.keys(recordData.urlLast).length != responseArray.length){
          for(const resObj of responseArray){

            switch(urlLast){
              case "pilots":
                recordData.urlLast[resObj.companyName] = resObj.companyId;
                break;
            }

            chrome.devtools.inspectedWindow.eval(
              'console.table("' + recordData.urlLast[resObj.companyName] + '")'
            );
          }
        }
      }

    }
  });
});