// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import semver from 'semver';

import {doAppCall, openAppsModal} from 'actions/apps';
import {intlShim} from 'components/suggestion/command_provider/app_command_parser/app_command_parser_dependencies';
import {AppCallTypes} from 'mattermost-redux/constants/apps';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {AppBinding, AppCall, AppCallRequest, AppForm} from 'mattermost-redux/types/apps';
import {Channel} from 'mattermost-redux/types/channels';
import {MarketplaceApp, MarketplacePlugin} from 'mattermost-redux/types/marketplace';
import {Theme} from 'mattermost-redux/types/themes';

import {DoAppCall, PostEphemeralCallResponseForChannel} from 'types/apps';
import {PluginComponent} from 'types/store/plugins';
import {createCallContext, createCallRequest} from 'utils/apps';

import './app_bar.scss';

export type Props = {
    channelHeaderComponents: PluginComponent[];
    appBarBindings: AppBinding[];
    theme: Theme;
    channel: Channel;
    marketplaceListing: Array<MarketplacePlugin | MarketplaceApp>;
    activePluginId?: string;

    actions: {
        fetchListing: () => Promise<{ data?: (MarketplacePlugin | MarketplaceApp)[]}>;
    };
}

type State = {
    loadedMarketplaceListing: boolean;
}

export default class AppBar extends React.PureComponent<Props> {
    static defaultProps: Partial<Props> = {
        channelHeaderComponents: [],
        appBarBindings: [],
        marketplaceListing: [],
    }

    state: State = {
        loadedMarketplaceListing: false,
    }

    componentDidMount() {
        this.getMarketPlaceListings();
    }

    getMarketPlaceListings = async () => {
        await this.props.actions.fetchListing();
        this.setState({loadedMarketplaceListing: true});
    }

    getIcon = (component: PluginComponent): React.ReactNode => {
        let entry: MarketplacePlugin | undefined;
        for (const e of this.props.marketplaceListing) {
            const p = e as MarketplacePlugin;
            if (p.manifest.id === component.pluginId && p.icon_data) {
                if (!entry || semver.gte(p.manifest.version, entry.manifest.version)) {
                    entry = p;
                }
            }
        }

        if (!entry) {
            return component.icon;
        }

        return (
            <img src={entry.icon_data}/>
        );
    }

    render() {
        const style: CSSProperties = {};
        if (!this.state.loadedMarketplaceListing) {
            style.display = 'none';
        }

        return (
            <div className='app-bar' style={style}>
                {!this.props.channelHeaderComponents.length && (
                    <span>
                        {'No channel header components found'}
                    </span>
                )}
                {this.props.channelHeaderComponents.map((component) => (
                    <div
                        key={component.id}
                        className={classNames('app-bar-icon', {'active-rhs-plugin': component.pluginId === this.props.activePluginId})}
                        onClick={() => {
                            component.action?.(this.props.channel);
                        }}
                    >
                        {this.getIcon(component)}
                    </div>
                ))}
                {this.props.appBarBindings.map((binding) => (
                    <AppBindingComponent
                        key={binding.app_id + binding.location}
                        binding={binding}
                    />
                ))}
            </div>
        );
    }
}


type BindingComponentProps = {
    binding: AppBinding;
}

const AppBindingComponent = (props: BindingComponentProps) => {
    const {binding} = props;

    const channelId = useSelector(getCurrentChannelId);
    const teamId = useSelector(getCurrentTeamId);
    const dispatch = useDispatch();

    const submitAppCall = React.useCallback(async () => {
        const call = binding.form?.call || binding.call;

        if (!call) {
            return;
        }
        const context = createCallContext(
            binding.app_id,
            binding.location,
            channelId,
            teamId,
            '',
            '',
        );
        const callRequest = createCallRequest(
            call,
            context,
        );

        if (binding.form) {
            dispatch(openAppsModal(binding.form, callRequest));
            return;
        }

        dispatch(doAppCall(callRequest, AppCallTypes.SUBMIT, intlShim as any));
    }, [binding, teamId, channelId]);

    return (
        <div
            className={'app-bar-binding'}
            onClick={submitAppCall}
        >
            <img src={binding.icon}/>
        </div>
    )
}
