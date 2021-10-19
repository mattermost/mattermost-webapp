// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useState} from 'react';

import CarouselButton from './carousel_button';
import './carousel.scss';

type Props = {
    dataSlides: React.ReactNode[];
    id: string;
    infiniteSlide: boolean;
}
export default function Carousel({dataSlides, id, infiniteSlide}: Props) {
    const [slideIndex, setSlideIndex] = useState(1);
    const [prevButtonDisabled, setPrevButtonDisabled] = useState(!infiniteSlide);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(false);

    const nextSlide = () => {
        setPrevButtonDisabled(false);
        if (slideIndex !== dataSlides.length) {
            setSlideIndex(slideIndex + 1);
        } else if (slideIndex === dataSlides.length) {
            if (infiniteSlide) {
                setSlideIndex(1);
            }
        }
    };

    const prevSlide = () => {
        setNextButtonDisabled(false);
        if (slideIndex !== 1) {
            setSlideIndex(slideIndex - 1);
        } else if (slideIndex === 1) {
            if (infiniteSlide) {
                setSlideIndex(dataSlides.length);
            }
        }
    };

    useEffect(() => {
        if (slideIndex === dataSlides.length) {
            if (!infiniteSlide) {
                setNextButtonDisabled(true);
            }
        } else if (slideIndex === 1) {
            if (!infiniteSlide) {
                setPrevButtonDisabled(true);
            }
        }
    }, [slideIndex]);

    const moveDot = (index: number) => {
        setSlideIndex(index);
    };

    return (
        <div
            className='container-slider'
            id={id}
        >
            {dataSlides.map((obj: any, index: number) => {
                return (
                    <div
                        key={obj.id}
                        className={slideIndex === index + 1 ? 'slide active-anim' : 'slide'}
                    >
                        {obj}
                    </div>
                );
            })}

            <div className='container-footer'>
                <div className='container-dots'>
                    {dataSlides.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => moveDot(index + 1)}
                            className={slideIndex === index + 1 ? 'dot active' : 'dot'}
                        />
                    ))}
                </div>
                <div className=' buttons container-buttons'>
                    <CarouselButton
                        moveSlide={prevSlide}
                        direction={'prev'}
                        disabled={prevButtonDisabled}
                    />
                    <CarouselButton
                        moveSlide={nextSlide}
                        direction={'next'}
                        disabled={nextButtonDisabled}
                    />
                </div>
            </div>
        </div>
    );
}
