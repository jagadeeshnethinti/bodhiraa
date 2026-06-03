import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../theme';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search…',
  value,
  onChangeText,
  style,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.bar, focused && styles.focused, style]}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.text3}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3EDE4',
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focused: {
    backgroundColor: Colors.white,
    borderColor: 'rgba(196,149,96,0.35)',
  },
  icon: { fontSize: 16 },
  input: {
    flex: 1,
    fontSize: 13.5,
    color: Colors.text,
    padding: 0,
  },
});
