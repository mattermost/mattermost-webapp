// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import * as Markdown from 'utils/markdown';
import {getSiteURL} from 'utils/url';
import EmojiMap from 'utils/emoji_map';

type Props = {
    id?: string;
    value: string;
    emojiMap: EmojiMap;
};

const DialogIntroductionText: React.FC<Props> = (props: Props) => {
    const formattedMessage = Markdown.format(
        props.value,
        {
            breaks: true,
            sanitize: true,
            gfm: true,
            siteURL: getSiteURL(),
        },
        props.emojiMap,
    );

    return (
        <span
            id={props.id}
            dangerouslySetInnerHTML={{__html: formattedMessage}}
        />
    );
};

export default DialogIntroductionText;
