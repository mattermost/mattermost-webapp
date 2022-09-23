// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ActionFunc} from 'mattermost-redux/types/actions';

import LoadingScreen from 'components/loading_screen';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import {Topic} from '@mattermost/types/admin';

type Props = {
    topics: Topic[];
    actions: {
        getTopics: () => ActionFunc;
    };
};

type State = {
    loadingTopics: boolean;
};

export default class Topics extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loadingTopics: true,
        };
    }

    componentDidMount() {
        this.reload();
    }

    reload = async () => {
        this.setState({loadingTopics: true});
        await this.props.actions.getTopics();
        this.setState({loadingTopics: false});
    }

    render() {
        let content = null;

        if (this.state.loadingTopics || !this.props.topics || this.props.topics.length === 0) {
            content = <LoadingScreen/>;
        } else {
            content = (
                <p>{'This would contain some events'}</p>
            );
        }

        return (
            <div className='wrapper--admin'>
                <FormattedAdminHeader
                    id='admin.events.title'
                    defaultMessage='Events'
                />

                <div className='admin-console__wrapper'>
                    <div className='admin-logs-content admin-console__content'>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}
