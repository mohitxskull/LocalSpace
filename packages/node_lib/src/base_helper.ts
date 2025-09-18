import { LucidRow } from '@adonisjs/lucid/types/model'

export abstract class BaseHelper<TR extends LucidRow> {
  constructor(protected readonly resource: TR) {}
}
