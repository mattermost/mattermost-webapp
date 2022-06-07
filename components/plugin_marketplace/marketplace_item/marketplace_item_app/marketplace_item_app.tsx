// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import type {MarketplaceLabel} from '@mattermost/types/marketplace';
import {Limits} from '@mattermost/types/cloud';

import MarketplaceItem from '../marketplace_item';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import Toggle from 'components/toggle';

import {localizeMessage} from 'utils/utils';
import Constants from 'utils/constants';

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
    cloudLimits: Limits;

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
        const {id, installed, enabled, error, changingStatus, integrationsUsageAtLimit, cloudLimits} = this.props;

        const toggleDisabledDueToLimit = !enabled && integrationsUsageAtLimit;
        let switchDisabled = false;
        if (!installed || changingStatus !== undefined || error || toggleDisabledDueToLimit) {
            switchDisabled = true;
        }

        let toggled = enabled;
        if (changingStatus !== undefined) {
            toggled = changingStatus;
        }

        const toggle = (
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

        if (!toggleDisabledDueToLimit) {
            return toggle;
        }

        return (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={
                    <Tooltip id={'plugin-marketplace_label_' + id + '-tooltip'}>
                        <FormattedMessage
                            id={'marketplace_modal.toggle.reached_limit.tooltip'}
                            defaultMessage={"You've reached the maximum of {limit} enabled integtations. Upgrade your account for more."}
                            values={{
                                limit: cloudLimits?.integrations?.enabled,
                            }}
                        />
                    </Tooltip>
                }
            >
                {toggle}
            </OverlayTrigger>
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
