// see README.md for TODO

var playerSVGpaused = false
var namedCheckpoints = {'cube':8, 'controller':32, 'position':56, 'interaction':86}
var stepTime = 100
var opacityHide = 0.1
var opacityShow = 1
var scaleFactor = 4/10
var animationEnded = false
// should be parametrable via URL

var restartId = "#restartButton"
var interfaceId = "#svgPlayerInterface"
var playerButtonId = "#svgPlayerButton"
var svgId = "#svg1"
// assuming target opacity, correct for Moleskin
// should in fact index and restore for other use cases

document.querySelector(svgId).addEventListener("load", function() {
  setupInterface()

  var doc = this.getSVGDocument();
  // via https://stackoverflow.com/questions/4476526/do-i-use-img-object-or-embed-for-svg-files
  doc.addEventListener('click', function() {
    togglePause();
  });
  lowerOpacitySVG()

  if (window.location.hash) { 
    var target = window.location.hash.replace(/#/,'')
    jumpStroke( target )
  }
  var paths = doc.querySelectorAll("path")
  function displayLatestPath(){
    if (playerSVGpaused) return
    var firstNotFound = true
    paths.forEach( (p, idx) => {
      if (firstNotFound && p.getAttribute("stroke-opacity") == opacityHide ){
        if (document.querySelector('#respectCheckpoints').checked && checkpointPresent(idx) ){ 
          togglePause()
        }
        p.setAttribute("stroke-opacity", opacityShow)
        firstNotFound = false
        checkEnd(idx, paths.length-1)
      }
    });
  }
  setInterval( displayLatestPath, stepTime )
  
  document.addEventListener("keydown", function(event) {
    if (event.which == 32) togglePause();
  })
});

function checkpointPresent(idx){
  var present = false
  Object.keys(namedCheckpoints).forEach( (key,prop) => {
    if (idx == namedCheckpoints[key]) present = true
  })
  return present
}

function checkEnd(idx, max){
    if (idx == max) { 
      animationEnded = true
      document.querySelector(playerButtonId).disabled = true
      pauseAnimation() 
    } else {
      animationEnded = false
      document.querySelector(playerButtonId).disabled = false
    }
}

function jumpStroke(targetStroke){
  if (!namedCheckpoints[targetStroke]) return
  location.hash = targetStroke;
  pauseAnimation()
  lowerOpacitySVG()
  var doc = document.querySelector(svgId).getSVGDocument();
  var paths = doc.querySelectorAll("path")
  paths.forEach( (p, idx) => {
      if (idx <= namedCheckpoints[targetStroke] && p.getAttribute("stroke-opacity") == opacityHide ){
        p.setAttribute("stroke-opacity", opacityShow)
        checkEnd(idx, paths.length-1)
      }
    });
}

function lowerOpacitySVG(){
  var doc = document.querySelector(svgId).getSVGDocument();
  doc.querySelectorAll("path").forEach( p => {
    p.setAttribute("transform", "scale("+scaleFactor+")")
    p.setAttribute("stroke-opacity", opacityHide);
  });
}

function setupInterface(){
  var interfaceEl = document.querySelector(interfaceId)
  var spanEl = document.createElement('span')
  spanEl.innerText = '(at strokes '
  interfaceEl.appendChild(spanEl)
  Object.keys(namedCheckpoints).forEach( (key,prop) => {
    var chkptEl = document.createElement('span')
    chkptEl.innerText = namedCheckpoints[key] + ':' + key
    chkptEl.style.textDecoration = 'underline'
    chkptEl.style.marginRight = '5px'
    chkptEl.setAttribute('href', key)
    interfaceEl.appendChild(chkptEl)
    chkptEl.addEventListener("click", function(){
      jumpStroke( this.getAttribute('href') )
    }, false);
  })
  var spanEl = document.createElement('span')
  spanEl.innerText = ')'
  interfaceEl.appendChild(spanEl)
}

function togglePause(){
  var element = document.querySelector(playerButtonId)
  if (playerSVGpaused)
    element.innerText = "Pause"
  else
    element.innerText = "Play"
  playerSVGpaused = !playerSVGpaused
}

function pauseAnimation(){
  var element = document.querySelector(playerButtonId)
  element.innerText = "Play"
  playerSVGpaused = true
  
}

function restartAnimation(){
  lowerOpacitySVG()
  pauseAnimation()
  document.querySelector(playerButtonId).disabled = false
}