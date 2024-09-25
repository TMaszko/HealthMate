import React from "react";
import { Dimensions, View, StyleSheet } from "react-native";

const dashes = 50;
const width = Dimensions.get("window").width / (dashes * 2);

function _Separator() {
  return (
    <View style={styles.container}>
      {[...Array(dashes)].map((v, key) => (
        <View style={styles.dash} key={key} />
      ))}
    </View>
  );
}

export const Separator = React.memo(_Separator);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  dash: {
    width,
    backgroundColor: "rgba(255,255,255,0.8)",
    height: 1,
    marginRight: width,
  },
});
