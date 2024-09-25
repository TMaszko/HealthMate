import { View, Dimensions, TextInput } from "react-native";
import BMIList, { ROW_HEIGHT } from "./BMIList";
import Animated, {
  SharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  scrollTo,
  runOnUI,
  interpolate,
  Extrapolation,
  useAnimatedProps,
  createAnimatedPropAdapter,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { useHeaderHeight } from "@react-navigation/elements";

const TARGET_CIRCLE_RADIUS = 50;
const ANCHOR_CIRCLE_RADIUS = 8;
const DEBUG_CIRCLE_RADIUS = 80;

const TextInputAdapter = createAnimatedPropAdapter(
  (props) => {
    "worklet";
    const keys = Object.keys(props);
    // convert text to value like RN does here: https://github.com/facebook/react-native/blob/f2c6279ca497b34d5a2bfbb6f2d33dc7a7bea02a/Libraries/Components/TextInput/TextInput.js#L878
    if (keys.includes("value")) {
      props.text = props.value;
      delete props.value;
    }
  },
  ["text"]
);

interface WeightTargetProps {
  height: number;
  weight: number;
}
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function WeightTarget({ height, weight }: WeightTargetProps) {
  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const headerHeight = useHeaderHeight();
  const BMI = weight / (height * height);

  const BMI_R = Math.round(BMI);
  const ySv = useSharedValue(0);
  const from = BMI_R - 10;
  const to = BMI_R + 10;
  const initialTranslateY = (to - BMI + 1) * ROW_HEIGHT;
  console.log("headerHeight: ", headerHeight);
  const screenHeight = Dimensions.get("window").height - headerHeight;
  const initialScrollY =
    initialTranslateY - screenHeight / 2 - TARGET_CIRCLE_RADIUS;
  console.log("to - BMI + 1", to - BMI + 1);

  console.log("BMI: ", BMI.toFixed(2));
  console.log("From: ", from);
  console.log("to: ", to);
  console.log("initialTranslateY: ", initialTranslateY);
  console.log("screenHeight", screenHeight);
  console.log("DIMENSIONS: ", Dimensions.get("screen").height);
  console.log("initialScrollY: ", initialScrollY);

  console.log("screenHeight / 2 ", screenHeight / 2 - TARGET_CIRCLE_RADIUS);

  const handler = useAnimatedScrollHandler(
    {
      onScroll: ({ contentOffset: { y } }) => {
        ySv.value = y;
        console.log(ySv.value);
      },
    },
    []
  );

  useEffect(() => {
    setTimeout(() => {
      runOnUI(() => {
        scrollTo(animatedRef, 0, initialScrollY, true);
      })();
    }, 20);
  });

  const range = to - from + 1;

  const MAX_SCROLL = ROW_HEIGHT * range - screenHeight;

  return (
    <>
      <Animated.ScrollView
        ref={animatedRef}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={handler}
        contentOffset={{ y: 0, x: 0 }}
        contentContainerStyle={{
          justifyContent: "flex-start",
        }}
      >
        <BMIList from={from} to={to} />
      </Animated.ScrollView>

      <TargetCircle
        initialScrollY={initialScrollY}
        y={ySv}
        height={height}
        initialBMI={BMI}
        from={from}
        to={to}
        initialWeight={weight}
        screenHeight={screenHeight}
        maxScroll={MAX_SCROLL}
      />
    </>
  );
}

interface TargetCircleProps {
  maxScroll: number;
  y: SharedValue<number>;
  from: number;
  to: number;
  height: number;
  initialBMI: number;
  screenHeight: number;
  initialScrollY: number;
  initialWeight: number;
}

function TargetCircle({
  y,
  screenHeight,
  initialScrollY,
  maxScroll,
  height,
  initialBMI,
  initialWeight,
  from,
  to,
}: TargetCircleProps) {
  const translateY = useDerivedValue(() => {
    const translateYInterpolated = interpolate(
      y.value,
      [0, initialScrollY, maxScroll],
      [
        0,
        screenHeight / 2 - TARGET_CIRCLE_RADIUS,
        screenHeight - TARGET_CIRCLE_RADIUS * 2,
      ],
      Extrapolation.CLAMP
    );

    return translateYInterpolated;
  });

  const screenTranslationPerScroll =
    (screenHeight -
      2 * TARGET_CIRCLE_RADIUS -
      (screenHeight / 2 - TARGET_CIRCLE_RADIUS)) /
    (maxScroll - initialScrollY);
  const screenTranslationPerScrollAnchor =
    (screenHeight / 2 - ANCHOR_CIRCLE_RADIUS) / (maxScroll - initialScrollY);

  const velocity2PerScroll =
    (screenHeight / 2 - TARGET_CIRCLE_RADIUS) / initialScrollY;

  const velocity3PerScroll =
    (screenHeight / 2 - ANCHOR_CIRCLE_RADIUS) / initialScrollY;

  const relativeDistance = useDerivedValue(() => {
    return (
      Math.abs(screenTranslationPerScrollAnchor) +
      Math.abs(screenTranslationPerScroll)
    );
  });

  const relativeDistance2 = useDerivedValue(() => {
    return Math.abs(velocity2PerScroll) + Math.abs(velocity3PerScroll);
  });
  const startPoint2 = useDerivedValue(() => {
    return (
      (TARGET_CIRCLE_RADIUS + ANCHOR_CIRCLE_RADIUS) / relativeDistance2.value
    );
  });

  const startPoint = useDerivedValue(() => {
    const point =
      (TARGET_CIRCLE_RADIUS + ANCHOR_CIRCLE_RADIUS) / relativeDistance.value;

    return point;
  });

  const translateYAnchor = useDerivedValue(() => {
    return interpolate(
      y.value,
      [0, initialScrollY, maxScroll],
      [
        screenHeight - 2 * ANCHOR_CIRCLE_RADIUS,
        screenHeight / 2 - ANCHOR_CIRCLE_RADIUS,
        0,
      ],
      Extrapolation.CLAMP
    );
  });

  const translateYDebug = useDerivedValue(() => {
    const temp =
      (screenHeight / 2 - ANCHOR_CIRCLE_RADIUS) / (maxScroll - initialScrollY);

    const temp2 = (screenHeight / 2 - ANCHOR_CIRCLE_RADIUS) / initialScrollY;

    return interpolate(
      y.value,
      [
        0,
        initialScrollY - startPoint2.value,
        initialScrollY,
        initialScrollY + startPoint.value,
        maxScroll,
      ],
      [
        (screenHeight - 2 * ANCHOR_CIRCLE_RADIUS - 2 * TARGET_CIRCLE_RADIUS) /
          2 +
          2 * TARGET_CIRCLE_RADIUS -
          DEBUG_CIRCLE_RADIUS,
        screenHeight / 2 -
          DEBUG_CIRCLE_RADIUS +
          temp2 * startPoint2.value -
          ANCHOR_CIRCLE_RADIUS,
        screenHeight / 2 - DEBUG_CIRCLE_RADIUS,
        screenHeight / 2 -
          DEBUG_CIRCLE_RADIUS -
          temp * startPoint.value +
          ANCHOR_CIRCLE_RADIUS,
        (screenHeight - 2 * ANCHOR_CIRCLE_RADIUS - 2 * TARGET_CIRCLE_RADIUS) /
          2 +
          2 * ANCHOR_CIRCLE_RADIUS -
          DEBUG_CIRCLE_RADIUS,
      ],
      Extrapolation.CLAMP
    );
  });

  const scale = useDerivedValue(() => {
    return interpolate(
      y.value,
      [
        0,
        initialScrollY - startPoint2.value,
        initialScrollY,
        initialScrollY + startPoint.value,
        maxScroll,
      ],
      [1, 0.15, 0.02, 0.15, 1]
    );
  });

  const animatedStyleDebug = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: -DEBUG_CIRCLE_RADIUS },
        { translateY: translateYDebug.value },
        { scale: scale.value },
      ],
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: -TARGET_CIRCLE_RADIUS },
        { translateY: translateY.value },
      ],
    };
  });

  const heightVLine = useDerivedValue(() => {
    const heightVLineInterpolated = interpolate(
      y.value,
      [
        0,
        initialScrollY - startPoint2.value,
        initialScrollY,
        initialScrollY + startPoint.value,
        maxScroll,
      ],
      [
        screenHeight - 2 * TARGET_CIRCLE_RADIUS - 2 * ANCHOR_CIRCLE_RADIUS,
        0,
        0,
        0,
        screenHeight - 2 * TARGET_CIRCLE_RADIUS - 2 * ANCHOR_CIRCLE_RADIUS,
      ],
      Extrapolation.CLAMP
    );
    return heightVLineInterpolated;
  });

  const weightSV = useDerivedValue(() => {
    const bmiInterpolated = interpolate(
      y.value,
      [0, initialScrollY, maxScroll],
      [to, initialBMI, from],
      Extrapolation.CLAMP // Header height is not accurate enough :(
    );
    return height * height * bmiInterpolated;
  });

  const weightStringSv = useDerivedValue(() => {
    return `${weightSV.value.toFixed(1)}`;
  });

  const animatedProps = useAnimatedProps(
    () => {
      return {
        value: weightStringSv.value,
      };
    },
    [],
    TextInputAdapter
  );

  const animatedPropsDebug = useAnimatedProps(
    () => {
      return {
        value: `${(weightSV.value - initialWeight).toFixed(1)}`,
      };
    },
    [],
    TextInputAdapter
  );

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: "50%",
        },
      ]}
    >
      <AnchorCircle translateY={translateYAnchor} />
      <Animated.View style={[{ position: "absolute" }]}>
        <VLine height={heightVLine} translateY={translateYDebug} />
      </Animated.View>
      <Animated.View style={[{ position: "absolute" }, animatedStyleDebug]}>
        <View
          style={{
            width: DEBUG_CIRCLE_RADIUS * 2,
            height: DEBUG_CIRCLE_RADIUS * 2,
            borderRadius: DEBUG_CIRCLE_RADIUS,
            borderColor: "rgba(255,255,255,0.8)",

            borderWidth: 1,
            backgroundColor: "#69d0fb",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatedTextInput
            style={{
              color: "white",
              fontSize: 38,
            }}
            animatedProps={animatedPropsDebug}
          />
        </View>
      </Animated.View>

      <Animated.View style={[{ position: "absolute" }, animatedStyle]}>
        <View
          style={{
            width: TARGET_CIRCLE_RADIUS * 2,
            height: TARGET_CIRCLE_RADIUS * 2,
            borderRadius: TARGET_CIRCLE_RADIUS,
            backgroundColor: "rgba(255,255,255,1)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatedTextInput
            style={{ color: "#69d0fb", fontSize: 30 }}
            animatedProps={animatedProps}
          ></AnimatedTextInput>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function AnchorCircle({ translateY }: { translateY: SharedValue<number> }) {
  return (
    <Animated.View
      style={{
        width: ANCHOR_CIRCLE_RADIUS * 2,
        height: ANCHOR_CIRCLE_RADIUS * 2,
        borderRadius: ANCHOR_CIRCLE_RADIUS,
        backgroundColor: "rgba(255,255,255,0.5)",
        position: "absolute",
        top: 0,
        left: "50%",
        transform: [{ translateX: -ANCHOR_CIRCLE_RADIUS }, { translateY }],
      }}
    />
  );
}

function VLine({
  height,
  translateY,
}: {
  height: SharedValue<number>;
  translateY: SharedValue<number>;
}) {
  const derivedTranslate = useDerivedValue(
    () => translateY.value + DEBUG_CIRCLE_RADIUS
  );
  return (
    <>
      <Animated.View
        style={{
          backgroundColor: "rgba(255,255,255,1)",
          position: "absolute",
          top: 0,
          left: "50%",
          width: 1,
          height: 1,
          transform: [{ translateY: derivedTranslate }, { scaleY: height }],
        }}
      />
    </>
  );
}

export default WeightTarget;
