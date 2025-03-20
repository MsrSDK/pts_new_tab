//ctrl + クリックで発火
document.addEventListener('mousedown', function(event){
  if(event.ctrlKey && event.button === 0){
    mainFunction();
  }
});

