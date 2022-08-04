// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {LicenseLinks} from 'utils/constants';

const ContainerSpan = styled.span`
font-style: normal;
display: inline-block;
font-weight: 400;
font-size: 10px;
line-height: 14px;
letter-spacing: 0.02em;
color: rgba(var(--center-channel-text-rgb), 0.56);
`;

const Span = styled.span`
font-weight: 600;
`;

const A = styled.a`
color: var(--denim-button-bg);
`;

function StartTrialCaution() {
    const {formatMessage} = useIntl();

    const message = formatMessage({
        id: 'pricing_modal.start_trial.disclaimer',
        defaultMessage: 'By selecting <span>Try free for 30 days,</span> I agree to the <a>Mattermost Software Evaluation Agreement, Privacy Policy,</a> and receiving product emails.',
    }, {
        span: (chunks: React.ReactNode | React.ReactNodeArray) => (<Span>{chunks}</Span>),
        a: (chunks: React.ReactNode | React.ReactNodeArray) => (
            <A
                href={LicenseLinks.SOFTWARE_EVALUATION_AGREEMENT}
                target='_blank'
            >
                {chunks}
            </A>),
    });
    return (<ContainerSpan>{message}</ContainerSpan>);
}

export default StartTrialCaution;
