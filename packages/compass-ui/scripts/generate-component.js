'use strict';

const fs = require('fs');

const prompts = require('prompts');
const kebabCase = require('lodash.kebabcase');
const upperFirst = require('lodash.upperfirst');

const {
    component,
    componentRoot,
    constants,
    types,
    props,
    story,
    barrel,
} = require('./component-templates.js');

const writeFileErrorHandler = (error) => {
    if (error) {
        throw error;
    }
};

const createFiles = (names, group = 'components') => {
    if (!names) {
        throw new Error('You must include a component name.');
    }

    const directory = `./src/${group}/${names.kebab}/`;

    // throw an error if the file already exists
    if (fs.existsSync(directory)) {
        throw new Error('A component with that name already exists.');
    }

    // create the folder
    fs.mkdirSync(directory);

    // component.stories.tsx
    fs.writeFile(`${directory}/${names.pascal}.stories.mdx`, story(names), writeFileErrorHandler);
    // component.props.tsx
    fs.writeFile(`${directory}/${names.pascal}.props.ts`, props(names), writeFileErrorHandler);
    // component.types.tsx
    fs.writeFile(`${directory}/${names.pascal}.types.ts`, types(names), writeFileErrorHandler);
    // component.constants.tsx
    fs.writeFile(
        `${directory}/${names.pascal}.constants.ts`,
        constants(names),
        writeFileErrorHandler
    );
    // component.base.tsx
    fs.writeFile(
        `${directory}/${names.pascal}.root.tsx`,
        componentRoot(names),
        writeFileErrorHandler
    );
    // component.tsx
    fs.writeFile(`${directory}/${names.pascal}.tsx`, component(names), writeFileErrorHandler);
    // index.tsx
    fs.writeFile(`${directory}/index.ts`, barrel(names), writeFileErrorHandler);
};

(async () => {
    const response = await prompts([
        {
            type: 'select',
            name: 'group',
            message: 'Pick the area the component belongs to:',
            choices: [
                {
                    title: 'Foundation',
                    description: 'the foundational parts of the compass design system',
                    value: 'foundations',
                },
                {
                    title: 'Component',
                    description: 'a Component build from the foundations',
                    value: 'components',
                },
                // {
                //     title: 'Pattern',
                //     description: 'a complex structure built from the components',
                //     value: 'patterns',
                // },
                {
                    title: 'Utility',
                    description: 'component that adds dynamic behoviour, styling, etc.',
                    value: 'utilities',
                },
            ],
            initial: 0,
        },
        {
            type: 'text',
            name: 'name',
            message: 'Pick a name for your new component: ',
        },
    ]);

    const { name, group } = response;

    const nameParts = name.replace(/\W/gmu, ';').split(';');
    const pascalName = nameParts.map((s) => upperFirst(s)).join('');
    const kebabName = kebabCase(pascalName);

    const names = {
        natural: name,
        kebab: kebabName,
        pascal: pascalName,
    };

    createFiles(names, group);
})();
