import { getFileData, generateGlyphs, writeJSONToDisk, writeToDisk } from './utils';

// generate config data used to generate the font icon

const files = getFileData('./svgs');

const glyphs = generateGlyphs(files);

const configData = {
    name: 'compass-icons',
    css_prefix_text: 'icon-',
    css_use_suffix: false,
    hinting: false,
    units_per_em: 1000,
    ascent: 850,
    glyphs,
};

// write to root for fontelle-cli to retrieve
writeJSONToDisk('config.json', configData);

// write to build folder
writeJSONToDisk('./build/config.json', configData);

// generate icon glyph data

const iconGlyphs = configData.glyphs.map(({ css }) => `\t'${css}',`);

const iconGlyphsTypeData = `export declare type IconGlyphTypes = ${iconGlyphs
    .map((glyph) => glyph.trim().slice(0, -1))
    .join(' | ')};
declare const IconGlyphs: IconGlyphTypes[];
export default IconGlyphs;
`;

writeToDisk('./build/IconGlyphs.d.ts', iconGlyphsTypeData);

const iconGlyphsData = `const IconGlyphs = [
${iconGlyphs.join('\n')}
];
export default IconGlyphs;
`;

writeToDisk('./build/IconGlyphs.js', iconGlyphsData);
