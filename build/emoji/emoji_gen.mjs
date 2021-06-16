// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/*
* This script will auto generate all the needed files for both the webapp and server to use emojis from emoji-datasource
* in order to locate the server path, you'll need to define the $SERVER_PATH environment variable,
* otherwise the file will be placed in the root of the project.
* if you don't want to set it but for this run you can run it like:
* $ $SERVER_ENV=<path_to_server> npm run make-emojis
 */

/* eslint-disable no-console */
/* eslint-disable no-process-env */

// eslint-disable-next-line import/no-unresolved
import * as Fs from 'fs/promises';

import path from 'path';

import jsonData from 'emoji-datasource/emoji.json';
import jsonCategories from 'emoji-datasource/categories.json';

const EMOJI_SIZE = 64;
const EMOJI_SIZE_PADDED = EMOJI_SIZE + 2; // 1px per side
const endResults = [];

// copy image files
const source = `node_modules/emoji-datasource-apple/img/apple/${EMOJI_SIZE}/`;
const readDirPromise = Fs.readdir(source);
endResults.push(readDirPromise);
readDirPromise.then((images) => {
    console.log(`I will now copy ${images.length} emoji images, this might take a while`);
    for (const imageFile of images) {
        endResults.push(Fs.copyFile(
            path.join(source, imageFile),
            path.join('images/emoji', imageFile),
        ).catch((err) => console.log(`[ERROR] Failed to copy ${imageFile}: ${err}`)));
    }
});

// copy sheet image
const sheetSource = `node_modules/emoji-datasource-apple/img/apple/sheets/${EMOJI_SIZE}.png`;
const sheetFile = 'images/emoji-sheets/apple-sheet.png';
console.log('Copy sprite sheet');
Fs.copyFile(sheetSource, sheetFile).catch((err) => console.log(`[ERROR] Failed to copy sheet file: ${err}`));

// we'll load it as a two dimensional array so we can generate a Map out of it
const emojiIndicesByAlias = [];
const emojiIndicesByUnicode = [];
const emojiIndicesByCategory = new Map();
const categoryNamesSet = new Set();
const categoryDefaultTranslation = new Map();
const emojiImagesByAlias = [];
const emojiFilePositions = new Map();
const skinCodes = {
    '1F3FB': 'light_skin_tone',
    '1F3FC': 'medium_light_skin_tone',
    '1F3FD': 'medium_skin_tone',
    '1F3FE': 'medium_dark_skin_tone',
    '1F3FF': 'dark_skin_tone',
};

const skinNames = {
    '1F3FB': 'LIGHT SKIN TONE',
    '1F3FC': 'MEDIUM LIGHT SKIN TONE',
    '1F3FD': 'MEDIUM SKIN TONE',
    '1F3FE': 'MEDIUM DARK SKIN TONE',
    '1F3FF': 'DARK SKIN TONE',
};
const control = new AbortController();
const writeOptions = {
    encoding: 'utf8',
    signal: control.signal,
};

function filename(emoji) {
    return emoji.image.split('.')[0];
}

function writeFile(fileName, filePath, data) {
    const promise = Fs.writeFile(filePath, data, writeOptions);

    promise.then(() => {
        console.log(`${fileName} generated successfully.`);
    });
    return promise;
}

function convertCategory(category) {
    return category.toLowerCase().replace(' & ', '-');
}

function genSkinVariations(emoji, index, nextOrder) {
    if (!emoji.skin_variations) {
        return [];
    }
    let order = nextOrder;
    return Object.keys(emoji.skin_variations).map((skinCode) => {
        // if skin codes ever change this will produce a null_light_skin_tone
        const skins = skinCode.split('-');
        const skinShortName = skins.map((code) => skinCodes[code]).join('_');
        const skinName = skins.map((code) => skinNames[code]).join(', ');
        const variation = {...emoji.skin_variations[skinCode]};
        variation.short_name = `${emoji.short_name}_${skinShortName}`;
        variation.short_names = emoji.short_names.map((alias) => `${alias}_${skinShortName}`);
        variation.name = `${emoji.name}: ${skinName}`;
        variation.category = emoji.category;
        variation.subcategory = emoji.subcategory;
        variation.skins = skins;
        variation.source_index = index;
        variation.sort_order = order++;
        return variation;
    });
}

// populate skin tones as full emojis
let nextOrder = jsonData.length;
const fullEmoji = [...jsonData];
jsonData.forEach((emoji, index) => {
    const variations = genSkinVariations(emoji, index, nextOrder);
    nextOrder += variations.length;
    fullEmoji.push(...variations);
});

fullEmoji.sort((emojiA, emojiB) => emojiA.sort_order - emojiB.sort_order);

fullEmoji.forEach((emoji, index) => {
    emojiIndicesByUnicode.push([emoji.unified.toLowerCase(), index]);
    const safeCat = convertCategory(emoji.category);
    emoji.category = safeCat;
    categoryDefaultTranslation.set(safeCat, emoji.category);
    const catIndex = emojiIndicesByCategory.get(safeCat) || [];
    catIndex.push(index);
    emojiIndicesByCategory.set(safeCat, catIndex);
    categoryNamesSet.add(safeCat);
    emojiIndicesByAlias.push(...emoji.short_names.map((alias) => [alias, index]));
    const file = filename(emoji);
    emoji.fileName = emoji.image;
    emoji.image = file;
    emojiFilePositions.set(file, `-${emoji.sheet_x * EMOJI_SIZE_PADDED}px -${emoji.sheet_y * EMOJI_SIZE_PADDED}px;`);
    emojiImagesByAlias.push(...emoji.short_names.map((alias) => `"${alias}": "${file}"`));
});

// write emoji.json
endResults.push(writeFile('emoji.json', 'utils/emoji.json', JSON.stringify(fullEmoji)));

const categoryList = Object.keys(jsonCategories).filter((item) => item !== 'Component').map(convertCategory);
const categoryNames = ['recent', ...categoryList, 'custom'];
categoryDefaultTranslation.set('recent', 'Recently Used');
categoryDefaultTranslation.set('searchResults', 'Search Results');
categoryDefaultTranslation.set('custom', 'Custom');

const categoryTranslations = ['recent', 'searchResults', ...categoryNames].map((c) => `['${c}', t('emoji_picker.${c}')]`);

// generate emoji.jsx out of the emoji.json parsing we did
const emojiJSX = `// This file is automatically generated via \`make emojis\`. Do not modify it manually.

/* eslint-disable */

import {t} from 'utils/i18n';

import emojis from 'utils/emoji.json';

import spriteSheet from '${sheetFile}';

export const Emojis = emojis;

export const EmojiIndicesByAlias = new Map(${JSON.stringify(emojiIndicesByAlias)});

export const EmojiIndicesByUnicode = new Map(${JSON.stringify(emojiIndicesByUnicode)});

export const CategoryNames = ${JSON.stringify(categoryNames)};

export const CategoryMessage = new Map([${JSON.stringify(Array.from(categoryDefaultTranslation))}]);

export const CategoryTranslations = new Map([${categoryTranslations}]);

export const ComponentCategory = 'Component';

export const EmojiIndicesByCategory = new Map(${JSON.stringify(Array.from(emojiIndicesByCategory))});`;

// write emoji.jsx
endResults.push(writeFile('emoji.jsx', 'utils/emoji.jsx', emojiJSX));

// golang emoji data

const emojiGo = `// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

// This file is automatically generated via \`make emojis\`. Do not modify it manually.

package model

var SystemEmojis = map[string]string{${emojiImagesByAlias.join(', ')}}
`;

const goPromise = writeFile('emoji_data.go', 'emoji_data.go', emojiGo);
endResults.push(goPromise);

// If SERVER_DIR is defined we can update the file emoji_data.go in
// the server directory
if (process.env.SERVER_DIR) {
    const destination = path.join(process.env.SERVER_DIR, 'model/emoji_data.go');
    goPromise.then(() => {
        // this is an obvious race condition, as goPromise might be the last one, and then executed out of the `all` call below,
        // but it shouldn't be any problem other than a log out of place and a need to do an explicit catch.
        const mvPromise = Fs.rename('emoji_data.go', destination);
        endResults.push(mvPromise);
        mvPromise.catch((err) => {
            console.error(`ERROR: There was an error trying to move the emoji_data.go file: ${err}`);
        });
    });
} else {
    console.warn('WARNING: $SERVER_DIR environment variable is not set, `emoji_data.go` will be located in the root of the project, remember to move it to the server');
}

// sprite css file

const cssCats = categoryNames.filter((cat) => cat !== 'custom').map((cat) => `.emoji-category-${cat} { background-image: url('${sheetFile}'); }`);
const cssEmojis = [];
for (const key of emojiFilePositions.keys()) {
    cssEmojis.push(`.emoji-${key} { background-position: ${emojiFilePositions.get(key)} }`);
}

const cssRules = `
@charset "UTF-8";
.emojisprite-preview {
    // Using zoom for now as it results in less blurry emojis on Chrome - MM-34178
    zoom: 0.55;
    -moz-transform: scale(0.55);
    background-repeat: no-repeat;
    cursor: pointer;
    height: ${EMOJI_SIZE_PADDED}px;
    max-width: none;
    width: ${EMOJI_SIZE_PADDED}px;
    padding: 0 10px 0 0;
    transform-origin: 0 0;
}
.emojisprite {
    zoom: 0.35;
    -moz-transform: scale(0.35);
    background-repeat: no-repeat;
    border-radius: 18px;
    cursor: pointer;
    height: ${EMOJI_SIZE_PADDED}px;
    max-width: none;
    width: ${EMOJI_SIZE_PADDED}px;
}
.emojisprite-loading {
    background-image: none !important;
    zoom: 0.35;
    -moz-transform: scale(0.35);
    background-repeat: no-repeat;
    border-radius: 18px;
    cursor: pointer;
    height: ${EMOJI_SIZE_PADDED}px;
    max-width: none;
    width: ${EMOJI_SIZE_PADDED}px;
}

${cssCats.join('\n')};
${cssEmojis.join('\n')};
`;

// write emoji.jsx
endResults.push(writeFile('_emojisprite.scss', 'sass/components/_emojisprite.scss', cssRules));

Promise.all(endResults).then(() => {
    console.log('\n\nRemember to run `make i18n-extract` as categories might have changed.');
}).catch((err) => {
    control.abort(); // cancel any other file writing
    console.error(`ERROR: There was an error writing emojis: ${err}`);
    // eslint-disable-next-line no-process-exit
    process.exit(-1);
});

/* eslint-enable no-console */
/* eslint-enable no-process-env */
