// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {GenericModal} from '@mattermost/components';
import AccessDeniedSvg from 'components/common/svg_images_components/access_denied_svg';
import {useControlScreeningInProgressModal} from 'components/common/hooks/useControlModal';

import './content.scss';

export default function AirGappedSelfHostedPurhcaseModal() {
    const {close} = useControlScreeningInProgressModal();

    return (
        <GenericModal
            onExited={close}
            show={true}
            className='ScreeningInProgressModal'
        >
            <div className='ScreeningInProgressModal__content'>
                <AccessDeniedSvg
                    height={350}
                    width={350}
                />
                <div className='ScreeningInProgressModal__title'>
                    <FormattedMessage
                        id={'self_hosted_signup.screening_title'}
                        defaultMessage={'Screening in progress'}
                    />
                </div>
                <div className='ScreeningInProgressModal__description'>
                    <FormattedMessage
                        id={'self_hosted_signup.screening_description'}
                        defaultMessage={'We are checking whether your purchase is export compliant. If it is, the purchase will be completed and you will be emailed your license in up to 3 days.'}
                    />
                </div>
            </div>
        </GenericModal>
    );
}
