// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FC} from 'react';
import {FormattedMessage} from 'react-intl';

type radioContent = Array<
Array<{
    title?: {
        id: string;
        message: string;
        radioTitleClassname?: string;
    };
    id: string;
    message: string;
    checked?: any;
    radioContentClassname?: string;
}>
>;
type CheckBoxContent = Array<{
    title?: {
        id: string;
        message: string;
        checkboxTitleClassname?: string;
    };
    description?: {
        id: string;
        message: string;
    };
    id: string;
    message: string;
    checked?: any;
    ref?: any;
    checkBoxContentClassname?: string;
}>;

type selectContent = JSX.Element;

type createSectionProps = {
    noPaddingTop?: boolean;
    title: {
        id: string;
        message: string;
        titleClassname?: string;
    };
    description?: {
        id: string;
        message: string;
        descriptionClassname?: string;
    };
    xtraInfo?: JSX.Element | false;
    subSection?: {
        radio?: radioContent;
        checkbox?: CheckBoxContent;
        select?: selectContent;
        checkBoxBeforeRadio?: boolean;
    };
    somethingChanged?: boolean;
    setSomethingChanged?: React.Dispatch<React.SetStateAction<boolean>>;
    onCheckBoxChange?: (e: boolean) => void;
    onRadioChange?: (e: any) => void;
    showRadioSection?: boolean;
};

function GenericSectionCreator({
    title,
    description,
    xtraInfo,
    subSection,
    onCheckBoxChange,
    onRadioChange,
    showRadioSection = true,
}: createSectionProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onCheckBoxChange!(e.target.checked);
    };

    const handleRadioChange = (e: string) => {
        onRadioChange!(e);
    };

    const Title = (
        <div className={`${title.titleClassname}`}>
            <FormattedMessage
                id={title.id}
                defaultMessage={title.message}
            />
        </div>
    );

    const Description = description && (
        <div className={`${description.descriptionClassname}`}>
            <FormattedMessage
                id={description.id}
                defaultMessage={description.message}
            />
        </div>
    );

    const radioSection =
        showRadioSection &&
        subSection?.radio?.map((c) =>
            c.map((i) => (
                <div>
                    {i.title?.id && (
                        <div className={i.title.radioTitleClassname}>
                            <FormattedMessage
                                id={i.title?.id}
                                defaultMessage={i.title?.message}
                            />
                        </div>
                    )}
                    <div className={`radio ${i.radioContentClassname}`}>
                        <label>
                            <input

                                // id={name + "C"}
                                type='radio'
                                checked={i.checked}
                                onChange={() => handleRadioChange(i.message)}
                            />
                            <FormattedMessage
                                id={i.id}
                                defaultMessage={i.message}
                            />
                        </label>
                    </div>
                </div>
            )),
        );

    const checkBoxSection = subSection?.checkbox?.map((i) => (
        <div>
            {i.title?.id && (
                <div className={i.title.checkboxTitleClassname}>
                    <FormattedMessage
                        id={i.title?.id}
                        defaultMessage={i.title.message}
                    />
                </div>
            )}
            <div className={`checkbox ${i.checkBoxContentClassname}`}>
                <label>
                    <input
                        ref={i.ref}

                        // id={name + "C"}
                        type='checkbox'
                        checked={i.checked}
                        onChange={(e) => {
                            handleChange(e);
                        }}
                    />
                    <FormattedMessage
                        id={i?.id}
                        defaultMessage={i?.message}
                    />
                </label>
            </div>
            {i.description?.id && (
                <div>
                    <FormattedMessage
                        id={i.description?.id}
                        defaultMessage={i.description?.message}
                    />
                </div>
            )}
        </div>
    ));

    const selectSection = subSection?.select;

    return (
        <div>
            {Title}
            {Description}
            {!subSection?.checkBoxBeforeRadio ? (
                <div>
                    <div> {radioSection}</div>
                    <div>{checkBoxSection}</div>
                </div>
            ) : (
                <div>
                    <div> {checkBoxSection}</div>
                    <div>{radioSection}</div>
                </div>
            )}
            {selectSection}
            {xtraInfo}
            <div className='divider-light'/>
        </div>
    );
}

export default GenericSectionCreator;
