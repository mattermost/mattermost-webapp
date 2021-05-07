import { createGlobalStyle } from 'styled-components';
// eslint-disable-next-line import/no-unassigned-import
import '@hmhealey/compass-icons';

import { TTheme } from '../themes/theme.types';

import VElevation from './variables.elevation';
import VFontFaces from './variables.font-faces';
import VFontStyle from './variables.font-style';
import reset from './reset-styles';
import defaultStyles from './default-styles';

type PGlobalStyles = {
    theme: TTheme;
};

const GlobalStyle = createGlobalStyle`
    ${reset};

    :root {
        ${VFontFaces}
        ${VFontStyle}
        ${VElevation}
    }
    
    ${defaultStyles};
`;

export type { PGlobalStyles };
export default GlobalStyle;
