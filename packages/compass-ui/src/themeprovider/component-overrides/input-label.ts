// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Theme} from '@mui/material';
import type {ComponentsOverrides} from '@mui/material/styles/overrides';

const componentName = 'MuiInputLabel';

declare module '@mui/material/InputLabel' {
    interface InputLabelProps {
        $withStartIcon?: boolean;
        $inputSize: 'small' | 'large' | 'medium';
    }
}

const inputLabelStyleOverrides: ComponentsOverrides<Theme>[typeof componentName] = {
    root: ({ownerState}) => {
        if (ownerState.shrink) {
            return {};
        }

        let iconSize;
        let shiftX;
        let shiftY;

        switch (ownerState.$inputSize) {
        case 'small':
            iconSize = 12;
            shiftY = '0.8rem';
            shiftX = 12 + (ownerState.$withStartIcon ? (iconSize + 8) : 0);
            break;
        case 'large':
            iconSize = 20;
            shiftY = '1.2rem';
            shiftX = 16 + (ownerState.$withStartIcon ? (iconSize + 8) : 0);
            break;
        case 'medium':
        default:
            iconSize = 16;
            shiftY = '1rem';
            shiftX = 14 + (ownerState.$withStartIcon ? (iconSize + 8) : 0);
        }

        return {
            fontSize: 'inherit',
            lineHeight: 'inherit',
            transform: `translate(${shiftX}px, ${shiftY})`,
        };
    },
    shrink: ({ownerState}) => {
        if (!ownerState.shrink) {
            return {};
        }

        let shiftX;
        let shiftY;
        let fontSize;

        switch (ownerState.$inputSize) {
        case 'small':
            shiftY = -6;
            shiftX = 12;
            fontSize = 10;
            break;
        case 'large':
            shiftY = -6;
            shiftX = 16;
            fontSize = 12;
            break;
        case 'medium':
        default:
            shiftY = -6;
            shiftX = 14;
            fontSize = 10;
        }

        return {
            fontSize: `${fontSize}px`,
            transform: `translate(${shiftX}px, ${shiftY}px)  scale(0.8)`,
        };
    },
};

const overrides = {
    styleOverrides: inputLabelStyleOverrides,
};

export default overrides;
