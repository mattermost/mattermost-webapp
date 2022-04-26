// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {ComponentType, useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';

import {openModal} from 'actions/views/modals';

import {CardSize, InsightsWidgetTypes} from '../insights';
import InsightsCard from '../card/card';
import InsightsModal from '../insights_modal/insights_modal';

import {InsightsScopes, InsightsCardTitles, ModalIdentifiers} from 'utils/constants';
import {DispatchFunc} from 'mattermost-redux/types/actions';

export interface WidgetHocProps {
    size: CardSize;
    widgetType: InsightsWidgetTypes;
    filterType: string;
    class: string;
}

function widgetHoc<T>(WrappedComponent: ComponentType<T>) {
    const Component = (props: T & WidgetHocProps) => {
        const {formatMessage} = useIntl();
        const dispatch = useDispatch<DispatchFunc>();

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

        const openInsightsModal = () => {
            dispatch(openModal({
                modalId: ModalIdentifiers.INSIGHTS,
                dialogType: InsightsModal,
                dialogProps: {
                    widgetType: props.widgetType,
                    title: title(),
                    subtitle: subTitle(),
                },
            }));
        };

        return (
            <InsightsCard
                class={props.class}
                title={title()}
                subTitle={subTitle()}
                size={props.size}
                onClick={openInsightsModal}
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
