// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './wizard_radio_button_container.scss';

type Props = {
    next?: () => void;
    children: React.ReactNode | React.ReactNodeArray;
}
import Constants from 'utils/constants';

export default function WizardRadioButtonContainer(props: Props) {
    const onNext = (e: React.KeyboardEvent) => {
        if (e.key !== Constants.KeyCodes.ENTER[0]) {
            return;
        }
        if (!props.next) {
            return;
        }

        props.next();
    };

    return (
        <ul
            onKeyUp={onNext}
            className='WizardRadioButtonContainer'
        >
            {props.children}
        </ul>
    );
}

