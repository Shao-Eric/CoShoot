import { createStackNavigator, createAppContainer } from "react-navigation";
import HomeScreen from "../pages/HomeScreen";
import RoomScreen from "../pages/RoomScreen";
import ShootScreen from "../pages/ShootScreen";

export default createAppContainer(
  createStackNavigator(
    {
      Home: {
        screen: HomeScreen
      },
      Room: {
        screen: RoomScreen
      },
      Shoot: {
        screen: ShootScreen
      }
    },
    {
      initialRouteName: "Home",
      headerMode: "none"
    }
  )
);
