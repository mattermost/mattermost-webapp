import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import svgImageFlatten from 'fontello-batch-cli/svgflatten';
import SVGPath from 'svgpath';

export const FILE_COMPONENTS_REGEX = /^(_)?(.+)[|_](.+)\.svg$/;

const parseSVGIconFileName = (fileName, filePath) => {
    if (typeof fileName != 'string' || path.extname(fileName) !== '.svg') {
        return null;
    }
    const fileComponents = fileName.match(FILE_COMPONENTS_REGEX);
    if (!fileComponents || !fileComponents.length || fileComponents.length < 3) {
        return null;
    }
    return {
        fileName,
        enabled: !!fileComponents[1] ? false : true,
        name: fileComponents[2],
        code: fileComponents[3],
        filePath: path.join(filePath, fileName),
    };
};

export const getFileData = (filePath = './svgs', parse = parseSVGIconFileName) => {
    const files = fs.readdirSync(filePath, 'utf-8');
    if (!files) {
        throw new Error(`No files found in ${filePath}`);
    }
    return files
        .map((fileName) => {
            return parse(fileName, filePath);
        })
        .filter((file) => !!file);
};

const loadFileContents = (filePath) => fs.readFileSync(filePath, 'utf-8');

const generateUIDFromString = (string) => crypto.createHash('md5').update(string).digest('hex');

const convertHexStringToDec = (string) => parseInt(string, 16);

export const generateGlyphs = (fileData) => {
    return fileData.map((file) => {
        if (!file) {
            return;
        }
        const data = loadFileContents(file.filePath);
        const flattenedData = svgImageFlatten(data);
        const path = new SVGPath(flattenedData.d)
            .translate(-flattenedData.x, -flattenedData.y)
            .scale(1000 / flattenedData.height)
            .abs()
            .round(1)
            .toString();
        return {
            uid: generateUIDFromString(file.fileName),
            css: file.name,
            code: convertHexStringToDec(file.code),
            src: 'custom_icons',
            selected: file.enabled,
            svg: {
                path,
                width: 1000,
            },
            search: [file.name],
        };
    });
};

export const writeFileToDisk = (fileName = 'config.json', fileData = {}) => {
    try {
        fs.unlinkSync(fileName);
    } catch (error) {
        // ignore
    }
    fs.writeFileSync(fileName, JSON.stringify(fileData, null, 4), {
        encoding: 'utf-8',
        flag: 'w',
    });
};
