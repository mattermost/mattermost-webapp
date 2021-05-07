import IconGlyphs from '@hmhealey/compass-icons/build/IconGlyphs';

import { TTHemeColors } from '../../foundations/theme-provider/themes/theme.types';

type TIconGlyph = 'none' | typeof IconGlyphs[number];

type TIconSize = 10 | 12 | 16 | 20 | 28 | 32 | 40 | 52 | 64 | 104;

type TIconColors = keyof TTHemeColors;

export type { TIconGlyph, TIconSize, TIconColors };
