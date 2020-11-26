import { addDecorator } from '@storybook/react';

import GlobalStyles from '../src/GlobalStyles';

addDecorator((s) => (
    <>
        <GlobalStyles />
        {s()}
    </>
));

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: { expanded: true },
}
