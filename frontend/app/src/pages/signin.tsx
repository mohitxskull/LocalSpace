import { useSession } from "@/lib/hooks/use_session";
import {
  Alert,
  Button,
  Card,
  Center,
  Container,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  Logo,
  Captcha,
  Form,
  LogoLoadingOverlay,
  useCaptcha,
} from "@localspace/ui/components";
import { useFormMutation } from "@localspace/ui/lib/hooks";
import { useTuyau } from "@/lib/tuyau";
import Link from "next/link";
import { notifications } from "@mantine/notifications";
import { cookieManager } from "@/lib/cookie_manager";
import { useState } from "react";
import { useRouter } from "next/router";
import { handleError } from "@localspace/ui/lib";
import { useMutation } from "@tanstack/react-query";
import { clientEnv } from "@/config/env/client";

export default function Page() {
  const session = useSession();
  const tuyau = useTuyau();
  const router = useRouter();
  const { captchaRef, resetCaptcha } = useCaptcha();

  const [isCaptchaReady, setIsCaptchaReady] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const resendMutation = useMutation(
    tuyau.api.v1.customer.auth.verify.resend.$post.mutationOptions({
      onSuccess: (res) => {
        notifications.show({
          message: res.message,
        });
      },
      onError: (error) => {
        handleError(error);
      },
    }),
  );

  const { form, mutation } = useFormMutation({
    mutation: tuyau.api.v1.customer.auth.signin.$post.mutationOptions({
      onSuccess: (res) => {
        cookieManager.setCookie("token", res.token.value, {
          expires: res.token.expiresAt
            ? new Date(res.token.expiresAt)
            : undefined,
        });

        notifications.show({
          message: res.message,
        });

        router.push("/");
      },
      onError: (error) => {
        resetCaptcha();
        setShowResend(false);

        handleError(error, {
          form,
          onErrorData: (errorData) => {
            if (errorData.code === "EMAIL_NOT_VERIFIED") {
              setShowResend(true);
            }
          },
        });
      },
    }),
    initialValues: {
      payload: {
        email: "",
        password: "",
      },
    },
  });

  if (session.isLoading) {
    return <LogoLoadingOverlay />;
  }

  if (session.isSuccess) {
    router.push("/");
  }

  return (
    <Container size="xs">
      <Stack gap="xs" w="100%" justify="center" mt="25vh" mb="50vh">
        <Center>
          <Logo />
        </Center>

        <Card withBorder p="md">
          <Stack>
            <Title order={3}>Welcome Back!</Title>

            <Text size="xs" c="var(--color-text-secondary)">
              Don&apos;t have an account?{" "}
              <Text component={Link} href="/signup" td="underline">
                Sign Up
              </Text>
            </Text>

            <Form
              mutation={mutation}
              submit={(d) => {
                mutation.mutate(d);
              }}
              form={form}
            >
              {({ loading, isDirty }) => (
                <>
                  <TextInput
                    label="Email"
                    placeholder="Enter your email"
                    {...form.getInputProps("payload.email")}
                    key={form.key("payload.email")}
                    required
                    disabled={loading}
                  />

                  <Stack gap="5">
                    <PasswordInput
                      label="Password"
                      placeholder="Enter your password"
                      {...form.getInputProps("payload.password")}
                      key={form.key("payload.password")}
                      required
                      minLength={8}
                      maxLength={32}
                      disabled={loading}
                    />

                    <Text
                      size="xs"
                      c="var(--color-text-secondary)"
                      component={Link}
                      href="/password/reset/request"
                      td="underline"
                    >
                      Forgot Password?
                    </Text>
                  </Stack>

                  {showResend && (
                    <Alert color="orange" title="Email not verified">
                      <Stack>
                        <Text size="sm">
                          Your email address is not verified. Please check your
                          inbox or click the button below to resend the
                          verification email.
                        </Text>
                        <Button
                          variant="light"
                          color="orange"
                          loading={resendMutation.isPending}
                          onClick={() =>
                            resendMutation.mutate({
                              payload: {
                                email: form.values.payload.email,
                              },
                            })
                          }
                        >
                          Resend verification email
                        </Button>
                      </Stack>
                    </Alert>
                  )}

                  {isDirty && (
                    <Captcha
                      ref={captchaRef}
                      siteKey={clientEnv.NEXT_PUBLIC_CAPTCHA_PUBLIC_KEY}
                      onMessage={(message) => notifications.show({ message })}
                      setToken={(t) => {
                        if (t) {
                          cookieManager.setCookie("captcha", t);
                          setIsCaptchaReady(true);
                        } else {
                          cookieManager.removeCookie("captcha");
                          setIsCaptchaReady(false);
                        }
                      }}
                    />
                  )}

                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!isDirty || !isCaptchaReady}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </Form>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
