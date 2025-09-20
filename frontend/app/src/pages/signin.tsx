import { useSession } from "@/lib/hooks/use_session";
import {
  Button,
  Card,
  Center,
  Container,
  LoadingOverlay,
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
} from "@localspace/ui/components";
import { useFormMutation } from "@/lib/hooks/use_form_mutation";
import { useTuyau } from "@/lib/tuyau";
import Link from "next/link";
import { env } from "@/config/env";
import { notifications } from "@mantine/notifications";
import { cookieManager } from "@/lib/cookie_manager";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Page() {
  const session = useSession();
  const tuyau = useTuyau();
  const router = useRouter();

  const [isCaptchaReady, setIsCaptchaReady] = useState(false);

  const { form, mutation } = useFormMutation({
    mutation: tuyau.api.v1.customer.auth.signin.$post.mutationOptions(),
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
            <Title order={3}>Welcome Back!</Title>

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

                  {isDirty && (
                    <Captcha
                      siteKey={env.NEXT_PUBLIC_CAPTCHA_PUBLIC_KEY}
                      onMessage={(data) => notifications.show(data)}
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
