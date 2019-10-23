import {configure, addParameters} from '@storybook/react';
import theme from './theme.js';

// automatically import all files ending in *.stories.js
const reqComponents = require.context('../components', true, /\.stories\.(js|jsx|ts|tsx)?$/);
const reqCommon = require.context('../storybook', true, /\.stories\.(js|jsx|ts|tsx)?$/);
function loadStories() {
    reqComponents.keys().forEach((filename) => reqComponents(filename));
    reqCommon.keys().forEach((filename) => reqCommon(filename));
}

addParameters({
    options: {theme},
});

configure(loadStories, module);
