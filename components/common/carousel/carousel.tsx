// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';

import BtnCarousel from './btn_carousel';
import './carousel.scss';

type Props = {
    dataSlides: React.ReactNode[];
    id: string;
}
export default function Carousel({dataSlides, id}: Props) {
    const [slideIndex, setSlideIndex] = useState(1);

    const nextSlide = () => {
        if (slideIndex !== dataSlides.length) {
            setSlideIndex(slideIndex + 1);
        } else if (slideIndex === dataSlides.length) {
            setSlideIndex(1);
        }
    };

    const prevSlide = () => {
        if (slideIndex !== 1) {
            setSlideIndex(slideIndex - 1);
        } else if (slideIndex === 1) {
            setSlideIndex(dataSlides.length);
        }
    };

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
                    <BtnCarousel
                        moveSlide={prevSlide}
                        direction={'prev'}
                    />
                    <BtnCarousel
                        moveSlide={nextSlide}
                        direction={'next'}
                    />
                </div>
            </div>
        </div>
    );
}
