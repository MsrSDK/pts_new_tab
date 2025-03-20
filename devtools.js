//ctrl + クリックで発火
document.addEventListener('mousedown', function(event){
  if(event.ctrlKey && event.button === 0){
    mainFunction();
  }
});

chrome.devtools.network.onRequestFinished.addListener(request => {
  chrome.devtools.inspectedWindow.eval(
    'console.log("' + request.request.url + '")'
  );
});