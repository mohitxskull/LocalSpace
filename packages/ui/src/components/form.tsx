import { Stack } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { UseMutationResult } from '@tanstack/react-query'
import React, { FormEvent } from 'react'

const Form = <
  MUTATION extends UseMutationResult<any, any, any, any>,
  INPUT extends Exclude<MUTATION['variables'], undefined>,
  FORM extends UseFormReturnType<INPUT>,
>(props: {
  mutation: MUTATION
  form: FORM

  children: (params: { loading: boolean; isDirty: boolean }) => React.ReactNode
  submit: (input: INPUT, event?: FormEvent<HTMLFormElement>) => void
}) => {
  return (
    <>
      <form
        onSubmit={props.form.onSubmit((values, event) => {
          props.submit(values, event)
        })}
      >
        <Stack>
          {props.children({
            loading: props.mutation.isPending,
            isDirty: props.form.isDirty(),
          })}
        </Stack>
      </form>
    </>
  )
}

export { Form }
