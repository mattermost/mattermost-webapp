// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';
import Constants from 'utils/constants.jsx';

interface IClearableTooltipProps{
    clearableTooltipText?: string | JSX.Element;
    clearable?: boolean;
    onClear?: (e: React.MouseEvent) => void;
    value: string;
}

const ClearableTooltip = (props: IClearableTooltipProps) => {
    const clearableTooltipText = React.useMemo(() => {
        if (props.clearableTooltipText) {
            return props.clearableTooltipText;
        }
        return (
            <FormattedMessage
                id={'input.clear'}
                defaultMessage='Clear'
            />
        );
    }, [props.clearableTooltipText]);

    if (props.clearable && props.value && props.onClear) {
        return (
            <div
                className='input-clear visible'
                onMouseDown={props.onClear}
            >
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={
                        <Tooltip id={'InputClearTooltip'}>
                            {clearableTooltipText}
                        </Tooltip>
                    }
                >
                    <span
                        className='input-clear-x'
                        aria-hidden='true'
                    >
                        <i className='icon icon-close-circle'/>
                    </span>
                </OverlayTrigger>
            </div>
        );
    }
    return null;
};

export default ClearableTooltip;
