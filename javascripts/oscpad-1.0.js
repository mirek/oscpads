// OSCpad - Open Sound Control for iPad/iPhone
// © 2010 Mirek Rusin http://oscpad.com
//                    http://quartzcomposer.com
var OSCpad = {

  values: new Array,
  
  // We want a dummy element to attach event listeners and dispatch
  // OSCpad custom events
  element: document.createElement(),
  
  addEventListener: function(type, listener, useCapture) {
    OSCpad.element.addEventListener(type, listener, useCapture)
  },

  removeEventListener: function(type, listener, useCapture) {
    OSCpad.element.removeEventListener(type, listener, useCapture)
  },

  dispatch: function(type, bubbles, cancelable, params) {
    var event = document.createEvent("Events")
    event.initEvent(type, bubbles, cancelable)
    event.params = params
    OSCpad.element.dispatchEvent(event)
  },

  // Return OSC addresses by traversing all HTML elements with data-osc-address attribute
  oscAddresses: function() {
    var oscAddressElements = document.querySelectorAll('[data-osc-address]')
    var r = []
    for (var i = 0; i < oscAddressElements.length; i++) {
      var oscAddress = oscAddressElements[i].getAttribute('data-osc-address')
      r.push(oscAddress)
    }
    return r
  },
  
  // Return true if running in iPhone/iPod/iPad, false otherwise
  iOS: function() {
    return /iPhone|iPod|iPad/.test(navigator.userAgent)
  },
  
  // In development you may want to use this function to see messages
  // on Safari's console. Uses console.log(...) to print fetched messages
  // Set interval to 1/30 to check for new messages 30 times a second
  fetchPeriodically: function(interval) {
    setInterval(function() {
      var messages = OSCpad.fetchJSON()
      if (messages)
        console.log(messages)
    }, interval * 1000)
  },
  
  writeConditionalCSS: function() {
    if (OSCpad.iOS())
      document.write('<link rel="stylesheet" href="../styles/oscpad-ios.css" type="text/css" media="screen" charset="utf-8">')
    else
      document.write('<link rel="stylesheet" href="../styles/oscpad-non-ios.css" type="text/css" media="screen" charset="utf-8">')
  },
  
  // Set the value of specified type for address
  //
  // Supported types mimic Quartz Composer's OSC support and include:
  // * String
  // * Boolean
  // * Index (an integer)
  // * Float
  // * Floats (an array of floats)
  //
  // Please note messages are sent in short intervals (ie. 30/sec) by iOS application.
  // For performance reasons values are stored in hash table (as opposed to array queue). This means
  // only a single value will be send for each interval. For example setting:
  // 
  // 
  // 
  set: function(address, value, type) {
    OSCpad.values[address] = { key: address, value: value, type: type, timestamp: new Date().getTime() }
    if (OSCpad.element)
      OSCpad.dispatch('oscpad:set', false, false, { address: address, value: value, type: type })
  },
  
  setString: function(k, v) {
    OSCpad.set(k, v.toString(), 'String')
  },

  setBoolean: function(k, v) {
    OSCpad.set(k, v ? true : false, 'Boolean')
  },

  setIndex: function(k, v) {
    OSCpad.set(k, parseInt(v), 'Index')
  },

  setFloat: function(k, v) {
    OSCpad.set(k, parseFloat(v), 'Float')
  },

  setFloats: function(k, v) {
    var floats = new Array
    var l = v.length
    for (var i = 0; i < l; ++i)
      floats.push(parseFloat(v[i]))
    OSCpad.set(k, floats, 'Floats')
  },

  fetchArray: function() {
    var values = OSCpad.values
    OSCpad.values = new Array
    var array = new Array
    for (var key in values) {
      var value = values[key]['value']
      var type = values[key]['type']
      var timestamp = values[key]['timestamp']
      if (value != undefined && type != undefined && timestamp != undefined)
        array.push(key, value, type, timestamp)
    }
    if (array.length > 0)
      return array
    else
      return null
  },

  fetchJSON: function() {
    var array = OSCpad.fetchArray()
    if (array)
      return JSON.stringify(array)
    else
      return null
  },

  oscAddressesPropertyListXMLFormat_v1_0: function() {
    var array = OSCpad.oscAddresses()
    if (array.length > 0) {
      var l = array.length
      var plist = new Array
      plist.push('<?xml version="1.0" encoding="utf-8"?>')
      plist.push('<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">')
      plist.push('<plist version="1.0">')
      plist.push('  <array>')
      for (var i = 0; i < l; ++i) {
        plist.push(['    <string>', array[i].toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'), '</string>'].join(''))
      }
      plist.push('  </array>')
      plist.push('</plist>')
      return plist.join("\n")
    } else {
      return null
    }
  },

  fetchPropertyListXMLFormat_v1_0: function() {
    var array = OSCpad.fetchArray()
    if (array) {
      var l = array.length
      var plist = new Array
      plist.push('<?xml version="1.0" encoding="utf-8"?>')
      plist.push('<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">')
      plist.push('<plist version="1.0">')
      plist.push('  <dict>')
      for (var i = 0; i < l; i += 4) {
        var key       = array[i + 0]
        var value     = array[i + 1]
        var type      = array[i + 2]
        var timestamp = array[i + 3]
      
        // We don't want to escape container elements themselfs but their values (we'll do it later)
        if (type !== 'Floats')
          var escapedValue = value.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      
        plist.push(['    <key>', key, '</key>'].join(''))
        plist.push( '    <dict>')
        plist.push( '      <key>timestamp</key>')
        plist.push(['      <string>', timestamp, '</string>'].join(''))
        plist.push( '      <key>type</key>')
        plist.push(['      <string>', type, '</string>'].join(''))
        plist.push( '      <key>value</key>')
        switch (type) {
          case 'String':
            plist.push(['      <string>', escapedValue, '</string>'].join(''))
            break
          case 'Boolean':
            plist.push(['      <', value ? 'true' : 'false', ' />'].join(''))
            break
          case 'Index':
            plist.push(['      <integer>', escapedValue, '</integer>'].join(''))
            break
          case 'Float':
            plist.push(['      <real>', escapedValue, '</real>'].join(''))
            break
          case 'Floats':
            plist.push( '      <array>')
            var fl = value.length
            for (var j = 0; j < fl; ++j) {
              var floatValue = value[j]
              var escapedFloatValue = floatValue.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
              plist.push(['        <real>', escapedFloatValue, '</real>'].join(''))
            }
            plist.push( '      </array>')
            break
        }
        plist.push( '    </dict>')
      }
      plist.push('  </dict>')
      plist.push('</plist>')
      return plist.join("\n")
    } else {
      return null
    }
  }

}

// Unobstructive document onload. When using prototypejs/jquery/etc use the method provided by the library.
// Otherwise you can use:
//
//   OSCpad.addEventListener('loaded', function(e) { ... } )
//
OSCpad.onload = function() {
  if (arguments.callee.done) return
  arguments.callee.done = true
  if (OSCpad.onloadTimer)
    clearInterval(OSCpad.onloadTimer)
  OSCpad.dispatch('loaded', false, false)
}

if (/WebKit/i.test(navigator.userAgent)) {
  OSCpad.onloadTimer = setInterval(function() {
    if (/loaded|complete/.test(document.readyState)) {
      OSCpad.onload()
    }
  }, 50)
}

// Only for development mode when using OSX Safari 
if (!OSCpad.iOS()) {

  // Logger window lists all addresses and captures signals in development mode
  // on OSX Safari
  var OSCLogger = {
    
    // Hash table to link osc-address with HTML elements for type and value
    // so we can modify innerHTML
    elementReferences: {},
    
    // Create logger element and register itself as event listener for 'oscpad:set' events
    create: function() {
      var tableElement = document.createElement('table')

      var trElement = document.createElement('tr')
      tableElement.appendChild(trElement)

      var thElement = document.createElement('th')
      thElement.setAttribute('class', 'osc-logger-th-address')
      thElement.innerHTML = 'Address'
      trElement.appendChild(thElement)

      thElement = document.createElement('th')
      thElement.setAttribute('class', 'osc-logger-th-type')
      thElement.innerHTML = 'Type'
      trElement.appendChild(thElement)

      thElement = document.createElement('th')
      thElement.setAttribute('class', 'osc-logger-th-value')
      thElement.innerHTML = 'Value'
      trElement.appendChild(thElement)

      var oscAddresses = OSCpad.oscAddresses()
      for (var i = 0; i < oscAddresses.length; ++i) {
        var oscAddress = oscAddresses[i]
        var elementReference = OSCLogger.elementReferences[oscAddress] = {}

        trElement = document.createElement('tr')

        var tdElement = document.createElement('td')
        tdElement.innerHTML = oscAddresses[i]
        tdElement.setAttribute('class', 'osc-logger-td-address')
        trElement.appendChild(tdElement)

        tdElement = document.createElement('td')
        elementReference['type'] = tdElement
        tdElement.setAttribute('class', 'osc-logger-td-type')
        tdElement.innerHTML = ''
        trElement.appendChild(tdElement)

        tdElement = document.createElement('td')
        elementReference['value'] = tdElement
        tdElement.setAttribute('class', 'osc-logger-td-value')
        tdElement.setAttribute('align', 'right')
        tdElement.innerHTML = ''
        trElement.appendChild(tdElement)

        tableElement.appendChild(trElement)
      }

      var body = document.getElementsByTagName('body')[0]
      
      var divElement = document.createElement('div')
      divElement.setAttribute('id', 'osc-logger')
      body.appendChild(divElement)

      divElement.appendChild(tableElement)

      OSCpad.addEventListener('oscpad:set', function(e) {
        var elementReference = OSCLogger.elementReferences[e.params['address']]
        if (elementReference) {
          elementReference['type'].innerHTML = e.params['type']
          elementReference['value'].innerHTML = e.params['value']
        }
      })
    }
  }
  
  // Create OSCLogger instance
  OSCpad.addEventListener('loaded', function(e) {
    OSCLogger.create()
  })
  
}

