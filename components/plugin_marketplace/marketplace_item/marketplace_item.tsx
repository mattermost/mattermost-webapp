// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import type {MarketplaceLabel} from '@mattermost/types/marketplace';

import {getCloudLimits, isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {cloudFreeEnabled} from 'mattermost-redux/selectors/entities/preferences';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import PluginIcon from 'components/widgets/icons/plugin_icon';

import {Constants} from 'utils/constants';

// Label renders a tag showing a name and a description in a tooltip.
// If a URL is provided, clicking on the tag will open the URL in a new tab.
export const Label = ({name, description, url, color}: MarketplaceLabel): JSX.Element => {
    const tag = (
        <span
            className='tag'
            style={{backgroundColor: color || ''}}
        >
            {name.toUpperCase()}
        </span>
    );

    let label;
    if (description) {
        label = (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={
                    <Tooltip id={'plugin-marketplace_label_' + name.toLowerCase() + '-tooltip'}>
                        {description}
                    </Tooltip>
                }
            >
                {tag}
            </OverlayTrigger>
        );
    } else {
        label = tag;
    }

    if (url) {
        return (
            <a
                aria-label={name.toLowerCase()}
                className='style--none more-modal__row--link'
                target='_blank'
                rel='noopener noreferrer'
                href={url}
            >
                {label}
            </a>
        );
    }

    return label;
};

export type MarketplaceItemProps = {
    id: string;
    name: string;
    description?: string;
    iconSource?: string;
    labels?: MarketplaceLabel[];
    homepageUrl?: string;

    error?: string;

    controls: JSX.Element;
    updateDetails: JSX.Element | null;
    versionLabel: JSX.Element| null;
};

export default function MarketplaceItem(props: MarketplaceItemProps) {
    const intl = useIntl();

    const isCloudLicense = useSelector(isCurrentLicenseCloud);
    const isCloudFreeEnabled = useSelector(cloudFreeEnabled);
    const limits = useSelector(getCloudLimits);

    let icon;
    if (props.iconSource) {
        icon = (
            <div className='icon__plugin icon__plugin--background'>
                <img src={props.iconSource}/>
            </div>
        );
    } else {
        icon = <PluginIcon className='icon__plugin icon__plugin--background'/>;
    }

    let labels: React.ReactNodeArray = [];
    if (props.labels && props.labels.length !== 0) {
        labels = props.labels.map((label) => (
            <Label
                key={label.name}
                name={label.name}
                description={label.description}
                url={label.url}
                color={label.color}
            />
        ));
    }

    if (isCloudFreeEnabled && isCloudLicense && limits?.integrations?.enabled && Constants.Integrations.FREEMIUM_USAGE_IGNORED_PLUGINS.includes(props.id)) {
        labels.push(
            <Label
                name={intl.formatMessage({
                    id: 'marketplace_modal.core_plugin.name',
                    defaultMessage: 'CORE PLUGIN',
                })}
                description={intl.formatMessage({
                    id: 'marketplace_modal.core_plugin.description',
                    defaultMessage: 'This plugin does not count towards your limit of {limit} enabled integrations',
                }, {
                    limit: limits.integrations.enabled.toString(),
                })}
            />,
        );
    }

    const pluginDetailsInner = (
        <>
            {props.name}
            {props.versionLabel}
        </>
    );

    const description = (
        <p className={classNames('more-modal__description', {error_text: props.error})}>
            {props.error ? props.error : props.description}
        </p>
    );

    let pluginDetails;
    if (props.homepageUrl) {
        pluginDetails = (
            <>
                <a
                    aria-label={props.name.toLowerCase()}
                    className='style--none more-modal__row--link'
                    target='_blank'
                    rel='noopener noreferrer'
                    href={props.homepageUrl}
                >
                    {pluginDetailsInner}
                </a>
                {labels}
                <a
                    aria-label="Plugin's website"
                    className='style--none more-modal__row--link'
                    target='_blank'
                    rel='noopener noreferrer'
                    href={props.homepageUrl}
                >
                    {description}
                </a>
            </>
        );
    } else {
        pluginDetails = (
            <>
                <span
                    aria-label={props.name.toLowerCase()}
                    className='style--none'
                >
                    {pluginDetailsInner}
                </span>
                {labels}
                <span
                    aria-label="Plugin\'s website"
                    className='style--none'
                >
                    {description}
                </span>
            </>
        );
    }

    return (
        <>
            <div
                className={classNames('more-modal__row', 'more-modal__row--link', {item_error: props.error})}
                key={props.id}
                id={'marketplace-plugin-' + props.id}
            >
                {icon}
                <div className='more-modal__details'>
                    {pluginDetails}
                    {props.updateDetails}

                </div>
                <div className='more-modal__actions'>
                    {props.controls}
                </div>
            </div>
        </>
    );
}
