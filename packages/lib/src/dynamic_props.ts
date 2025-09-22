export type MakePropsDynamic<T> = {
  [K in keyof T]: T[K] | (() => T[K])
}

export const resolveDynamicProps = <T extends object>(dynamicObj: MakePropsDynamic<T>): T => {
  const resolvedObj = {} as T

  for (const key in dynamicObj) {
    // Ensure the key is actually a property of dynamicObj and, by extension, of T.
    // This check also helps satisfy TypeScript's strictness when iterating with 'for...in'.
    if (Object.prototype.hasOwnProperty.call(dynamicObj, key)) {
      const propertyValue = dynamicObj[key]

      if (typeof propertyValue === 'function') {
        resolvedObj[key] = (propertyValue as () => T[typeof key])()
      } else {
        resolvedObj[key] = propertyValue as T[typeof key]
      }
    }
  }
  return resolvedObj
}
