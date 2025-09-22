import { LucidRow } from '@adonisjs/lucid/types/model'

/**
 * An abstract base class for creating helper classes for Lucid models.
 * Helpers provide a way to encapsulate logic related to a specific model instance,
 * keeping the model file itself clean.
 *
 * @template TR - The type of the Lucid model instance (`LucidRow`).
 */
export abstract class BaseHelper<TR extends LucidRow> {
  /**
   * Creates an instance of the BaseHelper.
   *
   * @param resource - The Lucid model instance that this helper will operate on.
   */
  constructor(protected readonly resource: TR) {}
}
