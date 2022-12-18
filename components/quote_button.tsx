// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormatQuoteOpenIcon} from '@mattermost/compass-icons/components';

import Tooltip from 'components/tooltip';

type Props = {
    quoteButtonPosition: string;
    handlePostQuote: () => void;
    showQuoteButton: boolean;
    mousePositionY?: string;
    mousePositionX?: string;
};

export const QuoteButton = (props: Props) => {
    if (!props.showQuoteButton) {
        return null;
    }

    return (
        <Tooltip
            id='quoteButton'
            onClick={props.handlePostQuote}
            placement={props.quoteButtonPosition}
            style={{top: props.mousePositionY, left: props.mousePositionX}}
        >
            {<FormatQuoteOpenIcon size={18}/>}
        </Tooltip>
    );
};
