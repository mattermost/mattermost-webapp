// shared types for `Heading` and `Text` component
import { TTHemeTextColors } from '../foundations/theme-provider/themes/theme.types';

type TFontWeight = 'light' | 'regular' | 'bold';

type TFontMargin = 'none' | 'top' | 'bottom' | 'both';

type TFontColor = 'inherit' | keyof TTHemeTextColors;

// Grid and Shape components
type TContainerElement =
    | 'div'
    | 'span'
    | 'article'
    | 'aside'
    | 'details'
    | 'figcaption'
    | 'figure'
    | 'footer'
    | 'header'
    | 'main'
    | 'mark'
    | 'nav'
    | 'section'
    | 'summary'
    | 'time';

type TInteractionElement = 'button' | 'input';

export type { TFontColor, TFontMargin, TFontWeight, TContainerElement, TInteractionElement };
