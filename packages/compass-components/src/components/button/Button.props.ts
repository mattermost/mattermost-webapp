import { TIconGlyph } from '../icon';

import { TButtonIconPosition, TButtonSize, TButtonVariant, TButtonWidth } from './Button.types';

export type PButton = {
    label: string;
    disabled?: boolean;
    destructive?: boolean;
    variant?: TButtonVariant;
    width?: TButtonWidth;
    size?: TButtonSize;
    icon?: TIconGlyph;
    iconPosition?: TButtonIconPosition;
    className?: string;
    onClick: () => void;
};
