// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {Constants} from 'utils/constants';
import CheckCircleIcon from '../icons/check_circle_icon';
import GlobeCircleSolidIcon from '../icons/globe_circle_solid_icon';
import LockCircleSolidIcon from '../icons/lock_circle_solid_icon';
import UpgradeBadge from '../icons/upgrade_badge_icon';

import './public-private-selector.scss';

type BigButtonSelectorProps = {
    id: ButtonType;
    title: string | React.ReactNode;
    description: string | React.ReactNode;
    iconSVG: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element;
    titleClassName?: string;
    descriptionClassName?: string;
    iconClassName?: string;
    tooltip?: string;
    selected?: boolean;
    disabled?: boolean;
    locked?: boolean;
    onClick: (id: ButtonType) => void;
};

const BigButtonSelector = ({
    id,
    title,
    description,
    iconSVG: IconSVG,
    titleClassName,
    descriptionClassName,
    iconClassName,
    tooltip,
    selected,
    disabled,
    locked,
    onClick,
}: BigButtonSelectorProps) => {
    const handleOnClick = useCallback(
        () => {
            onClick(id);
        },
        [id, onClick],
    );

    const button = (
        <button
            id={id}
            className={classNames('BigButton', {selected, disabled, locked})}
            onClick={handleOnClick}
        >
            <IconSVG className={classNames('GiantIcon', iconClassName)}/>
            <div className='StackedText'>
                <div className={classNames('BigText', titleClassName)}>
                    {title}
                    {locked && <UpgradeBadge className='upgradeBadge'/>}
                </div>
                <div className={classNames('SmallText', descriptionClassName)}>
                    {description}
                </div>
            </div>
            {selected && <CheckCircleIcon className='CheckIcon'/>}
        </button>
    );

    if (!tooltip) {
        return button;
    }

    const tooltipContainer = (
        <Tooltip id={'BigButtonTooltip'}>
            {tooltip}
        </Tooltip>
    );

    return (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='top'
            overlay={tooltipContainer}
        >
            {button}
        </OverlayTrigger>
    );
};

export enum ButtonType {
    PUBLIC = 'O',
    PRIVATE = 'P',
}

type ButtonSelectorProps = {
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    titleClassName?: string;
    descriptionClassName?: string;
    iconClassName?: string;
    tooltip?: string;
    selected?: boolean;
    disabled?: boolean;
    locked?: boolean;
};

type PublicPrivateSelectorProps = {
    selected: ButtonType;
    className?: string;
    publicButtonProps?: ButtonSelectorProps;
    privateButtonProps?: ButtonSelectorProps;
    onChange: (selected: ButtonType) => void;
};

const PublicPrivateSelector = ({
    selected,
    className,
    publicButtonProps: {
        title: titlePublic,
        description: descriptionPublic,
        titleClassName: titleClassNamePublic,
        descriptionClassName: descriptionClassNamePublic,
        iconClassName: iconClassNamePublic,
        tooltip: tooltipPublic,
        disabled: disabledPublic,
        locked: lockedPublic,
    } = {} as ButtonSelectorProps,
    privateButtonProps: {
        title: titlePrivate,
        description: descriptionPrivate,
        titleClassName: titleClassNamePrivate,
        descriptionClassName: descriptionClassNamePrivate,
        iconClassName: iconClassNamePrivate,
        tooltip: tooltipPrivate,
        disabled: disabledPrivate,
        locked: lockedPrivate,
    } = {} as ButtonSelectorProps,
    onChange,
}: PublicPrivateSelectorProps) => {
    const {formatMessage} = useIntl();

    const canSelectPublic = !disabledPublic && !lockedPublic;
    const canSelectPrivate = !disabledPrivate && !lockedPrivate;

    const handleOnClick = useCallback(
        (selection: ButtonType) => {
            if (
                selection === selected ||
                (selection === ButtonType.PUBLIC && !canSelectPublic) ||
                (selection === ButtonType.PRIVATE && !canSelectPrivate)
            ) {
                return;
            }

            onChange(selection);
        },
        [selected, onChange],
    );

    return (
        <div className={classNames('HorizontalContainer', className)}>
            <BigButtonSelector
                id={ButtonType.PUBLIC}
                title={titlePublic || formatMessage({id: 'public_private_selector.public.title', defaultMessage: 'Public'})}
                description={descriptionPublic || formatMessage({id: 'public_private_selector.public.description', defaultMessage: 'Anyone'})}
                iconSVG={GlobeCircleSolidIcon}
                titleClassName={titleClassNamePublic}
                descriptionClassName={descriptionClassNamePublic}
                iconClassName={iconClassNamePublic}
                tooltip={tooltipPublic}
                selected={selected === ButtonType.PUBLIC}
                onClick={handleOnClick}
            />
            <BigButtonSelector
                id={ButtonType.PRIVATE}
                title={titlePrivate || formatMessage({id: 'public_private_selector.private.title', defaultMessage: 'Private'})}
                description={descriptionPrivate || formatMessage({id: 'public_private_selector.private.description', defaultMessage: 'Only invited members'})}
                iconSVG={LockCircleSolidIcon}
                titleClassName={titleClassNamePrivate}
                descriptionClassName={descriptionClassNamePrivate}
                iconClassName={iconClassNamePrivate}
                tooltip={tooltipPrivate}
                selected={selected === ButtonType.PRIVATE}
                disabled={disabledPrivate}
                locked={lockedPrivate}
                onClick={handleOnClick}
            />
        </div>
    );
};

export default PublicPrivateSelector;
