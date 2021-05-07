import { TIconColors, TIconGlyph, TIconSize } from './Icon.types';

export type PIcon = {
    /**
     * the icon-glyph that is being rendered
     * @default 'mattermost'
     * */
    glyph?: TIconGlyph;
    /**
     * the size the icon is rendered with
     * @default 20
     * */
    size?: TIconSize;
    /**
     * the color token the Icon should be rendered with.
     * when not passed a value it will inherit the color.
     * @default null
     * */
    color?: TIconColors;
    /** add an aria-label for a11y */
    ariaLabel?: string;
    className?: string;
};
