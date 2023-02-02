// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import MuiFocusTrap, {FocusTrapProps as MuiFocusTrapProps} from '@mui/base/FocusTrap';

interface Props {
    active: MuiFocusTrapProps['open'];
    children: MuiFocusTrapProps['children'];
}

const FocusTrap = ({active, children}: Props) => {
    return (
        <MuiFocusTrap open={active}>
            {children}
        </MuiFocusTrap>
    );
};

export default FocusTrap;
