import { useSession } from "@/lib/hooks/use_session";
import {
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
import { clientEnv } from "@/config/env/client";

export default function Page() {
  const session = useSession();
  const tuyau = useTuyau();
  const router = useRouter();
  const { captchaRef, resetCaptcha } = useCaptcha();

  const [isCaptchaReady, setIsCaptchaReady] = useState(false);

  const { form, mutation } = useFormMutation({
    mutation: tuyau.api.v1.customer.auth.signup.$post.mutationOptions({
      onSuccess: (res) => {
        notifications.show({
          message: res.message,
        });
        router.push("/signin");
      },
      onError: (error) => {
        resetCaptcha();
        handleError(error, { form });
      },
    }),
    initialValues: {
      payload: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
    },
  });

  if (session.isLoading) {
    return <LogoLoadingOverlay />;
  }

  if (session.isSuccess) {
    router.push("/app");
  }

  return (
    <Container size="xs">
      <Stack gap="xs" w="100%" justify="center" mt="25vh" mb="50vh">
        <Center>
          <Logo />
        </Center>

        <Card withBorder p="md">
          <Stack>
            <Title order={3}>Create an account</Title>

            <Form
              mutation={mutation}
              submit={(d) => mutation.mutate(d)}
              form={form}
            >
              {({ loading, isDirty }) => (
                <>
                  <TextInput
                    label="Full Name"
                    placeholder="Enter your full name"
                    {...form.getInputProps("payload.name")}
                    key={form.key("payload.name")}
                    required
                    disabled={loading}
                  />

                  <TextInput
                    label="Email"
                    placeholder="Enter your email"
                    {...form.getInputProps("payload.email")}
                    key={form.key("payload.email")}
                    required
                    disabled={loading}
                  />

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

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    {...form.getInputProps("payload.confirmPassword")}
                    key={form.key("payload.confirmPassword")}
                    required
                    minLength={8}
                    maxLength={32}
                    disabled={loading}
                  />

                  <Text size="xs" c="var(--color-text-secondary)">
                    Already have an account?{" "}
                    <Text component={Link} href="/signin" td="underline">
                      Sign In
                    </Text>
                  </Text>

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
                    Sign Up
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
