// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import IconButton from '@mattermost/compass-components/components/icon-button';

import {trackEvent} from 'actions/telemetry_actions';
import * as Utils from 'utils/utils';
import {browserHistory} from 'utils/browser_history';

const HistoryButtonsContainer = styled.nav`
    display: flex;
    align-items: center;

    > :first-child {
           margin-right: 1px;
    }
`;

const HistoryButtons = (): JSX.Element => {
    const goBack = () => {
        trackEvent('ui', 'ui_history_back');
        browserHistory.goBack();
    };

    const goForward = () => {
        trackEvent('ui', 'ui_history_forward');
        browserHistory.goForward();
    };

    return (
        <HistoryButtonsContainer>
            <IconButton
                icon={'arrow-left'}
                onClick={goBack}
                size={'sm'}
                compact={true}
                inverted={true}
                aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.goBackLabel', 'Back')}
            />
            <IconButton
                icon={'arrow-right'}
                onClick={goForward}
                size={'sm'}
                compact={true}
                inverted={true}
                aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.goForwardLabel', 'Forward')}
            />
        </HistoryButtonsContainer>
    );
};

export default HistoryButtons;
