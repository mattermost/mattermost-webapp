// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {storiesOf} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';

import Card from './card';

storiesOf('Admin Console/Card', module).
    addDecorator(withKnobs).
    add(
        'Multiple Cards',
        () => {
            const WrapperComponent = () => {
                return (
                    <>
                        <Card
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
                            body={
                                <div>
                                    {'Hello this is card content!'}
                                </div>
                            }
                            buttonText={
                                <FormattedMessage
                                    id='admin.data_retention.customPolicies.addPolicy'
                                    defaultMessage='Add policy'
                                />
                            }
                            onClick={() => {}}
                        />
                        <Card
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
                            body={
                                <div>
                                    {'Hello this is card content!'}
                                </div>
                            }
                        />
                    </>
                );
            };
            return (
                <WrapperComponent/>
            );
        },
    );
