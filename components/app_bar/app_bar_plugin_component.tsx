// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import classNames from 'classnames';

import {Tooltip} from 'react-bootstrap';

import {getCurrentChannel, getMyCurrentChannelMembership} from 'mattermost-redux/selectors/entities/channels';

import {getActivePluginId} from 'selectors/rhs';

import {PluginComponent} from 'types/store/plugins';
import Constants from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';
import PluginIcon from 'components/widgets/icons/plugin_icon';

type PluginComponentProps = {
    component: PluginComponent;
}

enum ImageLoadState {
    LOADING = 'loading',
    LOADED = 'loaded',
    ERROR = 'error',
}

const AppBarPluginComponent = (props: PluginComponentProps) => {
    const {component} = props;

    const channel = useSelector(getCurrentChannel);
    const channelMember = useSelector(getMyCurrentChannelMembership);
    const activePluginId = useSelector(getActivePluginId);

    const [imageLoadState, setImageLoadState] = useState<ImageLoadState>(ImageLoadState.LOADING);

    useEffect(() => {
        setImageLoadState(ImageLoadState.LOADING);
    }, [component.iconUrl]);

    const onImageLoadComplete = () => {
        setImageLoadState(ImageLoadState.LOADED);
    };

    const onImageLoadError = () => {
        setImageLoadState(ImageLoadState.ERROR);
    };

    const buttonId = component.id;
    const tooltipText = component.tooltipText || component.pluginId;
    const tooltip = (
        <Tooltip id={'pluginTooltip-' + buttonId}>
            <span>{tooltipText}</span>
        </Tooltip>
    );

    const iconUrl = component.iconUrl;
    let content: React.ReactNode = (
        <div className='app-bar__icon-inner'>
            <img
                src={iconUrl}
                onLoad={onImageLoadComplete}
                onError={onImageLoadError}
            />
        </div>
    );

    if (imageLoadState === ImageLoadState.ERROR) {
        content = (
            <PluginIcon className='icon__plugin'/>
        );
    }

    const isButtonActive = component.pluginId === activePluginId;

    return (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='left'
            overlay={tooltip}
        >
            <div
                id={buttonId}
                className={classNames('app-bar__icon', {'app-bar__icon--active': isButtonActive})}
                onClick={() => {
                    component.action?.(channel, channelMember);
                }}
            >
                {content}
            </div>
        </OverlayTrigger>
    );
};

export default AppBarPluginComponent;
