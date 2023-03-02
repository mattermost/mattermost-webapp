// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import Icon from '@mattermost/compass-components/foundations/icon';

import {openModal} from 'actions/views/modals';

import MarketplaceModal from 'components/plugin_marketplace';
import OverlayTrigger from 'components/overlay_trigger';

import {Constants, ModalIdentifiers} from 'utils/constants';

const AppBarMarketplace = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const handleOpenMarketplace = useCallback(() => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.PLUGIN_MARKETPLACE,
                dialogType: MarketplaceModal,
                dialogProps: {openedFrom: 'app_bar'},
            }),
        );
    }, [dispatch]);

    const label = formatMessage({id: 'app_bar.marketplace', defaultMessage: 'App Marketplace'});

    return (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='left'
            overlay={(
                <Tooltip id='tooltip-marketplace'>
                    <span>{label}</span>
                </Tooltip>
            )}
        >
            <div
                id='app_bar_marketplace'
                aria-label={label}
                className={'app-bar__icon app-bar__icon--bottom'}
                onClick={handleOpenMarketplace}
            >
                <div className='app-bar__old-icon app-bar__icon-inner app-bar__icon-inner--centered'>
                    <Icon
                        size={16}
                        glyph={'view-grid-plus-outline'}
                    />
                </div>
            </div>
        </OverlayTrigger>
    );
};

export default AppBarMarketplace;
