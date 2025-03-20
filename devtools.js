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

chrome.devtools.network.onRequestFinished.addListener(request => {
  request.getContent((body) => {
    if(request.request && request.request.url){
      const urlLast = getUrlLast(request.request.url);
      if(urlLast == "pilots"){
        const bodyObj = JSON.parse(body);
        const responseArray = bodyObj.response;

        // const responseArray = JSON.stringify(bodyObj.response);
        chrome.devtools.inspectedWindow.eval(
          'console.log("' + responseArray + '")'
        );
      }

    }
  });
});