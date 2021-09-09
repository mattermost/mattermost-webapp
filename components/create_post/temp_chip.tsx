// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';

// This component is a temporary placeholder for use until the authoritative `compass-components` Chip is implemented.

type Props = {
    onClick: () => void;
    id: string;
    defaultMessage: string;
    values: Record<string, any>;
}

const StyledChip = styled.div`
    background: var(--center-channel-bg);
    flex-shrink: 0;
    margin-left: 12px;
    margin-bottom: 12px;
    padding: 8px 12px;
    border: px solid rgba(61, 60, 64, 0.08);
    border-radius: 16px;
    box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.08);

    &:first-child {
        margin-left: 0;
    }

    @include box-shadow($elevation-1)
`

export default class Chip extends React.PureComponent<Props> {
    render() {
        return <StyledChip onClick={this.props.onClick}>
            <FormattedMessage
                id={this.props.id}
                defaultMessage={this.props.defaultMessage}
                values={this.props.values}
            />
        </StyledChip>
    }
}
