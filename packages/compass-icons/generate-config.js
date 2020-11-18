import { getFileData, generateGlyphs, writeFileToDisk } from './utils';

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

writeFileToDisk('config.json', configData);

// trigger
