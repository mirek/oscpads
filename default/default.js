
// We're using prototypejs - in your pads you may want to use other library
// like jQuery or pure Javascript, it's totally up to you.
document.observe('dom:loaded', function() {
  
  // Let's setup sliders
  $$('.osc-slider').each(function(e) { e.addEventListener("touchstart", OSCSlider.touchstart, false) })
  $$('.osc-slider').each(function(e) { e.addEventListener("touchmove",  OSCSlider.touchmove, false) })
  $$('.osc-slider').each(function(e) { e.addEventListener('mousedown',  OSCSlider.mousedown, true) })
  $$('.osc-slider').each(function(e) { e.addEventListener('mouseup',    OSCSlider.mouseup, true) })
  $$('.osc-slider').each(function(e) { e.addEventListener('mouseout',   OSCSlider.mouseout, true) })
  
  // Touch pad
  $$('.osc-touch').each(function(e) { e.addEventListener("touchstart", OSCTouch.touchstart, true) })
  $$('.osc-touch').each(function(e) { e.addEventListener("touchend",   OSCTouch.touchend, true) })
  $$('.osc-touch').each(function(e) { e.addEventListener('mousedown',  OSCTouch.mousedown, true) })
  $$('.osc-touch').each(function(e) { e.addEventListener('mouseup',    OSCTouch.mouseup, true) })
  $$('.osc-touch').each(function(e) { e.addEventListener('mouseout',   OSCTouch.mouseout, true) })
  
  // Wheels
  $$('.osc-wheel').each(function(e) { e.addEventListener('touchstart', OSCWheel.touchstart, false) })
  $$('.osc-wheel').each(function(e) { e.addEventListener('touchmove',  OSCWheel.touchmove, false) })
  $$('.osc-wheel').each(function(e) { e.addEventListener('mousedown',  OSCWheel.mousedown, true) })
  $$('.osc-wheel').each(function(e) { e.addEventListener('mouseup',    OSCWheel.mouseup, true) })
  $$('.osc-wheel').each(function(e) { e.addEventListener('mouseout',   OSCWheel.mouseout, true) })
  
  // Momentary push buttons
  $$('.osc-momentary').each(function(e) { e.addEventListener('touchstart', OSCMomentary.touchstart, true) })
  $$('.osc-momentary').each(function(e) { e.addEventListener('mousedown',  OSCMomentary.mousedown, true) })
  $$('.osc-momentary').each(function(e) { e.addEventListener('webkitAnimationEnd', OSCMomentary.webkitAnimationEnd, false ) })
  
  // ...and on/off buttons
  $$('.osc-on-off').each(function(e) { e.addEventListener('touchstart', OSCOnOff.touchstart, true) })
  $$('.osc-on-off').each(function(e) { e.addEventListener('mousedown',  OSCOnOff.mousedown, true) })
  
  // Print messages to console.log(...) if not running on iPhone/iPod/iPad
  if (!OSCpad.iOS())
    OSCpad.fetchPeriodically(1 / 30)
  
})

// Momentary buttons use counters, each click increments the counter.
// Normally it would make sense to send 'true' message followed by 'false' message for this
// type of buttons. This behaviour would not work with the current OSCpad implementation.
// Long story short - for the performance reasons - only the last 'false' message would be sent.
// See oscpad.js file, OSCpad.set(...) method for details.
var OSCMomentary = {
  
  mousedown: function(event) {
    event.preventDefault()
    with ($(event.target)) {
      var count = parseInt(getAttribute('data-osc-count'))
      count = isNaN(count) ? 1 : count + 1
      setAttribute('data-osc-count', count)
      removeClassName('osc-momentary-active')
      addClassName('osc-momentary-active')
      OSCpad.setIndex(event.target.getAttribute('data-osc-address'), count)
    }
  },
  
  touchstart: function(event) {
    return OSCMomentary.mousedown(event)
  },
  
  webkitAnimationEnd: function(event) {
    $(event.target).removeClassName('osc-momentary-active')
  }
  
}

// On off buttons
var OSCOnOff = {
  
  mousedown: function(event) {
    event.preventDefault()
    with ($(event.target)) {
      if (hasClassName('osc-on-off-active')) {
        removeClassName('osc-on-off-active')
        OSCpad.setBoolean(event.target.getAttribute('data-osc-address'), false)
      } else {
        addClassName('osc-on-off-active')
        OSCpad.setBoolean(event.target.getAttribute('data-osc-address'), true)
      }
    }
  },
  
  touchstart: function(event) {
    return OSCOnOff.mousedown(event)
  }
  
}

// Wheel implementation
var OSCWheel = {
  
  // Called from mousemove and touchmove functions
  // Options are:
  // * target
  // * pageX
  // * pageY
  move: function(options) {
    var bounds = options.target.getBoundingClientRect()
    var dx = options.pageX - (bounds.left + bounds.width / 2)
    var dy = options.pageY - (bounds.top + bounds.height / 2)
    var rad = Math.atan2(dx, -dy)
    var deg = rad * (180 / Math.PI)
    options.target.firstChild.style.webkitTransform = 'rotate(' + deg + 'deg)'
    OSCpad.setFloat(options.target.getAttribute('data-osc-address'), deg)
  },

  mousemove: function(event) {
    event.preventDefault()
    return OSCWheel.move({
      target: event.target,
      pageX:  event.pageX,
      pageY:  event.pageY,
    })
  },

  mousedown: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    target.addEventListener('mousemove', OSCWheel.mousemove, true)
  },

  mouseout: function(event) {
    OSCWheel.mouseup(event)
  },

  mouseup: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    target.removeEventListener('mousemove', OSCWheel.mousemove, true)
  },

  touchstart: function(event) {
    event.preventDefault()
  },

  touchmove: function(event) {
    event.preventDefault()
    return OSCWheel.move({
      target: event.targetTouches[0].target,
      pageX:  event.targetTouches[0].pageX,
      pageY:  event.targetTouches[0].pageY,
    })
  }
}

// Sliders
var OSCSlider = {

  move: function(options) {
    var style = getComputedStyle(options.target)
    var borderTop = parseInt(style['border-top-width'])
    var borderBottom = parseInt(style['border-bottom-width'])
    var bounds = options.target.getBoundingClientRect()
    
    var pointer = options.target.firstChild
    var pointerStyle = getComputedStyle(pointer)
    var pointerRadius = parseInt(pointerStyle.height) / 2
    var pointerBorderTop = parseInt(pointerStyle['border-top-width'])
    var pointerBorderBottom = parseInt(pointerStyle['border-bottom-width'])
    
    var innerTop = bounds.top + borderTop + pointerRadius + pointerBorderTop
    var innerBottom = bounds.bottom - borderBottom - pointerRadius - pointerBorderBottom
    var innerHeight = innerBottom - innerTop
    
    value = Math.min(1.0, Math.max(0.0, (options.pageY - innerTop) / innerHeight))
    pointer.style.webkitTransform = 'translate(0px, ' + (value * innerHeight) + 'px)'
    OSCpad.setFloat(options.target.getAttribute('data-osc-address'), value)
  },

  mousemove: function(event) {
    event.preventDefault()
    return OSCSlider.move({
      target: event.target,
      pageX:  event.pageX,
      pageY:  event.pageY,
    })
  },

  mousedown: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    target.addEventListener('mousemove', OSCSlider.mousemove, true)
  },

  mouseup: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    target.removeEventListener('mousemove', OSCSlider.mousemove, true)
  },

  mouseout: function(event) {
    event.preventDefault()
    OSCSlider.mouseup(event)
  },

  touchstart: function(event) {
    event.preventDefault()
  },

  touchmove: function(event) {
    event.preventDefault()
    return OSCSlider.move({
      target: event.currentTarget,
      pageX:  event.targetTouches[0].pageX,
      pageY:  event.targetTouches[0].pageY,
    })
  }
  
}


