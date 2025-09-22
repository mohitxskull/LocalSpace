import { useForm, UseFormInput } from '@mantine/form'
import { DefaultError, useMutation, UseMutationOptions } from '@tanstack/react-query'

export const useFormMutation = <
  TData = unknown,
  TError = DefaultError,
  TFormValues extends Record<string, any> = Record<string, any>,
  TContext = unknown,
>(
  params: UseFormInput<TFormValues> & {
    mutation: UseMutationOptions<TData, TError, TFormValues, TContext>
  }
) => {
  const { mutation, ...formParams } = params

  // Use the unambiguous TFormValues generic for the form.
  const internalForm = useForm<TFormValues>({
    mode: 'uncontrolled',
    ...formParams,
  })

  const internalMutation = useMutation(mutation)

  return {
    form: internalForm,
    mutation: internalMutation,
  } as const
}
