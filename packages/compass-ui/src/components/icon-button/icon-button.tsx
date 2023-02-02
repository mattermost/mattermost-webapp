// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Grid} from '@mui/material';
import classNames from 'classnames';
import React from 'react';
import MuiIconButton, {IconButtonProps as MuiIconButtonProps} from '@mui/material/IconButton';

type IncludedMuiProps = 'size' | 'disabled';

type CustomProps = {
    IconComponent: React.FC;
    compact?: boolean;
    toggled?: boolean;
    destructive?: boolean;
    label?: string;
}

type IconButtonProps = Pick<MuiIconButtonProps, IncludedMuiProps> & CustomProps;

const IconButton = ({IconComponent, label, destructive = false, compact = false, toggled = false, ...props}: IconButtonProps) => {
    return (
        <MuiIconButton
            {...props}
            className={classNames({compact, toggled})}
            color={destructive ? 'error' : 'primary'}
        >
            <Grid
                container={true}
                m={compact ? 0 : 0.25}
                alignItems='center'
                alignContent='center'
            >
                <Grid item={true}>
                    <IconComponent/>
                </Grid>
                {label && (
                    <Grid
                        item={true}
                        pt={0.25}
                    >
                        {label}
                    </Grid>
                )}
            </Grid>
        </MuiIconButton>
    );
};

export default IconButton;
