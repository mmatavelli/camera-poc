import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import type { PropsWithChildren } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { ClipPath, Defs, Path, Rect, Svg, TSpan, Text } from 'react-native-svg';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { CaptureButton } from './CaptureButton';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

const {width, height} = Dimensions.get('window');

const cropDimensions = {
  width: width,
  height: height / 2.5,
};

function CropArea() {
  // Define dimensions with space on the left and right sides
  const cropWidth = width - 6;
  const cropHeight = height / 2.5;

  // Calculate position with the space taken into account
  const cropX = 3; // Start 1px from the left edge

  const cornerRadius = 6;

  const textBottom = height / 4 + height / 2.5 + 80;
  const textLeftMargin = width * 0.05; // 5% of the screen width
  const textFontSize = Math.min(width, height) * 0.05;

  // create a transparent overlay with a dashed rectangle crop area
  return (
    <Svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        zIndex: 1,
      }}>
      {/* Dark overlay outside crop area */}
      <Defs>
        <ClipPath id="cropPath">
          <Path
            d={`M0 0 h${width} v${height} h-${width} v-${height} M${cropX} ${
              height / 4
            } h${cropWidth} v${cropHeight} h-${cropWidth} Z`}
            fill="transparent"
          />
        </ClipPath>
      </Defs>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="rgba(0, 0, 0, 0.5)"
        clipPath="url(#cropPath)"
      />
      {/* Crop area */}
      <Rect
        x={cropX}
        y={height / 4}
        width={cropWidth}
        height={cropHeight}
        stroke="white"
        strokeWidth={6}
        strokeDasharray="50 10"
        fill="transparent"
        rx={cornerRadius}
      />
      <Text
        x={textLeftMargin}
        y={textBottom}
        fill="white"
        fontSize={textFontSize} // Set font size
        textAnchor="start">
        <TSpan x={textLeftMargin} dy={-1.2 * textFontSize}>
          *** Somente a imagem dentro do quadrado
        </TSpan>
        <TSpan x={textLeftMargin} dy={1.2 * textFontSize}>
          será enviada para a Goodyear.
        </TSpan>
      </Text>
    </Svg>
  );
}

function App() {
  const camera = useRef<Camera>(null);

  const {hasPermission, requestPermission} = useCameraPermission();

  const device = useCameraDevice('back');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  async function handleCapture() {
    const file = await camera.current
      ?.takePhoto({
        qualityPrioritization: 'speed',
      })
      .catch(e => {
        console.log('error', e);
      });

    console.log('file', file);

    if (!file) {
      return;
    }

    await CameraRoll.saveAsset(`file://${file.path}`, {
      type: 'photo',
    });
  }

  const focus = useCallback((point: Point) => {
    const c = camera.current;
    if (c == null) {
      return;
    }
    c.focus(point);
  }, []);

  const gesture = Gesture.Tap().onEnd(({x, y}) => {
    runOnJS(focus)({x, y});
  });

  if (device == null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <GestureDetector gesture={gesture}>
        <View style={StyleSheet.absoluteFill}>
          <Camera
            ref={camera}
            style={styles.camera}
            device={device}
            photo
            isActive={true}>
            <CropArea />
          </Camera>
          {/* Add a text to explain the crop area  */}

          <CaptureButton onPress={handleCapture} style={styles.captureButton} />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  captureButton: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
  },
  // This is a black overlay that covers the camera preview
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default App;
