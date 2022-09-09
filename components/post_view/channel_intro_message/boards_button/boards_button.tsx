// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {PluginComponent} from 'types/store/plugins';

type Props = {
    show: boolean;
    boardComponent?: PluginComponent;
}

const BoardsButton = ({boardComponent, show}: Props) => {
    const {formatMessage} = useIntl();

    if (!boardComponent || !show) {
        return null;
    }

    return (
        <button
            className={'intro-links color--link channelIntroButton style--none'}
            onClick={() => boardComponent.action?.()}
            aria-label={formatMessage({id: 'intro_messages.createBoard', defaultMessage: 'Create a board'})}
        >
            {boardComponent.icon}
            {formatMessage({id: 'intro_messages.createBoard', defaultMessage: 'Create a board'})}
        </button>
    );
};

export default React.memo(BoardsButton);
