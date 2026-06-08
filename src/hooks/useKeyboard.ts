import { useEffect, useState } from 'react';
import { Keyboard, Platform, type KeyboardEvent } from 'react-native';

export interface KeyboardInfo {
  visible: boolean;
  /** Height of the keyboard in px (0 when hidden). */
  height: number;
}

/**
 * Tracks keyboard visibility + height. iOS exposes `keyboardWillShow/Hide`
 * (fires with the animation, so UI moves in sync); Android only has the
 * `…Did…` variants.
 *
 * Used to lift a pinned footer (the AI chat composer) above the keyboard on
 * iOS. Android doesn't need it — `adjustResize` (see AndroidManifest.xml, with
 * edge-to-edge disabled) resizes the window so the footer rises on its own.
 */
export function useKeyboard(): KeyboardInfo {
  const [info, setInfo] = useState<KeyboardInfo>({ visible: false, height: 0 });

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: KeyboardEvent) =>
      setInfo({ visible: true, height: e.endCoordinates?.height ?? 0 });
    const onHide = () => setInfo({ visible: false, height: 0 });
    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return info;
}

export function useKeyboardVisible(): boolean {
  return useKeyboard().visible;
}
