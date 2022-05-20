// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useState, useEffect} from 'react';

export default function useScrollToAnchor(id: string, shouldScroll: boolean, scrollOptions: {alignToTop: boolean}) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (!scrolled && shouldScroll) {
            const el = document.getElementById(id);
            if (el) {
                setScrolled(true);
                if (scrollOptions.alignToTop) {
                    el.scrollIntoView(true);
                } else {
                    el.scrollIntoView();
                }
            }
        }
    }, [shouldScroll]);
}
