import { useUser } from "@clerk/clerk-expo";
import { Text, View } from "react-native";

const Home = () => {
    const {user} = useUser();
  return(
    <View>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <Text>Home Page</Text>
    </View>
  )
}

export default Home;