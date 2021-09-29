// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

type Props = {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default class ActionsTutorialTip extends React.PureComponent<Props> {
    render = (): JSX.Element => {
        return (
            <>
                <div className='tutorial-tip-container'>
                    <div className='tutorial-tip-header'>
                        <FormattedMessage
                            id='post_info.actions.tutorialTip.title'
                            defaultMessage='Actions for messages'
                        />
                    </div>
                    <div className='tutorial-tip-text'>
                        <FormattedMarkdownMessage
                            id='post_info.actions.tutorialTip'
                            defaultMessage='Message actions that are provided\nthrough apps, integrations or plugins\nhave moved to this menu item.'
                        />
                    </div>
                    <div className='tutorial-button-container'>
                        <button
                            id='marketPlaceButton'
                            className='btn btn-primary tutorial-button-button'
                            onClick={this.props.onClick}
                        >
                            <span className='tutorial-button-text'>
                                <FormattedMarkdownMessage
                                    id='post_info.actions.tutorialTip.buttontext'
                                    defaultMessage='Got it!'
                                />
                            </span>
                        </button>
                    </div>
                </div>
            </>
        );
    }
}
