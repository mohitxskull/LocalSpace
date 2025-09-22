const encodeUtf8 = (text: string): ArrayBuffer => {
  const encoder = new TextEncoder()
  return encoder.encode(text).buffer as ArrayBuffer
}

const fmix = (input: number): number => {
  input ^= input >>> 16
  input = Math.imul(input, 0x85ebca6b)
  input ^= input >>> 13
  input = Math.imul(input, 0xc2b2ae35)
  input ^= input >>> 16

  return input >>> 0
}

const C = new Uint32Array([0x239b961b, 0xab0e9789, 0x38b34ae5, 0xa1e38b93])

const rotl = (m: number, n: number): number => {
  return (m << n) | (m >>> (32 - n))
}

const body = (key: ArrayBuffer, hashBody: Uint32Array) => {
  const blocks = (key.byteLength / 16) | 0
  const view32 = new Uint32Array(key, 0, blocks * 4)

  for (let i = 0; i < blocks; i++) {
    const k = view32.subarray(i * 4, (i + 1) * 4)

    k[0] = Math.imul(k[0], C[0])
    k[0] = rotl(k[0], 15)
    k[0] = Math.imul(k[0], C[1])

    hashBody[0] = hashBody[0] ^ k[0]
    hashBody[0] = rotl(hashBody[0], 19)
    hashBody[0] = hashBody[0] + hashBody[1]
    hashBody[0] = Math.imul(hashBody[0], 5) + 0x561ccd1b

    k[1] = Math.imul(k[1], C[1])
    k[1] = rotl(k[1], 16)
    k[1] = Math.imul(k[1], C[2])

    hashBody[1] = hashBody[1] ^ k[1]
    hashBody[1] = rotl(hashBody[1], 17)
    hashBody[1] = hashBody[1] + hashBody[2]
    hashBody[1] = Math.imul(hashBody[1], 5) + 0x0bcaa747

    k[2] = Math.imul(k[2], C[2])
    k[2] = rotl(k[2], 17)
    k[2] = Math.imul(k[2], C[3])

    hashBody[2] = hashBody[2] ^ k[2]
    hashBody[2] = rotl(hashBody[2], 15)
    hashBody[2] = hashBody[2] + hashBody[3]
    hashBody[2] = Math.imul(hashBody[2], 5) + 0x96cd1c35

    k[3] = Math.imul(k[3], C[3])
    k[3] = rotl(k[3], 18)
    k[3] = Math.imul(k[3], C[0])

    hashBody[3] = hashBody[3] ^ k[3]
    hashBody[3] = rotl(hashBody[3], 13)
    hashBody[3] = hashBody[3] + hashBody[0]
    hashBody[3] = Math.imul(hashBody[3], 5) + 0x32ac3b17
  }
}

const tail = (key: ArrayBuffer, hashTail: Uint32Array) => {
  const blocks = (key.byteLength / 16) | 0
  const reminder = key.byteLength % 16

  const k = new Uint32Array(4)
  const tailPart = new Uint8Array(key, blocks * 16, reminder)

  switch (reminder) {
    case 15:
      k[3] = k[3] ^ (tailPart[14] << 16)
    // fallthrough
    case 14:
      k[3] = k[3] ^ (tailPart[13] << 8)
    // fallthrough
    case 13:
      k[3] = k[3] ^ (tailPart[12] << 0)

      k[3] = Math.imul(k[3], C[3])
      k[3] = rotl(k[3], 18)
      k[3] = Math.imul(k[3], C[0])
      hashTail[3] = hashTail[3] ^ k[3]
    // fallthrough
    case 12:
      k[2] = k[2] ^ (tailPart[11] << 24)
    // fallthrough
    case 11:
      k[2] = k[2] ^ (tailPart[10] << 16)
    // fallthrough
    case 10:
      k[2] = k[2] ^ (tailPart[9] << 8)
    // fallthrough
    case 9:
      k[2] = k[2] ^ (tailPart[8] << 0)

      k[2] = Math.imul(k[2], C[2])
      k[2] = rotl(k[2], 17)
      k[2] = Math.imul(k[2], C[3])
      hashTail[2] = hashTail[2] ^ k[2]
    // fallthrough
    case 8:
      k[1] = k[1] ^ (tailPart[7] << 24)
    // fallthrough
    case 7:
      k[1] = k[1] ^ (tailPart[6] << 16)
    // fallthrough
    case 6:
      k[1] = k[1] ^ (tailPart[5] << 8)
    // fallthrough
    case 5:
      k[1] = k[1] ^ (tailPart[4] << 0)

      k[1] = Math.imul(k[1], C[1])
      k[1] = rotl(k[1], 16)
      k[1] = Math.imul(k[1], C[2])
      hashTail[1] = hashTail[1] ^ k[1]
    // fallthrough
    case 4:
      k[0] = k[0] ^ (tailPart[3] << 24)
    // fallthrough
    case 3:
      k[0] = k[0] ^ (tailPart[2] << 16)
    // fallthrough
    case 2:
      k[0] = k[0] ^ (tailPart[1] << 8)
    // fallthrough
    case 1:
      k[0] = k[0] ^ (tailPart[0] << 0)

      k[0] = Math.imul(k[0], C[0])
      k[0] = rotl(k[0], 15)
      k[0] = Math.imul(k[0], C[1])
      hashTail[0] = hashTail[0] ^ k[0]
  }
}

const finalize = (key: ArrayBuffer, finalHash: Uint32Array) => {
  finalHash[0] = finalHash[0] ^ key.byteLength
  finalHash[1] = finalHash[1] ^ key.byteLength
  finalHash[2] = finalHash[2] ^ key.byteLength
  finalHash[3] = finalHash[3] ^ key.byteLength

  finalHash[0] = (finalHash[0] + finalHash[1]) | 0
  finalHash[0] = (finalHash[0] + finalHash[2]) | 0
  finalHash[0] = (finalHash[0] + finalHash[3]) | 0

  finalHash[1] = (finalHash[1] + finalHash[0]) | 0
  finalHash[2] = (finalHash[2] + finalHash[0]) | 0
  finalHash[3] = (finalHash[3] + finalHash[0]) | 0

  finalHash[0] = fmix(finalHash[0])
  finalHash[1] = fmix(finalHash[1])
  finalHash[2] = fmix(finalHash[2])
  finalHash[3] = fmix(finalHash[3])

  finalHash[0] = (finalHash[0] + finalHash[1]) | 0
  finalHash[0] = (finalHash[0] + finalHash[2]) | 0
  finalHash[0] = (finalHash[0] + finalHash[3]) | 0

  finalHash[1] = (finalHash[1] + finalHash[0]) | 0
  finalHash[2] = (finalHash[2] + finalHash[0]) | 0
  finalHash[3] = (finalHash[3] + finalHash[0]) | 0
}

export const hash = (key: ArrayBuffer | string, seed = 0): string => {
  seed = seed ? seed | 0 : 0

  if (typeof key === 'string') {
    key = encodeUtf8(key)
  }

  if (!(key instanceof ArrayBuffer)) {
    throw new TypeError('Expected key to be ArrayBuffer or string')
  }

  const finalhash = new Uint32Array([seed, seed, seed, seed])

  body(key, finalhash)
  tail(key, finalhash)
  finalize(key, finalhash)
  const byteArray = new Uint8Array(finalhash.buffer)
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
