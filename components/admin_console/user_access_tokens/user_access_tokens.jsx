// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl';

import UserAccessTokensContainer from './user_access_tokens_container';

export default class UserAccessTokens extends React.PureComponent {
    static propTypes = {};

    render() {
        return (
            <div className='wrapper--fixed'>
                <h3 className='admin-console-header'>
                    <FormattedMessage
                        id='admin.user_access_tokens.title'
                        defaultMessage='Personal Access Tokens'
                    />
                </h3>
                <div className='banner'>
                    <div className='banner__content'>
                        <FormattedHTMLMessage
                            id='analytics.user_access_tokens.info'
                            defaultMessage='Personal access tokens function similarly to session tokens and can be used by integrations to <a href="https://about.mattermost.com/default-api-authentication" target="_blank">interact with this Mattermost server</a>. Learn more about <a href="https://about.mattermost.com/default-user-access-tokens" target="_blank">personal access tokens</a>.'
                        />
                    </div>
                </div>
                <div className='more-modal__list member-list-holder'>
                    <UserAccessTokensContainer
                        itemsPerPage={30}
                    />
                </div>
            </div>
        );
    }
}
