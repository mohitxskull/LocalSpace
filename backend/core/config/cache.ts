import { defineConfig, store, drivers } from '@adonisjs/cache'

const cacheConfig = defineConfig({
  default: 'default',

  stores: {
    memoryOnly: store().useL1Layer(drivers.memory()),

    default: store()
      .useL1Layer(drivers.memory())
      .useL2Layer(
        drivers.redis({
          connectionName: 'main',
        })
      ),
  },

  onFactoryError: (e) => {
    if (e.cause && e.cause instanceof Error) {
      throw e.cause
    }
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
