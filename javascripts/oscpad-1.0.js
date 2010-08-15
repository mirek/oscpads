// OSCpad - Open Sound Control for iPad/iPhone
// © 2010 Mirek Rusin http://oscpad.com
//                    http://quartzcomposer.com
var OSCpad = {
  
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
  
  values: new Array,
  
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
