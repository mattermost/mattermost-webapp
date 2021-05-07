import { addParameters, addDecorator } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { withThemes } from 'storybook-addon-themes/react';

addDecorator(withThemes);

import lightTheme from '../src/foundations/theme-provider/themes/theme.light';
import themeDark from '../src/foundations/theme-provider/themes/theme.dark';
import {
    CanvasThemeProvider,
    DocumentationThemeProvider,
} from '../src/foundations/theme-provider/theme-provider';
import { DocsContainer } from '@storybook/addon-docs/blocks';

const themes = [
    {
        name: 'light',
        class: 'compass-light',
        color: lightTheme.background.default,
        definition: lightTheme,
        default: true,
    },
    {
        name: 'dark',
        class: 'compass-dark',
        color: themeDark.background.default,
        definition: themeDark,
    },
];

const CustomDecorator = ({ theme, children }) => (
    <CanvasThemeProvider theme={theme.definition} children={children} />
);

addParameters({
    dependencies: {
        // display only dependencies/dependents that have a story in storybook
        // by default this is false
        withStoriesOnly: true,

        // completely hide a dependency/dependents block if it has no elements
        // by default this is false
        hideEmpty: true,
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    layout: 'centered',
    controls: { hideNoControlsWarning: true },
    viewport: {
        viewports: INITIAL_VIEWPORTS,
    },
    options: {
        storySort: (a, b) => {
            if (a[0].toLocaleLowerCase().includes('overview')) return -1;
            if (b[0].toLocaleLowerCase().includes('overview')) return 1;
            return 0;
        },
    },
    backgrounds: {
        grid: {
            cellSize: 4,
            opacity: 0.2,
            cellAmount: 16,
        },
        disable: true,
    },
    themes: {
        list: themes,
        clearable: false,
        Decorator: CustomDecorator,
    },
    docs: {
        container: ({ context, children }) => {
            return (
                <DocsContainer context={context}>
                    <DocumentationThemeProvider>{children}</DocumentationThemeProvider>
                </DocsContainer>
            );
        },
    },
});
