/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  // async act() flushes the AuthProvider's bootstrap effect (token restore +
  // /auth/me) so there are no unwrapped state updates after render.
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
