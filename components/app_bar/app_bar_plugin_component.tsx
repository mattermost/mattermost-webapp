// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import classNames from 'classnames';

import {Tooltip} from 'react-bootstrap';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {getActivePluginId} from 'selectors/rhs';

import {PluginComponent} from 'types/store/plugins';
import Constants from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';

type PluginComponentProps = {
    component: PluginComponent;
}

const AppBarPluginComponent = (props: PluginComponentProps) => {
    const {component} = props;

    const channel = useSelector(getCurrentChannel);
    const activePluginId = useSelector(getActivePluginId);

    const icon = component.icon;
    const buttonId = component.id;
    const tooltipText = component.tooltipText || component.pluginId;

    const tooltip = (
        <Tooltip id={'pluginTooltip-' + buttonId}>
            <span>{tooltipText}</span>
        </Tooltip>
    );

    return (
        <div>
            <OverlayTrigger
                trigger={['hover']}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='left'
                overlay={tooltip}
            >
                <div
                    id={buttonId}
                    className={classNames('app-bar__icon', {'app-bar__icon--active': component.pluginId === activePluginId})}
                    onClick={() => {
                        component.action?.(channel);
                    }}
                >
                    {icon}
                </div>
            </OverlayTrigger>
        </div>
    );
};

export default AppBarPluginComponent;
