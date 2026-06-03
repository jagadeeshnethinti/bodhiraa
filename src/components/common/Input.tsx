import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Colors, Radius } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  rightElement,
  leftElement,
  containerStyle,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View
        style={[
          styles.container,
          focused && styles.focused,
          !!error && styles.error,
        ]}
      >
        {label ? (
          <Text style={styles.label}>{label.toUpperCase()}</Text>
        ) : null}
        <View style={styles.row}>
          {leftElement}
          <TextInput
            style={styles.input}
            placeholderTextColor={Colors.text3}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
          {rightElement}
        </View>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  container: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  focused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 0,
  },
  error: { borderColor: Colors.danger },
  label: {
    fontSize: 10,
    color: Colors.text3,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
    padding: 0,
  },
  errorText: {
    fontSize: 10,
    color: Colors.danger,
    marginTop: 3,
    marginLeft: 2,
  },
});
