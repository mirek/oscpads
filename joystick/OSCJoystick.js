
document.observe('dom:loaded', function() {
  
  $$('.osc-joystick-handle').each(function(e) { e.addEventListener("touchstart", OSCJoystick.touchstart, false) })
  $$('.osc-joystick-handle').each(function(e) { e.addEventListener("touchend",  OSCJoystick.touchend, false) })
  $$('.osc-joystick-handle').each(function(e) { e.addEventListener('mousedown',  OSCJoystick.mousedown, true) })
  $$('.osc-joystick-handle').each(function(e) { e.addEventListener('mouseup',    OSCJoystick.mouseup, true) })
  $$('.osc-joystick-handle').each(function(e) { e.addEventListener('mouseout',   OSCJoystick.mouseout, true) })
  
  // Print messages to console.log(...) if not running on iPhone/iPod/iPad
  if (!OSCpad.iOS())
    OSCpad.fetchPeriodically(1 / 30)
  
})

var OSCJoystick = {
  
  start: function(options) {
    options.target.setAttribute('data-osc-start-x', options.pageX)
    options.target.setAttribute('data-osc-start-y', options.pageY)
    options.target.setAttribute('data-osc-new-x', options.target.getAttribute('data-osc-x'))
    options.target.setAttribute('data-osc-new-y', options.target.getAttribute('data-osc-y'))
  },

  move: function(options) {
    var style = getComputedStyle(options.target)
    var x = parseInt(options.target.getAttribute('data-osc-x'))
    var y = parseInt(options.target.getAttribute('data-osc-y'))
    var dx = options.pageX - parseInt(options.target.getAttribute('data-osc-start-x'))
    var dy = options.pageY - parseInt(options.target.getAttribute('data-osc-start-y'))
    options.target.setAttribute('data-osc-new-x', x + dx)
    options.target.setAttribute('data-osc-new-y', y + dy)
    options.target.style.webkitTransform = 'translate(' + dx + 'px, ' + dy + 'px)'
    OSCpad.setFloats(options.target.getAttribute('data-osc-address'), [dx / 10000, -dy / 10000])
  },

  end: function(options) {
    options.target.setAttribute('data-osc-x', options.target.getAttribute('data-osc-new-x'))
    options.target.setAttribute('data-osc-y', options.target.getAttribute('data-osc-new-y'))
    options.target.removeAttribute('data-osc-new-x')
    options.target.removeAttribute('data-osc-new-y')
    options.target.removeAttribute('data-osc-start-x')
    options.target.removeAttribute('data-osc-start-y')
    options.target.style.webkitTransform = 'translate(0px, 0px)'
    OSCpad.setFloats(options.target.getAttribute('data-osc-address'), [0, 0])
  },

  mousemove: function(event) {
    event.preventDefault()
    return OSCJoystick.move({
      target: event.target,
      pageX:  event.pageX,
      pageY:  event.pageY,
    })
  },

  mousedown: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    target.addEventListener('mousemove', OSCJoystick.mousemove, true)
    return OSCJoystick.start({
      target: target,
      pageX:  event.pageX,
      pageY:  event.pageY
    })
  },

  mouseup: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    target.removeEventListener('mousemove', OSCJoystick.mousemove, true)
    return OSCJoystick.end({
      target: target
    })
  },

  mouseout: function(event) {
//    alert(event.type)
    event.preventDefault()
//    return OSCJoystick.mouseup(event)
  },

  touchstart: function(event) {
    var target = event.currentTarget
    target.addEventListener('touchmove', OSCJoystick.touchmove, true)
    return OSCJoystick.start({
      target: target,
      pageX:  event.targetTouches[0].pageX,
      pageY:  event.targetTouches[0].pageY
    })
  },
  
  touchend: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    target.removeEventListener('touchmove', OSCJoystick.touchmove, true)
    OSCJoystick.end({
      target: target
    })
  },

  touchmove: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    return OSCJoystick.move({
      target: target,
      pageX:  event.targetTouches[0].pageX,
      pageY:  event.targetTouches[0].pageY,
    })
  }
  
}