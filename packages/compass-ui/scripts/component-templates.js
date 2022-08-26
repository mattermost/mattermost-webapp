'use strict';

const lowerFirst = require('lodash.lowerfirst');
const snakeCase = require('lodash.snakecase');
const toUpper = require('lodash.toupper');

// component.tsx
const component = (names) => `import React from 'react';

import { DEFAULT_${toUpper(snakeCase(names.kebab))}_SIZE } from './${names.pascal}.constants';
import type P${names.pascal} from './${names.pascal}.props';
import ${names.pascal}Root from './${names.pascal}.root';

const ${names.pascal}: React.FC<P${names.pascal}> = (props: P${names.pascal}): JSX.Element => {
    const { size = DEFAULT_${toUpper(snakeCase(names.kebab))}_SIZE, ...rest } = props;

    const rootProperties = {
        size,
        ...rest,
    };

    return (
        <${names.pascal}Root {...rootProperties}>Hello 👋, I am a ${names.pascal} component.</${names.pascal}Root>
    );
};

export default ${names.pascal};
`;

// component.root.tsx
const componentRoot = (names) => `import styled, { css } from 'styled-components';
import type { FlattenSimpleInterpolation, ThemedStyledProps } from 'styled-components';

import type { TTheme } from '../../utilities/theme';

import {
    ${toUpper(snakeCase(names.kebab))}_DEFINITIONS,
} from './${names.pascal}.constants';
import type { P${names.pascal}Root } from './${names.pascal}.props';

const ${names.pascal} = styled.div<P${names.pascal}Root>(
    (props: ThemedStyledProps<P${names.pascal}Root, TTheme>): FlattenSimpleInterpolation => {
        const { size, theme } = props;

        return css\`
            display: flex;
            align-items: center;
            justify-content: center;
    
            color: $\{theme.text.primary};
    
            width: $\{${toUpper(snakeCase(names.kebab))}_DEFINITIONS[size]}px;
            height: $\{${toUpper(snakeCase(names.kebab))}_DEFINITIONS[size]}px;
        \`
    }
);

export default ${names.pascal};
`;

// component.stories.mdx
const story = (
    names
) => `import { ArgsTable, Canvas, Meta, Story } from '@storybook/addon-docs/blocks';
import { Utils } from '../../shared';

import {
    ${toUpper(snakeCase(names.kebab))}_SIZES,
    ${toUpper(snakeCase(names.kebab))}_SIZE_LABELS,
    DEFAULT_${toUpper(snakeCase(names.kebab))}_SIZE
} from './${names.pascal}.constants';
import ${names.pascal} from './${names.pascal}';

export const ${lowerFirst(names.pascal)}Args = {
    size: DEFAULT_${toUpper(snakeCase(names.kebab))}_SIZE,
};

export const ${lowerFirst(names.pascal)}ArgTypes = {
    size: {
        options: ${toUpper(snakeCase(names.kebab))}_SIZES,
        control: {
            type: 'select',
            labels: ${toUpper(snakeCase(names.kebab))}_SIZE_LABELS,
        },
    },
    ...Utils.hideComponentProperties(),
};

<Meta title={'Components/${names.pascal}'} />

<ArgsTable of={${names.pascal}} />

<Canvas hidden>
    <Story name="default" args={${lowerFirst(names.pascal)}Args} argTypes={${lowerFirst(
    names.pascal
)}ArgTypes}>
        {(args) => <${names.pascal} {...args} />}
    </Story>
</Canvas>
`;

// component.constants.ts
const constants = (names) => `import type { T${names.pascal}SizeToken, T${
    names.pascal
}Number } from './${names.pascal}.types';

const ${toUpper(snakeCase(names.kebab))}_SIZES: T${names.pascal}SizeToken[] = [
    'xxxs',
    'xxs',
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    'xxl',
    'xxxl',
];

const ${toUpper(snakeCase(names.kebab))}_SIZE_LABELS: { [size in T${
    names.pascal
}SizeToken]: string } = {
    xxxs: 'xxx-small',
    xxs: 'xx-small',
    xs: 'x-small',
    sm: 'small',
    md: 'medium',
    lg: 'large',
    xl: 'x-large',
    xxl: 'xx-large',
    xxxl: 'xxx-large',
};

const DEFAULT_${toUpper(snakeCase(names.kebab))}_SIZE: T${names.pascal}SizeToken = 'md';

const ${toUpper(snakeCase(names.kebab))}_DEFINITIONS: { [size in T${names.pascal}SizeToken]: T${
    names.pascal
}Number } = {
    xxxs: 200,
    xxs: 200,
    xs: 200,
    sm: 200,
    md: 200,
    lg: 200,
    xl: 200,
    xxl: 200,
    xxxl: 200,
};

export {
    ${toUpper(snakeCase(names.kebab))}_SIZES,
    DEFAULT_${toUpper(snakeCase(names.kebab))}_SIZE,
    ${toUpper(snakeCase(names.kebab))}_SIZE_LABELS,
    ${toUpper(snakeCase(names.kebab))}_DEFINITIONS,
};
`;

// component.props.ts
const props = (names) => `import type { T${names.pascal}SizeToken } from './${names.pascal}.types';

type P${names.pascal} = {
    /**
     * the size token to define the ${names.pascal} size
     * @default 'md'
     */
    size?: T${names.pascal}SizeToken;
    className?: string;
};

export type P${names.pascal}Root = Required<Omit<P${names.pascal}, 'className'>>;

export default P${names.pascal};
`;

// component.types.ts
const types = (names) => `import type { TComponentSizeToken } from '../../shared';

type T${names.pascal}Number = number;

export type { T${names.pascal}Number, TComponentSizeToken as T${names.pascal}SizeToken };
`;

// index.ts
const barrel = (names) => `export * from './${names.pascal}.constants';
export * from './${names.pascal}.props';
export * from './${names.pascal}.types';

export { default } from './${names.pascal}';
`;

module.exports = {
    component,
    componentRoot,
    constants,
    props,
    types,
    story,
    barrel,
};
