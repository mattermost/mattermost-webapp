// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {storiesOf} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';

import Card from 'components/card/card';

import TitleAndButtonCardHeader from './title_and_button_card_header/title_and_button_card_header';

storiesOf('Components/Card', module).
    addDecorator(withKnobs).
    add(
        'Multiple Cards',
        () => {
            const WrapperComponent = () => {
                return (
                    <>
                        <Card
                            expanded={true}
                        >
                            <Card.Header>
                                {'This is a regular header'}
                            </Card.Header>
                            <Card.Body>
                                {'Hello this is card content!'}
                            </Card.Body>
                        </Card>
                        <Card
                            expanded={true}
                            className={'console'}
                        >
                            <Card.Header>
                                <TitleAndButtonCardHeader
                                    title={
                                        <FormattedMessage
                                            id='admin.data_retention.customPolicies.title'
                                            defaultMessage='Custom retention policies'
                                        />
                                    }
                                    subtitle={
                                        <FormattedMessage
                                            id='admin.data_retention.customPolicies.subTitle'
                                            defaultMessage='Customize how long specific teams and channels will keep messages.'
                                        />
                                    }
                                    buttonText={
                                        <FormattedMessage
                                            id='admin.data_retention.customPolicies.addPolicy'
                                            defaultMessage='Add policy'
                                        />
                                    }
                                    onClick={() => {}}
                                />
                            </Card.Header>
                            <Card.Body>
                                {'Hello this is card content!'}
                            </Card.Body>
                        </Card>
                    </>
                );
            };
            return (
                <WrapperComponent/>
            );
        },
    );
