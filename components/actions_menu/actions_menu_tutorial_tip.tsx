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
                <div className='TutorialTipHeader'>
                    <FormattedMessage
                        id='post_info.actions.tutorialTip.title'
                        defaultMessage='Actions for messages'
                    />
                </div>
                <div className='TutorialTipText'>
                    <FormattedMarkdownMessage
                        id='post_info.actions.tutorialTip'
                        defaultMessage='Message actions that are provided\nthrough apps, integrations or plugins\nhave moved to this menu item.'
                    />
                </div>
                <div className='TutorialButton'>
                    <button
                        id='marketPlaceButton'
                        className='btn btn-primary'
                        onClick={this.props.onClick}
                    >
                        <span className='TutorialButtonText'>
                            <FormattedMarkdownMessage
                                id='post_info.actions.tutorialTip.buttontext'
                                defaultMessage='Got it!'
                            />
                        </span>
                    </button>
                </div>
            </>
        );
    }
}
