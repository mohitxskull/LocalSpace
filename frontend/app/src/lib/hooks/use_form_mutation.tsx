import { useForm, UseFormInput } from "@mantine/form";
import {
  DefaultError,
  useMutation,
  UseMutationOptions,
} from "@tanstack/react-query";

export const useFormMutation = <
  TData = unknown,
  TError = DefaultError,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
  TContext = unknown,
>(
  params: UseFormInput<TVariables> & {
    mutation: UseMutationOptions<TData, TError, TVariables, TContext>;
  },
) => {
  const { mutation, ...formParams } = params;

  const internalForm = useForm<TVariables>({
    mode: "uncontrolled",
    ...formParams,
  });

  const internalMutation = useMutation(mutation);

  return {
    form: internalForm,
    mutation: internalMutation,
  } as const;
};
