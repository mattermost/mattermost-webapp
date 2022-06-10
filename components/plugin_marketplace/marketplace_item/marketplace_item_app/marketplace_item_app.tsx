// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import type {MarketplaceLabel} from '@mattermost/types/marketplace';

import MarketplaceItem from '../marketplace_item';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import Toggle from 'components/toggle';

import {localizeMessage} from 'utils/utils';

export type MarketplaceItemAppProps = {
    id: string;
    name: string;
    description?: string;
    homepageUrl?: string;
    iconURL?: string;

    installed: boolean;
    enabled: boolean;
    changingStatus: boolean | undefined;
    labels?: MarketplaceLabel[];
    integrationsUsageAtLimit: boolean;

    installing: boolean;
    error?: string;

    trackEvent: (category: string, event: string, props?: unknown) => void;

    actions: {
        installApp: (id: string) => Promise<boolean>;
        enableApp: (id: string) => Promise<boolean>;
        disableApp: (id: string) => Promise<boolean>;
        closeMarketplaceModal: () => void;
    };
};

export default class MarketplaceItemApp extends React.PureComponent <MarketplaceItemAppProps> {
    onInstall = (): void => {
        this.props.trackEvent('plugins', 'ui_marketplace_install_app', {
            app_id: this.props.id,
        });

        this.props.actions.installApp(this.props.id).then((res) => {
            if (res) {
                this.props.actions.closeMarketplaceModal();
            }
        });
    }

    getItemControls(): JSX.Element {
        let actionButton: React.ReactNode;

        if (this.props.installed && !this.props.installing && !this.props.error) {
            actionButton = (
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
            let actionLabel: React.ReactNode;

            if (this.props.error) {
                actionLabel = (
                    <FormattedMessage
                        id='marketplace_modal.list.try_again'
                        defaultMessage='Try Again'
                    />
                );
            } else {
                actionLabel = (
                    <FormattedMessage
                        id='marketplace_modal.list.install'
                        defaultMessage='Install'
                    />
                );
            }

            actionButton = (
                <button
                    onClick={this.onInstall}
                    className='btn btn-primary'
                    disabled={this.props.installing}
                >
                    <LoadingWrapper
                        loading={this.props.installing}
                        text={localizeMessage('marketplace_modal.installing', 'Installing...')}
                    >
                        {actionLabel}
                    </LoadingWrapper>
                </button>
            );
        }

        const statusToggle = this.getAppStatusToggle();
        return (
            <>
                {actionButton}
                {statusToggle}
            </>
        );
    }

    getAppStatusToggle(): React.ReactNode {
        const {id, installed, enabled, error, changingStatus, integrationsUsageAtLimit} = this.props;

        const toggleDisabledDueToLimit = !enabled && integrationsUsageAtLimit;
        let switchDisabled = false;
        if (!installed || changingStatus !== undefined || error || toggleDisabledDueToLimit) {
            switchDisabled = true;
        }

        let toggled = enabled;
        if (changingStatus !== undefined) {
            toggled = changingStatus;
        }

        return (
            <Toggle
                id={`app-enable-toggle-${id}`}
                disabled={switchDisabled}
                onToggle={() => {
                    if (enabled) {
                        this.props.actions.disableApp(id);
                    } else {
                        this.props.actions.enableApp(id);
                    }
                }}
                toggled={toggled}
                className='btn-lg'
            />
        );
    }

    render(): JSX.Element {
        return (
            <>
                <MarketplaceItem
                    controls={this.getItemControls()}
                    updateDetails={null}
                    versionLabel={null}
                    iconSource={this.props.iconURL}
                    {...this.props}
                />
            </>
        );
    }
}
