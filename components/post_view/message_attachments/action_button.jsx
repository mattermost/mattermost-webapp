// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Markdown from 'components/markdown';

export default class ActionButton extends React.PureComponent {
    static propTypes = {
        action: PropTypes.object.isRequired,
        handleAction: PropTypes.func.isRequired,
    }

    render() {
        const {action, handleAction} = this.props;
        return (
            <button
                data-action-id={action.id}
                data-action-cookie={action.cookie}
                key={action.id}
                onClick={handleAction}
            >
                <Markdown
                    message={action.name}
                    options={{
                        mentionHighlight: false,
                        markdown: false,
                        autolinkedUrlSchemes: [],
                    }}
                />
            </button>
        );
    }
}
