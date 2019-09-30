import {create} from '@storybook/theming';

export default create({
    base: 'light',

    colorPrimary: '#166de0',
    colorSecondary: 'rgb(35, 137, 215)',

    // UI
    appBg: 'white',
    appContentBg: 'white',
    appBorderColor: 'rgba(0, 0, 0, .15)',
    appBorderRadius: 4,

    // Typography
    fontBase: '"Open Sans", sans-serif',
    fontCode: 'monospace',

    // Text colors
    textColor: 'black',
    textInverseColor: 'rgba(255,255,255,0.9)',

    // Toolbar default and active colors
    barTextColor: 'rgb(215, 215, 215);',
    barSelectedColor: 'white',
    barBg: '#166de0',

    // Form colors
    inputBg: 'white',
    inputBorder: 'silver',
    inputTextColor: 'black',
    inputBorderRadius: 4,

    brandTitle: 'Mattermost',
    brandUrl: 'https://mattermost.org',
    brandImage: 'https://www.mattermost.org/wp-content/uploads/2016/03/logoHorizontal.png',
});
