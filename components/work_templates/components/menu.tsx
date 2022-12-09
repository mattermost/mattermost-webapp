// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import classNames from 'classnames';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {injectDevData} from 'mattermost-redux/actions/work_templates';
import {Category, WorkTemplate} from '@mattermost/types/work_templates';
import {GlobalState} from '@mattermost/types/store';

import {worktemplates as workTemplateDevData} from '../dev_data';

import UseCaseMenuItem from './menu/use_case';

const Categories = styled.div`
    h2 {
        margin: 0;
        padding: 8px 16px;
        font-weight: 600;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.02em;
        text-transform: uppercase;
    }

    ul {
        list-style: none;
        padding: 0;
        width: 176px;
    }
`;

const CategoryButton = styled.button`
    width: 155px;
    padding: 10px 16px;
    border: 0;
    background: none;
    text-align: left;

    &.selected {
        background: rgba(var(--denim-button-bg-rgb), 0.04);
        font-weight: 600;
        color: var(--denim-button-bg);
        cursor: pointer;
    }
`;

const UseCases = styled.div`
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 692px;
`;

interface MenuProps {
    className?: string;
    onTemplateSelected: (template: WorkTemplate, quickUse: boolean) => void;
}

const Menu = (props: MenuProps) => {
    const {formatMessage} = useIntl();

    const [selectedCategory, setSelectedCategory] = useState('');

    const dispatch = useDispatch();
    const categories = useSelector((state: GlobalState) => state.entities.worktemplates.categories);
    const worktemplates = useSelector((state: GlobalState) => state.entities.worktemplates.templatesInCategory);

    useEffect(() => {
        // DEV - REMOVE ME WHEN SERVER RETURNS DATA
        // allows us to load the dev work templates from the store
        dispatch(injectDevData(workTemplateDevData));
    }, []);

    useEffect(() => {
        if (categories?.length === 0 || selectedCategory !== '') {
            return;
        }

        setSelectedCategory(categories[0].id);
    }, [categories, selectedCategory]);

    const changeCategory = (category: Category) => {
        setSelectedCategory(category.id);
    };

    const quickUse = (template: WorkTemplate) => {
        props.onTemplateSelected(template, true);
    };

    const selectTemplate = (template: WorkTemplate) => {
        props.onTemplateSelected(template, false);
    };

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className={props.className}>
            <Categories>
                <h2>
                    {formatMessage({id: 'work_templates.menu.template_title', defaultMessage: 'TEMPLATE'})}
                </h2>
                <ul>
                    {categories.map((category) => (
                        <li key={category.id}>
                            <CategoryButton
                                onClick={() => changeCategory(category)}
                                className={classNames({selected: category.id === selectedCategory})}
                            >
                                {category.name}
                            </CategoryButton>
                        </li>
                    ))}
                </ul>
            </Categories>
            <UseCases>
                {worktemplates[selectedCategory]?.map((workTemplate) => (
                    <UseCaseMenuItem
                        key={workTemplate.id}
                        name={workTemplate.useCase}
                        illustration={workTemplate.illustration}
                        channelsCount={workTemplate.content.filter((c) => c.channel).length}
                        boardsCount={workTemplate.content.filter((c) => c.board).length}
                        playbooksCount={workTemplate.content.filter((c) => c.playbook).length}
                        onQuickUse={() => quickUse(workTemplate)}
                        onSelectTemplate={() => selectTemplate(workTemplate)}
                    />
                ))}
            </UseCases>
        </div>
    );
};

const StyledMenu = styled(Menu)`
    display: flex;
`;

export default StyledMenu;
