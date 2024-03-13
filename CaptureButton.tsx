import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

type CaptureButtonProps = TouchableOpacityProps & {
  onPress: () => void;
};

export function CaptureButton(props: CaptureButtonProps) {
  return (
    <TouchableOpacity {...props}>
      <View style={styles.outerCircle}>
        <View style={styles.innerCircle} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 6,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
});
