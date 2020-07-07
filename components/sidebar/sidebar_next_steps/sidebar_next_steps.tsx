// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import ProgressBar from 'components/progress_bar';

import './sidebar_next_steps.scss';

type Props = {

};

type State = {
    complete: number;
};

export default class SidebarNextSteps extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            complete: 0,
        };
    }

    render() {
        // TODO: Temporary values
        const total = 3;

        return (
            <div className='SidebarNextSteps'>
                <div className='SidebarNextSteps__top'>
                    <span>
                        <FormattedMessage
                            id='sidebar_next_steps.gettingStarted'
                            defaultMessage='Getting Started'
                        />
                    </span>
                    <div className='SidebarNextSteps__close'>
                        <i className='icon icon-close'/>
                    </div>
                </div>
                <div className='SidebarNextSteps__middle'>
                    <span>
                        <FormattedMarkdownMessage
                            id='sidebar_next_steps.stepsComplete'
                            defaultMessage='{complete} / {total} steps complete'
                            values={{
                                complete: this.state.complete,
                                total,
                            }}
                        />
                    </span>
                </div>
                <div className='SidebarNextSteps__progressBar'>
                    <button onClick={() => this.setState({complete: (this.state.complete + 1) % 4})}>{'Progress'}</button>
                    <ProgressBar
                        current={this.state.complete}
                        total={total}
                    />
                </div>
            </div>
        );
    }
}
