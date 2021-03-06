'use strict'

const { Buffer } = require('safe-buffer')
const EventEmitter = require('events')

const writeToStream = require('./writeToStream')

class Accumulator extends EventEmitter {
  constructor () {
    super()
    this._array = new Array(20)
    this._i = 0
  }

  write (chunk) {
    this._array[this._i++] = chunk
    return true
  }

  concat () {
    let length = 0
    const lengths = new Array(this._array.length)
    const list = this._array
    let pos = 0
    let i
    let result

    for (i = 0; i < list.length && list[i] !== undefined; i++) {
      if (typeof list[i] !== 'string') {
        lengths[i] = list[i].length
      } else {
        lengths[i] = Buffer.byteLength(list[i])
      }

      length += lengths[i]
    }

    result = Buffer.allocUnsafe(length)

    for (i = 0; i < list.length && list[i] !== undefined; i++) {
      if (typeof list[i] !== 'string') {
        list[i].copy(result, pos)
        pos += lengths[i]
      } else {
        result.write(list[i], pos)
        pos += lengths[i]
      }
    }

    return result
  }
}

function generate (packet, opts) {
  const stream = new Accumulator()
  writeToStream(packet, stream, opts)

  return stream.concat()
}

module.exports = generate
