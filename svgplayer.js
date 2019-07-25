/* globals playerSVGpaused namedCheckpoints segments stepTime opacityHide opacityShow scaleFactor animationEnded totalPoints timeline videoAnnotation */
// see README.md for TODO

var restartId = "#restartButton"
var interfaceId = "#svgPlayerInterface"
var playerButtonId = "#svgPlayerButton"
var checkpointsId = "#checkpoints"
var svgId = "#svg1"
// assuming target opacity, correct for Moleskin
// should in fact index and restore for other use cases

var svgparts
var visualTimelineAvailable = false
var videoAnnotationAvailable = false
var lastStrokeTested = 0

if (typeof vis !== "undefined") visualTimelineAvailable = true
if (typeof videoAnnotation !== "undefined") videoAnnotationAvailable = true

var currentUrl = new URLSearchParams(window.location.search)
var url = currentUrl.get('url')
console.log(url)
if (url) document.querySelector(svgId).data = url

if (document.querySelector(svgId)) document.querySelector(svgId).addEventListener("load", function() {
  
  setupInterface()

  var doc = this.getSVGDocument();
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
  if (visualTimelineAvailable) timeline.setCustomTime(0)

  if (window.location.hash) { 
    var target = window.location.hash.replace(/#/,'')
    jumpStroke( target )
  }
  function displayLatestPath(){
    if (playerSVGpaused) return
    
    svgparts.forEach( (p, idx) => {
        if (idx > lastStrokeTested) return
      
        if (visualTimelineAvailable && !document.querySelector('#additive').checked) {
          var segment = inSegment(idx)
          if (segment) lowerOpacitySVGuntilStroke(segments[segment].start)
        }
        p.setAttribute("opacity", opacityShow)
        if (document.querySelector('#respectCheckpoints').checked && checkpointPresentNext(idx, lastStrokeTested) ){ 
          togglePause()
        }
        if (visualTimelineAvailable) timeline.setCustomTime(idx)
        checkEnd(idx, svgparts.length-1)

    });
    lastStrokeTested++

  }
  
  setInterval( displayLatestPath, stepTime )
  
  document.addEventListener("keydown", function(event) {
    if (event.which == 32) togglePause();
  })
});


function inSegment(idx){
  var present = false
  Object.keys(segments).forEach( (key,prop) => {
    if (idx >= segments[key].start && idx < segments[key].end) present = key
  })
  return present
}

function checkpointPresentNext(idx, lastStrokeTested){
  var present = false
  Object.keys(namedCheckpoints).forEach( (key,prop) => {
    if (idx == namedCheckpoints[key] && idx >= lastStrokeTested) present = true
  })
  return present
}

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
      if (visualTimelineAvailable) timeline.setCustomTime(max+1)
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
      if (visualTimelineAvailable) timeline.setCustomTime(idx)
      checkEnd(idx, svgparts.length-1)
    }
  });
  
  if (videoAnnotationAvailable){
    var targetTime = videoAnnotation.timecodes.filter( (e) => { return (e.checkpoint == targetStroke) })[0]
    if (targetTime) document.querySelector('#'+videoAnnotation.id).currentTime = targetTime.timecode
  }
}

function segmentStroke(start, end){
  pauseAnimation()
  lowerOpacitySVG()
  
  svgparts.forEach( (p, idx) => {
    if (idx > start && idx <= end && p.getAttribute("opacity") == opacityHide ){
      p.setAttribute("opacity", opacityShow)
      if (visualTimelineAvailable) timeline.setCustomTime(idx)
      checkEnd(idx, svgparts.length-1)
    }
  });
}

function addSegmentStroke(start, end){
  pauseAnimation()
  
  svgparts.forEach( (p, idx) => {
    if (idx > start && idx <= end && p.getAttribute("opacity") == opacityHide ){
      p.setAttribute("opacity", opacityShow)
      if (visualTimelineAvailable) timeline.setCustomTime(idx)
      checkEnd(idx, svgparts.length-1)
    }
  });
}

function lowerOpacitySVGuntilStroke(max){
  svgparts.forEach( (p, idx) => {
    if (idx <= max) p.setAttribute("opacity", opacityHide);
  });   
}

function lowerOpacitySVG(){
  svgparts.forEach( p => {
    p.setAttribute("opacity", opacityHide);
  });   
}

function rescale(){
  svgparts.forEach( p => {
    p.setAttribute("transform", "scale("+scaleFactor+")")
  });   
}

function setupInterface(){
  var checkpointsEl = document.querySelector(checkpointsId)
  checkpointsEl.innerHTML = ''
  var spanEl = document.createElement('span')
  spanEl.innerText = '(at strokes '
  checkpointsEl.appendChild(spanEl)
  Object.keys(namedCheckpoints).forEach( (key,prop) => {
    var chkptEl = document.createElement('span')
    chkptEl.innerText = namedCheckpoints[key] + ':' + key
    chkptEl.style.textDecoration = 'underline'
    chkptEl.style.marginRight = '5px'
    chkptEl.setAttribute('href', key)
    checkpointsEl.appendChild(chkptEl)
    chkptEl.addEventListener("click", function(){
      jumpStroke( this.getAttribute('href') )
    }, false);
  })
  var spanEl = document.createElement('span')
  spanEl.innerText = ')'
  checkpointsEl.appendChild(spanEl)
}

function togglePause(){
  var element = document.querySelector(playerButtonId)
  if (playerSVGpaused){
    element.innerText = "Pause"
    //if (videoAnnotationAvailable) document.querySelector('#'+videoAnnotation.id).pause()
  } else {
    element.innerText = "Play"
    //if (videoAnnotationAvailable) document.querySelector('#'+videoAnnotation.id).pause()
  }
  playerSVGpaused = !playerSVGpaused
}

function pauseAnimation(){
  var element = document.querySelector(playerButtonId)
  element.innerText = "Play"
  playerSVGpaused = true
  
}

function restartAnimation(){
  lastStrokeTested = 0
  if (visualTimelineAvailable) timeline.setCustomTime(0)
  if (videoAnnotationAvailable) document.querySelector('#'+videoAnnotation.id).currentTime = 0
  lowerOpacitySVG()
  pauseAnimation()
  document.querySelector(playerButtonId).disabled = false
}