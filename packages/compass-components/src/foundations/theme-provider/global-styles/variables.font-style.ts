import { css } from 'styled-components';

type SizeMap = {
    [sizeToken: string]: number;
};

const baseSize = 8;
const baseLineHeight = baseSize * 2.5;

const bodyFontSizes: SizeMap = {
    25: baseSize * 1.25,
    50: baseSize * 1.375,
    75: baseSize * 1.5,
    100: baseSize * 1.75,
    200: baseSize * 2,
    300: baseSize * 2.25,
};

const headingFontSizes: SizeMap = {
    ...bodyFontSizes,
    400: baseSize * 2.5,
    500: baseSize * 2.75,
    600: baseSize * 3.125,
    700: baseSize * 3.5,
    800: baseSize * 4,
    900: baseSize * 4.5,
    1000: baseSize * 5,
};

const getMargin = (fontSize: number, multiplier: number): number =>
    Math.max(Math.round((fontSize * multiplier) / 4) * 4, 8);

const VFontStyle = css`
    --body-font-family: “Open Sans”, sans-serif;
    --heading-font-family: Metropolis, sans-serif;

    --base-font-size: ${baseSize * 1.75}px;
    --base-line-height: ${baseSize * 2.5}px;

    // generate body font-size variables
    ${Object.keys(bodyFontSizes).map((key) => `--body-font-size-${key}: ${bodyFontSizes[key]}px;`)}

    // generate body margin-top variables
    ${Object.keys(bodyFontSizes).map(
        (key) => `--body-margin-top-${key}: ${getMargin(bodyFontSizes[key], 0.75)}px;`
    )}

    // generate body margin-bottom variables
    ${Object.keys(bodyFontSizes).map(
        (key) => `--body-margin-bottom-${key}: ${getMargin(bodyFontSizes[key], 0.75)}px;`
    )}

    --body-line-height-25: ${baseLineHeight * 0.8}px;
    --body-line-height-50: ${baseLineHeight * 0.8}px;
    --body-line-height-75: ${baseLineHeight * 0.8}px;
    --body-line-height-100: ${baseLineHeight}px;
    --body-line-height-200: ${baseLineHeight * 1.2}px;
    --body-line-height-300: ${baseLineHeight * 1.4}px;

    // generate heading font-size variables
    ${Object.keys(headingFontSizes).map(
        (key) => `--heading-font-size-${key}: ${headingFontSizes[key]}px;`
    )}

    // generate heading margin-top variables
    ${Object.keys(headingFontSizes).map(
        (key) => `--heading-margin-top-${key}: ${getMargin(headingFontSizes[key], 8 / 9)}px;`
    )}

    // generate heading margin-bottom variables
    ${Object.keys(headingFontSizes).map(
        (key) => `--heading-margin-bottom-${key}: ${getMargin(headingFontSizes[key], 0.5)}px;`
    )}

    --heading-line-height-25: ${baseLineHeight * 0.8}px;
    --heading-line-height-50: ${baseLineHeight * 0.8}px;
    --heading-line-height-75: ${baseLineHeight * 0.8}px;
    --heading-line-height-100: ${baseLineHeight}px;
    --heading-line-height-200: ${baseLineHeight * 1.2}px;
    --heading-line-height-300: ${baseLineHeight * 1.2}px;
    --heading-line-height-400: ${baseLineHeight * 1.4}px;
    --heading-line-height-500: ${baseLineHeight * 1.4}px;
    --heading-line-height-600: ${baseLineHeight * 1.5}px;
    --heading-line-height-700: ${baseLineHeight * 1.8}px;
    --heading-line-height-800: ${baseLineHeight * 2}px;
    --heading-line-height-900: ${baseLineHeight * 2.2}px;
    --heading-line-height-1000: ${baseLineHeight * 2.4}px;

    --font-weight-light: 300;
    --font-weight-regular: 400;
    --font-weight-bold: 700;
`;

export default VFontStyle;
