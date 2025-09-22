import Blog from '#models/blog'
import { BaseTransformer } from '@localspace/node-lib'

export class BlogTransformer extends BaseTransformer<Blog> {
  async serialize() {
    return {
      id: this.resource.id,
      title: this.resource.title,
      content: this.resource.content,
      status: this.resource.status,
      createdAt: this.datetime(this.resource.createdAt),
      updatedAt: this.datetime(this.resource.updatedAt),
    }
  }
}
