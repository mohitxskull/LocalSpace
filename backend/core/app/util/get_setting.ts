import app from '@adonisjs/core/services/app'
import type setting from '#config/setting'

export const getSetting = () => {
  return app.config.get('setting') as typeof setting
}
