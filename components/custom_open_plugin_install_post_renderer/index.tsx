// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import {Link} from 'react-router-dom';

import {uniqWith} from 'lodash';

import MarketplaceModal from 'components/plugin_marketplace';

import Markdown from 'components/markdown';

import {getUsers} from 'mattermost-redux/selectors/entities/users';

import {ModalIdentifiers} from 'utils/constants';

import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';

import {localizeMessage} from 'utils/utils';

import styled from 'styled-components';

import {Post} from '@mattermost/types/posts';
import {MarketplacePlugin} from '@mattermost/types/marketplace';
import {GlobalState} from '../../types/store';
import {installPlugin} from '../../actions/marketplace';
import ToggleModalButton from '../toggle_modal_button';
import {getError, getInstalledListing, getInstalling} from '../../selectors/views/marketplace';
import LoadingWrapper from '../widgets/loading/loading_wrapper';

type PluginRequest = {
    user_id: string;
    required_feature: string;
    required_plan: string;
    create_at: string;
    sent_at: string;
    plugin_name: string;
    plugin_id: string;
}

type RequestedPlugins = Record<string, PluginRequest[]>

type CustomPostProps = {
    requested_plugins_by_plugin_ids: RequestedPlugins;
    requested_plugins_by_user_ids: RequestedPlugins;
}

const buttonsStyle = {
    display: 'flex',
    gap: '10px',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid rgba(var(--center-channel-color-rgb), 0.16)',
    width: 'max-content',
    margin: '10px 0',
};

const usersListStyle = {
    margin: '20px 0',
};

export default function OpenPluginInstallPost(props: {post: Post}) {
    const customMessageBody = [];

    const dispatch = useDispatch();
    const {formatMessage, formatList} = useIntl();
    const [pluginsByPluginIds, setPluginsByPluginIds] = useState<RequestedPlugins>({});

    const postProps = props.post.props as CustomPostProps;
    const requestedPluginsByPluginIds = postProps?.requested_plugins_by_plugin_ids;
    const requestedPluginsByUserIds = postProps?.requested_plugins_by_user_ids;

    const userProfiles = useSelector(getUsers);
    const marketplacePlugins: MarketplacePlugin[] = useSelector((state: GlobalState) => state.views.marketplace.plugins);

    const getUserIdsForUsersThatRequestedFeature = (requests: PluginRequest[]): string[] => requests.map((request: PluginRequest) => request.user_id);

    useEffect(() => {
        if (requestedPluginsByPluginIds && marketplacePlugins.length && !Object.keys(pluginsByPluginIds).length) {
            let plugins = {} as RequestedPlugins;
            for (const pluginId of Object.keys(requestedPluginsByPluginIds)) {
                const plugin = marketplacePlugins.find((marketplacePlugin) => marketplacePlugin.manifest.id === pluginId);
                plugins = {
                    ...plugins,
                    [pluginId]: requestedPluginsByPluginIds[pluginId].reduce((acc: PluginRequest[], currPlugin: PluginRequest) => {
                        const curr = {
                            ...currPlugin,
                            plugin_name: plugin?.manifest.name || pluginId,
                            plugin_id: pluginId,
                        };
                        acc.push(curr);
                        return acc;
                    }, []),
                };
                dispatch(getMissingProfilesByIds(getUserIdsForUsersThatRequestedFeature(requestedPluginsByPluginIds[pluginId])));
            }
            setPluginsByPluginIds(plugins);
        }
    }, [dispatch, marketplacePlugins, requestedPluginsByPluginIds, pluginsByPluginIds]);

    const getUserNamesForUsersThatRequestedFeature = (requests: PluginRequest[]): string[] => {
        const userNames = requests.map((req: PluginRequest) => {
            return getUserNameForUser(req.user_id);
        });

        return userNames;
    };

    const getUserNameForUser = (userId: string) => {
        const unknownName = formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.unknown', defaultMessage: '@unknown'});

        const username = userProfiles[userId]?.username;
        return username ? '@' + username : unknownName;
    };

    const markDownOptions = {
        atSumOfMembersMentions: true,
        atPlanMentions: true,
        markdown: false,
    };

    if (Object.keys(pluginsByPluginIds).length && requestedPluginsByUserIds) {
        let post;
        let pluginNames: string[] = [];
        const messageBuilder: string[] = [];
        const userIds = Object.keys(requestedPluginsByUserIds);
        if (userIds.length === 1) {
            messageBuilder.push(getUserNameForUser(userIds[0]));

            for (const pluginId of Object.keys(pluginsByPluginIds)) {
                pluginNames = [
                    ...pluginNames,
                    pluginsByPluginIds[pluginId][0].plugin_name,
                ];
            }

            messageBuilder.push(' ' + formatMessage({id: 'postypes.custom_open_plugin_install_post_rendered.plugin_requests', defaultMessage: 'requested installing the {pluginRequests}'}, {pluginRequests: [...pluginNames].join(', ').replace(/,([^,]*)$/, ' and $1')}));
            messageBuilder.push(formatMessage({
                id: 'postypes.custom_open_plugin_install_post_rendered.plugin_requests_count',
                defaultMessage: '{pluginCount, plural, =1 { app. } other { apps. }}',
            }, {pluginCount: pluginNames.length}));

            const instructions = (
                <FormattedMessage
                    id='postypes.custom_open_plugin_install_post_rendered.plugin_instructions'
                    defaultMessage='Click below to install it or visit <marketplaceLink>Marketplace</marketplaceLink> to view all plugins.'
                    values={{
                        marketplaceLink: (text: string) => (
                            <ToggleModalButton
                                id='marketplaceModal'
                                className='color--link'
                                modalId={ModalIdentifiers.PLUGIN_MARKETPLACE}
                                dialogType={MarketplaceModal}
                            >
                                {text}
                            </ToggleModalButton>

                        ),
                    }}
                />);

            const message = formatList(messageBuilder, {style: 'narrow', type: 'unit'});
            post = (
                <>
                    <Markdown
                        postId={props.post.id}
                        message={message}
                        options={markDownOptions}
                        userIds={getUserIdsForUsersThatRequestedFeature(requestedPluginsByUserIds[userIds[0]])}
                    />
                    {instructions}
                </>);
            customMessageBody.push(post);
        } else if (userIds.length > 1) {
            messageBuilder.push(formatMessage({id: 'postypes.custom_open_plugin_install_post_rendered.app_installation_request_text', defaultMessage: 'You’ve received the following app installation requests:'}));
            const pluginIds = Object.keys(pluginsByPluginIds);

            post = (
                <ul style={usersListStyle}>
                    {pluginIds.map((pluginId) => {
                        const plugins = pluginsByPluginIds[pluginId];
                        const uniqueUserRequestsForPlugins = uniqWith(plugins, (one, two) => one.user_id === two.user_id);
                        const numberOfUserRequest = uniqueUserRequestsForPlugins.length;
                        const installRequests = [];
                        let userName: string[] = [];
                        if (numberOfUserRequest === 1) {
                            const userId = uniqueUserRequestsForPlugins[0].user_id;
                            userName.push(getUserNameForUser(userId));
                            installRequests.push(userName[0]);
                        } else if (numberOfUserRequest === 2) {
                            userName = userName.concat(getUserNamesForUsersThatRequestedFeature(uniqueUserRequestsForPlugins));
                            const andMessage = formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.and', defaultMessage: 'and'});
                            installRequests.push(userName.join(` ${andMessage} `));
                        } else {
                            installRequests.push(formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.members', defaultMessage: '{members} members'}, {members: numberOfUserRequest}));
                        }
                        installRequests.push(' ' + formatMessage({id: 'postypes.custom_open_plugin_install_post_rendered.plugin_requests', defaultMessage: 'requested installing the {pluginRequests} app.'}, {pluginRequests: uniqueUserRequestsForPlugins[0].plugin_name}));
                        return (
                            <li key={props.post.id}>
                                <Markdown
                                    postId={props.post.id}
                                    message={installRequests.join('')}
                                    options={markDownOptions}
                                    userIds={getUserIdsForUsersThatRequestedFeature(requestedPluginsByUserIds[userIds[0]])}
                                />
                            </li>
                        );
                    })}
                </ul>
            );

            const instructions = (
                <FormattedMessage
                    id='postypes.custom_open_plugin_install_post_rendered.plugins_instructions'
                    defaultMessage='Install the apps below or visit <marketplaceLink>Marketplace</marketplaceLink> to view all plugins.'
                    values={{
                        marketplaceLink: (text: string) => (
                            <ToggleModalButton
                                id='marketplaceModal'
                                className='color--link'
                                modalId={ModalIdentifiers.PLUGIN_MARKETPLACE}
                                dialogType={MarketplaceModal}
                            >
                                {text}
                            </ToggleModalButton>

                        ),
                    }}
                />);

            customMessageBody.push(messageBuilder);
            customMessageBody.push(post);
            customMessageBody.push(instructions);
        }
    }

    const RenderPluginButton = (props: {installedListing: MarketplacePlugin[]; pluginDetail: {pluginName: string; pluginId: string}}) => {
        const installing = useSelector((state: GlobalState) => getInstalling(state, props.pluginDetail.pluginId));
        const error = useSelector((state: GlobalState) => getError(state, props.pluginDetail.pluginId));

        const isInstalled = props.installedListing.some((plugin) => plugin.manifest.id === props.pluginDetail.pluginId);
        const name = props.pluginDetail?.pluginName;

        const actionButton = () => {
            if (!error && !isInstalled) {
                return (
                    <button
                        onClick={() => {
                            dispatch(installPlugin(props.pluginDetail.pluginId));
                        }}
                        className='btn btn-primary'
                        disabled={installing}
                    >
                        <LoadingWrapper
                            loading={installing}
                            text={localizeMessage('marketplace_modal.installing', 'Installing...')}
                        >
                            <FormattedMessage
                                id='marketplace_modal.list.install.plugin'
                                defaultMessage={`Install ${name}`}
                                values={{
                                    plugin: name,
                                }}
                            />
                        </LoadingWrapper>
                    </button>
                );
            } else if (!error && isInstalled && !installing) {
                return (
                    <Link
                        to={'/admin_console/plugins/plugin_' + props.pluginDetail.pluginId}
                    >
                        <button
                            onClick={() => null /*this.onConfigure*/}
                            className='btn btn-outline'
                        >
                            <FormattedMessage
                                id='marketplace_modal.list.configure.plugin'
                                defaultMessage={`Configure ${name}`}
                                values={{
                                    plugin: name,
                                }}
                            />
                        </button>
                    </Link>
                );
            }
            return <></>;
        };
        return (
            <>
                {actionButton()}
            </>
        );
    };

    const RenderPluginButtons = (props: {pluginsByPluginIds: RequestedPlugins}) => {
        const installedListing = useSelector(getInstalledListing) as MarketplacePlugin[];
        let pluginDetails: Array<{pluginName: string; pluginId: string}> = [];

        for (const pluginId of Object.keys(props.pluginsByPluginIds)) {
            const pluginName = pluginsByPluginIds[pluginId][0].plugin_name;
            pluginDetails = [
                ...pluginDetails,
                {pluginName, pluginId},
            ];
        }

        return (
            <div
                style={buttonsStyle}
            >
                {[...pluginDetails].map((pluginDetail) => {
                    return (
                        <div key={pluginDetail.pluginName}>
                            <RenderPluginButton
                                installedListing={installedListing}
                                pluginDetail={pluginDetail}
                            />
                        </div>
                    );
                })}
            </div>

        );
    };

    return (
        <div>
            {customMessageBody}
            {Object.keys(pluginsByPluginIds).length ? <RenderPluginButtons pluginsByPluginIds={pluginsByPluginIds}/> : <></>}
        </div>
    );
}
