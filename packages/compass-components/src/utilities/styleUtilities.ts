export const rgbWithCSSVar = (cssVar: string, opacity?: number): string | undefined => {
    if (typeof opacity === 'number' && (opacity < 0 || opacity > 1)) {
        return;
    } else if (typeof opacity === 'number') {
        return `rgba(var(${cssVar}), ${opacity})`;
    }
    return `rgb(var(${cssVar}))`;
}

export function numberIsInRange(num: number, lowerValueInclusive: number = 0, upperValueInclusive: number = 255): boolean {
    if (!num || num < lowerValueInclusive || num > upperValueInclusive) {
        return false;
    }
    return true;
}

export function calculateRelativeSize(targetSize: number, baseSize:number = 10, unit: string = ''): string | undefined {
    if (!targetSize || targetSize < 0 || targetSize < 0) {
        return;
    }
    return `${targetSize/baseSize}${unit}`;
}
