// see README.md for TODO

var restartId = "#restartButton"
var interfaceId = "#svgPlayerInterface"
var playerButtonId = "#svgPlayerButton"
var svgId = "#svg1"
// assuming target opacity, correct for Moleskin
// should in fact index and restore for other use cases

var svgparts

if (document.querySelector(svgId)) document.querySelector(svgId).addEventListener("load", function() {
  
  setupInterface()

  var doc = this.getSVGDocument();
  console.log()
  if (doc.children[0].getAttribute('viewBox') && !doc.children[0].getAttribute('baseProfile')){ // Surface source
    svgparts = [...doc.children[0].children[0].children]
  } else { // Moleskine source
    svgparts = doc.querySelectorAll("path")
    rescale() // needed since there is no viewBox defined in the SVG
  }
    
  // via https://stackoverflow.com/questions/4476526/do-i-use-img-object-or-embed-for-svg-files
  doc.addEventListener('click', function() {
    togglePause();
  });
  lowerOpacitySVG()

  if (window.location.hash) { 
    var target = window.location.hash.replace(/#/,'')
    jumpStroke( target )
  }
  function displayLatestPath(){
    if (playerSVGpaused) return
    var firstNotFound = true    
      
    svgparts.forEach( (p, idx) => {
      if (firstNotFound && p.getAttribute("opacity") == opacityHide ){
        if (document.querySelector('#respectCheckpoints').checked && checkpointPresent(idx) ){ 
          togglePause()
        }
        p.setAttribute("opacity", opacityShow)
        firstNotFound = false
        checkEnd(idx, svgparts.length-1)
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
  
  svgparts.forEach( (p, idx) => {
    if (idx <= namedCheckpoints[targetStroke] && p.getAttribute("opacity") == opacityHide ){
      p.setAttribute("opacity", opacityShow)
      checkEnd(idx, svgparts.length-1)
    }
  });
}

function lowerOpacitySVG(){
  svgparts.forEach( p => {
    //p.setAttribute("transform", "scale("+scaleFactor+")")
    p.setAttribute("opacity", opacityHide);
  });   
}

function rescale(){
  svgparts.forEach( p => {
    p.setAttribute("transform", "scale("+scaleFactor+")")
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