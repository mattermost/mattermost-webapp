// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {ComponentType, useCallback} from 'react';
import {useIntl} from 'react-intl';

import {CardSize} from '../insights';
import InsightsCard from '../card/card';

import {InsightsScopes, InsightsCardTitles} from 'utils/constants';

export interface WidgetHocProps {
    size: CardSize;
    widgetType: 'TOP_CHANNELS' | 'TOP_REACTIONS';
    filterType: string;
    class: string;
}

function widgetHoc<T>(WrappedComponent: ComponentType<T>) {
    const Component = (props: T & WidgetHocProps) => {
        const {formatMessage} = useIntl();

        const title = useCallback(() => {
            if (props.filterType === InsightsScopes.MY) {
                return formatMessage(InsightsCardTitles[props.widgetType].myTitle);
            }
            return formatMessage(InsightsCardTitles[props.widgetType].teamTitle);
        }, [props.filterType, props.widgetType]);

        const subTitle = useCallback(() => {
            if (props.filterType === InsightsScopes.MY) {
                return formatMessage(InsightsCardTitles[props.widgetType].mySubTitle);
            }
            return formatMessage(InsightsCardTitles[props.widgetType].teamSubTitle);
        }, [props.filterType, props.widgetType]);

        return (
            <InsightsCard
                class={props.class}
                title={title()}
                subTitle={subTitle()}
                size={props.size}
            >
                <WrappedComponent
                    {...(props as unknown as T)}
                />
            </InsightsCard>

        );
    };

    return Component;
}

export default widgetHoc;
