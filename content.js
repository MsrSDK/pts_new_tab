
document.addEventListener('load', (event) => { getElement(); }, true);

function getElement(){
  const elements = document.getElementsByTagName('tbody');

  if (elements.length > 0) {
    console.log(elements[0]);
  } else {
    // 要素が存在しない場合の処理
    console.log('要素が見つかりませんでした。');
  }
}
