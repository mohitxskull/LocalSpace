import { UseFormReturnType } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { TuyauHTTPError } from '@tuyau/client'
import z from 'zod'

export const ValidationErrorSchema = z.object({
  message: z.string(),
  field: z.string(),
  rule: z.string(),
  index: z.number().optional(),
  meta: z.record(z.string(), z.any()).optional(),
})

const HTTPErrorResponseSchema = z.object({
  id: z.string(),
  status: z.number(),
  code: z.string().optional(),
  message: z.string(),
  help: z.string().optional(),
  metadata: z.union([z.record(z.string(), z.unknown()), z.array(ValidationErrorSchema)]).optional(),
  source: z.string().optional(),
})

const parseField = (field: string) => {
  if (field.startsWith('params')) {
    return field
  } else {
    return `payload.${field}`
  }
}

export const handleError = (
  error: unknown,
  options?: {
    form?: UseFormReturnType<any>
    onErrorData?: (errorData: z.infer<typeof HTTPErrorResponseSchema>) => void
  }
) => {
  if (error instanceof TuyauHTTPError) {
    const validateErrorRes = HTTPErrorResponseSchema.safeParse(error.value)

    if (!validateErrorRes.success) {
      notifications.show({
        title: 'Error',
        message: 'Response from the server was not valid',
        color: 'red',
      })
      return
    }

    const errorData = validateErrorRes.data

    if (options?.onErrorData) {
      options.onErrorData(errorData)
    }

    const formValues = options?.form ? options.form.getValues() : {}

    if (errorData?.metadata && Array.isArray(errorData.metadata)) {
      for (const multi of errorData.metadata) {
        if (options?.form && multi.field && formValues[multi.field] !== undefined) {
          options.form.setFieldError(parseField(multi.field), multi.message)
        } else {
          notifications.show({
            title: multi.field,
            message: multi.message,
          })
        }
      }
    } else if (errorData?.source) {
      if (options?.form && formValues[errorData.source] !== undefined) {
        options.form.setFieldError(parseField(errorData.source), errorData.message)
      } else {
        notifications.show({
          title: errorData.source,
          message: errorData.message,
        })
      }
    } else {
      notifications.show({
        title: 'Error',
        message: errorData.message,
        color: 'red',
      })
    }
  } else {
    notifications.show({
      title: 'Error',
      message: 'An unknown error occurred',
      color: 'red',
    })
  }
}
