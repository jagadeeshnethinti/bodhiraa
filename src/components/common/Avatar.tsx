import React, { useState } from 'react';
import { View, Text, Image, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { resolveMediaUrl } from '../../api';
import { initials } from '../../utils/ui';

interface AvatarProps {
  /** Relative (`/cloud/...`) or absolute avatar URL from the backend. */
  uri?: string | null;
  /** Used to derive initials when there's no image (or it fails to load). */
  name?: string | null;
  /**
   * Shared style for both the image and the initials circle — pass the same
   * `styles.avatar` the screen already uses so sizing/border-radius match.
   */
  style?: StyleProp<ViewStyle> & StyleProp<ImageStyle>;
  /** Style for the fallback initials text. */
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Renders the user's uploaded avatar when available, falling back to a circle
 * of initials. Backend avatars come back as relative URLs (e.g.
 * `/cloud/2026/06/13/prof-img.jpg`) so we resolve them against the API origin;
 * if the image 404s or fails to decode we fall back to initials too.
 */
export const Avatar: React.FC<AvatarProps> = ({ uri, name, style, textStyle }) => {
  const [failed, setFailed] = useState(false);
  const resolved = resolveMediaUrl(uri);

  if (resolved && !failed) {
    return (
      <Image
        source={{ uri: resolved }}
        style={style as StyleProp<ImageStyle>}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View style={style}>
      <Text style={textStyle}>{initials(name)}</Text>
    </View>
  );
};
