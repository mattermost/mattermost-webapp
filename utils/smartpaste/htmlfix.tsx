// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function fixNestedLists(doc: Document): Document {
    while (doc.querySelectorAll('ul>ul,ul>ol,ol>ul,ol>ol').length > 0) {
        doc.querySelectorAll('ul,ol')?.forEach((element) => {
            if (element?.parentNode?.nodeName === 'UL' || element?.parentNode?.nodeName === 'OL') {
                if (element?.previousSibling?.nodeName === 'LI') {
                    element?.previousSibling?.appendChild(element.cloneNode(true));
                    element.remove();
                } else {
                    const newEl = document.createElement('li');
                    newEl.appendChild(element.cloneNode(true));
                    element?.parentNode?.replaceChild(newEl, element);
                }
            }
        });
    }
    return doc;
}
