import WeightTarget from "@/components/weight-target/WeightTarget";
import { View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "stretch",
        backgroundColor: "#69d0fb",
      }}
    >
      <WeightTarget weight={84} height={1.77} />
    </View>
  );
}
