import { AppContext } from "@/components/context/app";
import { Text } from "@mantine/core";

export default function Page() {
  return (
    <>
      <AppContext>
        <Text>Goat</Text>
      </AppContext>
    </>
  );
}
