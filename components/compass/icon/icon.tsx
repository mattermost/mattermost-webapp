// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './icon.scss';

export default class Icon extends React.PureComponent {
    render() {
        return (
            <i className={`Icon Icon___standard ${iconGlyphs.EMOTICON_HAPPY_OUTLINE}`}/>);
    }
}

export const iconGlyphs = {
    EMOTICON_HAPPY_OUTLINE: 'icon-emoticon-happy-outline',
};
