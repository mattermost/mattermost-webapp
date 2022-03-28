// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback} from 'react';

import {useIntl} from 'react-intl';
import classNames from 'classnames';

import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

import * as Utils from 'utils/utils.jsx';

import './insights_header.scss';

type Props = {
    filterType: string;
    setFilterTypeTeam: () => void;
    setFilterTypeMy: () => void;
}

const InsightsHeader = (props: Props) => {
    const {formatMessage} = useIntl();

    const title = useCallback(() => {
        if (props.filterType === 'team') {
            return (
                formatMessage({
                    id: 'insights.teamHeading',
                    defaultMessage: 'Team insights',
                })
            );
        }
        return (
            formatMessage({
                id: 'insights.myHeading',
                defaultMessage: 'My insights',
            })
        );
    }, [props.filterType]);

    return (
        <header
            className={classNames('Header Insights___header')}
        >
            <div className='left'>
                <MenuWrapper id='insightsFilterDropdown'>
                    <h2>
                        {title()}
                        <span className='icon'>
                            <Icon
                                size={16}
                                glyph={'chevron-down'}
                            />
                        </span>
                    </h2>
                    <Menu
                        ariaLabel={Utils.localizeMessage('insights.filter.ariaLabel', 'Insights Filter Menu')}
                    >
                        <Menu.ItemAction
                            id='insightsDropdownMy'
                            buttonClass='insights-filter-btn'
                            onClick={props.setFilterTypeMy}
                            text={
                                <>
                                    <span className='icon'>
                                        <Icon
                                            size={16}
                                            glyph={'account-outline'}
                                        />
                                    </span>
                                    {Utils.localizeMessage('insights.filter.myInsights', 'My insights')}
                                </>
                            }
                        />
                        <Menu.ItemAction
                            id='insightsDropdownTeam'
                            buttonClass='insights-filter-btn'
                            onClick={props.setFilterTypeTeam}
                            text={
                                <>
                                    <span className='icon'>
                                        <Icon
                                            size={16}
                                            glyph={'account-multiple-outline'}
                                        />
                                    </span>
                                    {Utils.localizeMessage('insights.filter.teamInsights', 'Team insights')}
                                </>
                            }
                        />
                    </Menu>
                </MenuWrapper>
            </div>
        </header>
    );
};

export default memo(InsightsHeader);
