// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, CSSProperties} from 'react';
import {FormattedMessage} from 'react-intl';

type Props = {
    position: 'absolute' | 'fixed' | 'relative' | 'static' | 'inherit';
    style?: CSSProperties;
    message?: ReactNode;
}

export default class LoadingScreen extends React.PureComponent<Props> {
    public static defaultProps: Partial<Props> = {
        position: 'relative',
        style: {},
    }

    public constructor(props: Props) {
        super(props);
        this.state = {};
    }

    public render(): JSX.Element {
        let message: ReactNode = (
            <FormattedMessage
                id='loading_screen.loading'
                defaultMessage='Loading'
            />
        );

        if (this.props.message) {
            message = this.props.message;
        }

        return (
            <div
                className='loading-screen'
                style={{position: this.props.position, ...this.props.style}}
            >
                <div className='loading__content'>
                    <h3>
                        {message}
                    </h3>
                    <div className='round round-1'/>
                    <div className='round round-2'/>
                    <div className='round round-3'/>
                </div>
            </div>
        );
    }
}
