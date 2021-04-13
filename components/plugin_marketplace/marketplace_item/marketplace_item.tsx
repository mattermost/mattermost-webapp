// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {Tooltip} from 'react-bootstrap';

import type {MarketplaceLabel} from 'mattermost-redux/types/marketplace';

import OverlayTrigger from 'components/overlay_trigger';
import PluginIcon from 'components/widgets/icons/plugin_icon.jsx';

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
    iconData?: string;
    labels?: MarketplaceLabel[];
    homepageUrl?: string;

    error?: string;

    button: JSX.Element;
    updateDetails: JSX.Element | null;
    versionLabel: JSX.Element| null;
};

export default class MarketplaceItem extends React.PureComponent <MarketplaceItemProps> {
    render(): JSX.Element {
        let pluginIcon;
        if (this.props.iconData) {
            pluginIcon = (
                <div className='icon__plugin icon__plugin--background'>
                    <img src={this.props.iconData}/>
                </div>
            );
        } else {
            pluginIcon = <PluginIcon className='icon__plugin icon__plugin--background'/>;
        }

        let labels;
        if (this.props.labels && this.props.labels.length !== 0) {
            labels = this.props.labels.map((label) => (
                <Label
                    key={label.name}
                    name={label.name}
                    description={label.description}
                    url={label.url}
                    color={label.color}
                />
            ),
            );
        }

        const pluginDetailsInner = (
            <>
                {this.props.name}
                {this.props.versionLabel}
            </>
        );

        const description = (
            <p className={classNames('more-modal__description', {error_text: this.props.error})}>
                {this.props.error ? this.props.error : this.props.description}
            </p>
        );

        let pluginDetails;
        if (this.props.homepageUrl) {
            pluginDetails = (
                <>
                    <a
                        aria-label={this.props.name.toLowerCase()}
                        className='style--none more-modal__row--link'
                        target='_blank'
                        rel='noopener noreferrer'
                        href={this.props.homepageUrl}
                    >
                        {pluginDetailsInner}
                    </a>
                    {labels}
                    <a
                        aria-label="Plugin's website"
                        className='style--none more-modal__row--link'
                        target='_blank'
                        rel='noopener noreferrer'
                        href={this.props.homepageUrl}
                    >
                        {description}
                    </a>
                </>
            );
        } else {
            pluginDetails = (
                <>
                    <span
                        aria-label={this.props.name.toLowerCase()}
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
                    className={classNames('more-modal__row', 'more-modal__row--link', {item_error: this.props.error})}
                    key={this.props.id}
                    id={'marketplace-plugin-' + this.props.id}
                >
                    {pluginIcon}
                    <div className='more-modal__details'>
                        {pluginDetails}
                        {this.props.updateDetails}

                    </div>
                    <div className='more-modal__actions'>
                        {this.props.button}
                    </div>
                </div>
            </>
        );
    }
}
