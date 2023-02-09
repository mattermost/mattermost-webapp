// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {RouteComponentProps} from 'react-router-dom';

import './channel_integrations_tab.scss';

import classNames from 'classnames';

import {ItemProp} from '@mattermost/types/channel_integrations_tab';

import IntegrationsTabHeader from './integrations_tab_header/integrations_tab_header';
import StatsRow from './stats_row/stats_row';

import type {PropsFromRedux} from './index';

export type Props = PropsFromRedux & RouteComponentProps<{
    postid?: string;
}>;

type State = {
    channelId: string;
    url: string;
};

class ChannelIntegrationsTab extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            url: props.match.url,
            channelId: props.channelId,
        };
    }

    getRowItems() {
        const items = [];
        for (let i = 0; i < 5; i++) {
            const total = Math.floor((Math.random() * 100) + 1);
            const label = `Some explanation about the number will show up here - ${total}`;
            const item: ItemProp = {total, label};
            items.push(item);
        }
        return items;
    }

    render() {
        return (
            <div
                id='app-content'
                className={classNames('ChannelIntegrationsTab app__content')}
            >
                <IntegrationsTabHeader/>
                <div className='integrations-body'>
                    <StatsRow items={this.getRowItems()}/>
                </div>
            </div>
        );
    }
}

export default ChannelIntegrationsTab;
