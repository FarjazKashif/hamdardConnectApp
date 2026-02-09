import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

const Page = () => {
  const { isSignedIn } = useAuth()
    if (isSignedIn) {
      // Redirect to Home
        return <Redirect href="/(root)/(tabs)/home" />
    }
  return <Redirect href="/(auth)/welcome" />
}

export default Page;