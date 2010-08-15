// Touch pad
var OSCTouch = {

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
    OSCpad.setFloats(options.target.getAttribute('data-osc-address'), [x + dx, y + dy])
  },

  end: function(options) {
    options.target.setAttribute('data-osc-x', options.target.getAttribute('data-osc-new-x'))
    options.target.setAttribute('data-osc-y', options.target.getAttribute('data-osc-new-y'))
    options.target.removeAttribute('data-osc-new-x')
    options.target.removeAttribute('data-osc-new-y')
    options.target.removeAttribute('data-osc-start-x')
    options.target.removeAttribute('data-osc-start-y')
  },

  mousemove: function(event) {
    event.preventDefault()
    return OSCTouch.move({
      target: event.target,
      pageX:  event.pageX,
      pageY:  event.pageY,
    })
  },

  mousedown: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    target.addEventListener('mousemove', OSCTouch.mousemove, true)
    return OSCTouch.start({
      target: target,
      pageX:  event.pageX,
      pageY:  event.pageY
    })
  },

  mouseup: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    target.removeEventListener('mousemove', OSCTouch.mousemove, true)
    return OSCTouch.end({
      target: target
    })
  },

  mouseout: function(event) {
    event.preventDefault()
    return OSCTouch.mouseup(event)
  },

  touchstart: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    target.addEventListener('touchmove', OSCTouch.touchmove, true)
    return OSCTouch.start({
      target: target,
      pageX:  event.targetTouches[0].pageX,
      pageY:  event.targetTouches[0].pageY
    })
  },
  
  touchend: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    target.removeEventListener('touchmove', OSCTouch.touchmove, true)
    OSCTouch.end({
      target: target
    })
  },

  touchmove: function(event) {
    event.preventDefault()
    var target = event.currentTarget
    return OSCTouch.move({
      target: target,
      pageX:  event.targetTouches[0].pageX,
      pageY:  event.targetTouches[0].pageY,
    })
  }
  
}
