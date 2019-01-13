// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import React from 'react';

import loadingGif from 'images/load.gif';

type Props = {|
    text: string
|};

export default class LoadingBars extends React.PureComponent<Props> {
    static defaultProps = {
        text: null,
    }

    render() {
        const {text} = this.props;

        return (
            <span className={'LoadingBars' + (text ? ' with-text' : '')}>
                <img
                    className='spinner'
                    src={loadingGif}
                />
                {text}
            </span>
        );
    }
}
