// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, CSSProperties} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

type Props = {
    position?: 'absolute' | 'fixed' | 'relative' | 'static' | 'inherit';
    style?: CSSProperties;
    message?: ReactNode;
    className?: string;
    inMiddle?: boolean;
}

function LoadingScreen({message, position = 'relative', style, className = '', inMiddle = false}: Props) {
    const {formatMessage} = useIntl();

    return (
        <div
            className={classNames('loading-screen', className, {
                'loading-screen--in-middle': inMiddle,
            })}
            style={{position, ...style}}
        >
            <div className='loading__content'>
                <p>
                    {message || formatMessage({id: 'loading_screen.loading', defaultMessage: 'Loading'})}
                </p>
                <div className='round round-1'/>
                <div className='round round-2'/>
                <div className='round round-3'/>
            </div>
        </div>
    );
}

export default LoadingScreen;
