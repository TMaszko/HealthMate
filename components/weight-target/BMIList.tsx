import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Separator } from "./Separator";
import React from "react";

export const ROW_HEIGHT = 100;

interface BMIListProps {
  from: number;
  to: number;
}

interface ItemProps {
  children: React.ReactNode;
}

const separators = {
  18: "Underweight",
  19: "Healthy weight",
  24: "Healthy weight",
  25: "Overweight",
  29: "Overweight",
  30: "Obese",
} as Record<number, string>;

function Item({ children }: ItemProps) {
  return (
    <View
      style={{
        justifyContent: "flex-start",
        flexDirection: "row",
      }}
    >
      {children}
    </View>
  );
}

function BMIList({ from, to }: BMIListProps) {
  const length = to - from + 1;
  const list = useMemo(() => {
    return Array.from({ length }, (v, k) => from + k).reverse();
  }, [length]);
  return (
    <>
      {list.map((bmi) => {
        return (
          <React.Fragment key={bmi}>
            <Item>
              <View style={styles.row}>
                <Text style={styles.label}>BMI {bmi}</Text>
                {separators[bmi] ? (
                  <Text
                    style={[
                      styles.separatorText,
                      {
                        alignSelf:
                          separators[bmi] && separators[bmi - 1]
                            ? "flex-end"
                            : "flex-start",
                      },
                    ]}
                  >
                    {separators[bmi]}
                  </Text>
                ) : null}
                <View
                  style={{
                    position: "absolute",
                    top:
                      separators[bmi] && separators[bmi - 1]
                        ? ROW_HEIGHT
                        : -ROW_HEIGHT,
                    alignSelf:
                      separators[bmi] && separators[bmi - 1]
                        ? "flex-end"
                        : "flex-start",
                  }}
                >
                  {separators[bmi] && separators[bmi - 1] ? (
                    <Separator />
                  ) : null}
                </View>
              </View>
            </Item>
          </React.Fragment>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  label: {
    color: "white",
    fontSize: 18,
  },
  separatorText: {
    marginLeft: "auto",
    color: "white",
  },
});

export default BMIList;
