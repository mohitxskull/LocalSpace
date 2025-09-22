import {
  Button,
  Card,
  Center,
  Container,
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
import { useSession } from "@/lib/hooks/use_session";
import { useRouter } from "next/router";
import { handleError } from "@localspace/ui/lib";
import { clientEnv } from "@/config/env/client";

export default function Page() {
  const session = useSession();
  const router = useRouter();
  const tuyau = useTuyau();
  const { captchaRef, resetCaptcha } = useCaptcha();

  const [isCaptchaReady, setIsCaptchaReady] = useState(false);

  const { form, mutation } = useFormMutation({
    mutation: tuyau.api.v1.customer.auth.password.forgot.$post.mutationOptions({
      onSuccess: (data) => {
        notifications.show({
          title: "Request sent",
          message: data.message,
          color: "green",
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
        email: "",
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
            <Title order={3}>Reset Password</Title>
            <Text size="sm" c="dimmed">
              Enter your email address and we will send you a link to reset your
              password.
            </Text>

            <Form
              mutation={mutation}
              submit={(d) => mutation.mutate(d)}
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
                    type="email"
                    disabled={loading}
                  />

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
                    Send Reset Link
                  </Button>

                  <Text size="xs" ta="center">
                    <Text component={Link} href="/signin" td="underline">
                      Back to Sign In
                    </Text>
                  </Text>
                </>
              )}
            </Form>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
