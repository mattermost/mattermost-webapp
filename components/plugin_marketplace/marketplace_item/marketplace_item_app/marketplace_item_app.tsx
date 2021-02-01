// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import type {MarketplaceLabel} from 'mattermost-redux/types/marketplace';

import MarketplaceItem from '../marketplace_item';

export type MarketplaceItemAppProps = {
    id: string;
    name: string;
    description?: string;
    homepage_url?: string;
    root_url: string;

    installed: boolean;
    labels?: MarketplaceLabel[];

    trackEvent: (category: string, event: string, props?: unknown) => void;

    actions: {
        installApp: (id: string, url: string) => void;
        closeMarketplaceModal: () => void;
    };
};

export default class MarketplaceItemApp extends React.PureComponent <MarketplaceItemAppProps> {
    onInstall = (): void => {
        this.props.trackEvent('plugins', 'ui_marketplace_install_app', {
            app_id: this.props.id,
        });

        this.props.actions.installApp(this.props.id, this.props.root_url);

        this.props.actions.closeMarketplaceModal();
    }

    getItemButton(): JSX.Element {
        let button;
        if (this.props.installed) {
            button = (
                <button
                    className='btn btn-outline'
                    disabled={true}
                >
                    <FormattedMessage
                        id='marketplace_modal.list.installed'
                        defaultMessage='Installed'
                    />
                </button>
            );
        } else {
            button = (
                <button
                    onClick={this.onInstall}
                    className='btn btn-primary'
                >
                    <FormattedMessage
                        id='marketplace_modal.list.Install'
                        defaultMessage='Install'
                    />
                </button>
            );
        }

        return button;
    }

    render(): JSX.Element {
        return (
            <>
                <MarketplaceItem
                    button={this.getItemButton()}
                    updateDetails={null}
                    versionLabel={null}
                    {...this.props}
                />
            </>
        );
    }
}
