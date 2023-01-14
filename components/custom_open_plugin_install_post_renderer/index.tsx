// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';
import {Link} from 'react-router-dom';
import {uniqWith} from 'lodash';

import {Post} from '@mattermost/types/posts';
import {MarketplacePlugin} from '@mattermost/types/marketplace';

import MarketplaceModal from 'components/plugin_marketplace';
import Markdown from 'components/markdown';

import {getUsers} from 'mattermost-redux/selectors/entities/users';
import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';

import {ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import {GlobalState} from 'types/store';
import {fetchListing, installPlugin} from 'actions/marketplace';
import ToggleModalButton from 'components/toggle_modal_button';
import {getError, getInstalledListing, getInstalling, getPlugins} from 'selectors/views/marketplace';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

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

const RenderPluginButton = (props: {installedListing: MarketplacePlugin[]; pluginRequest: PluginRequest}) => {
    const dispatch = useDispatch();

    const installing = useSelector((state: GlobalState) => getInstalling(state, props.pluginRequest.plugin_id));
    const error = useSelector((state: GlobalState) => getError(state, props.pluginRequest.plugin_id));

    const isInstalled = props.installedListing.some((plugin) => plugin.manifest.id === props.pluginRequest.plugin_id);
    const name = props.pluginRequest.plugin_name;

    if (!error && !isInstalled) {
        return (
            <button
                onClick={() => {
                    dispatch(installPlugin(props.pluginRequest.plugin_id));
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
            <Link to={'/admin_console/plugins/plugin_' + props.pluginRequest.plugin_id}>
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
    return null;
};

const RenderPluginButtons = (props: {pluginsByPluginIds: RequestedPlugins}) => {
    const installedListing = useSelector(getInstalledListing) as MarketplacePlugin[];
    const pluginRequests = Object.values(props.pluginsByPluginIds).map((request) => request[0]);

    return (
        <div style={buttonsStyle}>
            {pluginRequests.map((pluginRequest) => {
                return (
                    <div key={pluginRequest.plugin_name}>
                        <RenderPluginButton
                            installedListing={installedListing}
                            pluginRequest={pluginRequest}
                        />
                    </div>
                );
            })}
        </div>
    );
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
    const marketplacePlugins: MarketplacePlugin[] = useSelector(getPlugins);

    const getUserIdsForUsersThatRequestedFeature = (requests: PluginRequest[]): string[] => requests.map((request: PluginRequest) => request.user_id);

    useEffect(() => {
        if (!marketplacePlugins.length) {
            dispatch(fetchListing());
        }
    }, [dispatch, fetchListing, marketplacePlugins.length]);

    useEffect(() => {
        // process the plugins once the marketplace plugins are fetched and the plugins are available from the props
        if (requestedPluginsByPluginIds && marketplacePlugins.length && !Object.keys(pluginsByPluginIds).length) {
            const plugins = {} as RequestedPlugins;
            const mPlugins = marketplacePlugins.reduce((acc, mPlugin) => {
                return {
                    ...acc,
                    [mPlugin.manifest.id as keyof string]: mPlugin,
                };
            }, {}) as {[ key: string]: MarketplacePlugin};

            for (const pluginId of Object.keys(requestedPluginsByPluginIds)) {
                plugins[pluginId] = requestedPluginsByPluginIds[pluginId].map((currPlugin: PluginRequest) => {
                    return {
                        ...currPlugin,
                        plugin_name: mPlugins[pluginId].manifest.name || pluginId,
                        plugin_id: pluginId,
                    };
                });
                dispatch(getMissingProfilesByIds(getUserIdsForUsersThatRequestedFeature(requestedPluginsByPluginIds[pluginId])));
            }
            setPluginsByPluginIds(plugins);
        }
    }, [dispatch, marketplacePlugins, requestedPluginsByPluginIds, pluginsByPluginIds]);

    const getUserNamesForUsersThatRequestedFeature = (requests: PluginRequest[]): string[] => {
        const userNames = requests.map((req: PluginRequest) => {
            return '@' + userProfiles[req.user_id]?.username;
        });
        return userNames;
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
            messageBuilder.push('@' + userProfiles[userIds[0]]?.username);

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
                <ul
                    style={usersListStyle}
                    key={pluginIds.join('')}
                >
                    {pluginIds.map((pluginId) => {
                        const plugins = pluginsByPluginIds[pluginId];
                        const uniqueUserRequestsForPlugins = uniqWith(plugins, (one, two) => one.user_id === two.user_id);
                        const numberOfUserRequest = uniqueUserRequestsForPlugins.length;
                        const installRequests = [];
                        let userName: string[] = [];
                        if (numberOfUserRequest === 1) {
                            const userId = uniqueUserRequestsForPlugins[0].user_id;
                            userName.push('@' + userProfiles[userId]?.username);
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
                            <li key={pluginId}>
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

    return (
        <div>
            {customMessageBody}
            {Object.keys(pluginsByPluginIds).length ? <RenderPluginButtons pluginsByPluginIds={pluginsByPluginIds}/> : null}
        </div>
    );
}
