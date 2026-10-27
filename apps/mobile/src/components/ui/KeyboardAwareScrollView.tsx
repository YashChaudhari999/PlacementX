import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import {
  findNodeHandle,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  type TextInput,
} from 'react-native';

type KeyboardAwareContextValue = (input: TextInput | null) => void;

const KeyboardAwareContext = createContext<KeyboardAwareContextValue>(() => undefined);

export const useKeyboardAwareInput = () => useContext(KeyboardAwareContext);

type KeyboardAwareScrollViewProps = ScrollViewProps & {
  extraScrollHeight?: number;
  keyboardVerticalOffset?: number;
};

export const KeyboardAwareScrollView = ({
  children,
  extraScrollHeight = 24,
  keyboardVerticalOffset = 0,
  keyboardDismissMode,
  keyboardShouldPersistTaps = 'handled',
  ...props
}: KeyboardAwareScrollViewProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const pendingInput = useRef<TextInput | null>(null);
  const keyboardVisible = useRef(false);

  const revealInput = useCallback((input: TextInput | null) => {
    const node = findNodeHandle(input);
    const responder = scrollRef.current?.getScrollResponder();
    if (!node || !responder) return;
    requestAnimationFrame(() => {
      responder.scrollResponderScrollNativeHandleToKeyboard(node, extraScrollHeight, true);
    });
  }, [extraScrollHeight]);

  const handleInputFocus = useCallback((input: TextInput | null) => {
    pendingInput.current = input;
    if (keyboardVisible.current) revealInput(input);
  }, [revealInput]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, event => {
      keyboardVisible.current = true;
      Keyboard.scheduleLayoutAnimation(event);
      revealInput(pendingInput.current);
    });
    const hide = Keyboard.addListener(hideEvent, event => {
      keyboardVisible.current = false;
      Keyboard.scheduleLayoutAnimation(event);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [revealInput]);

  return (
    <KeyboardAwareContext.Provider value={handleInputFocus}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <ScrollView
          ref={scrollRef}
          keyboardDismissMode={keyboardDismissMode ?? (Platform.OS === 'ios' ? 'interactive' : 'on-drag')}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          {...props}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </KeyboardAwareContext.Provider>
  );
};
