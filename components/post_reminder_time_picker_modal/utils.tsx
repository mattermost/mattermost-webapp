// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return [year, month, day].join('-');
}

export function makeTimeMenuList(currentDate: Date, selectedDate: Date, isMilitaryTime: boolean): {timeMenuList: string[]; selectedTime: string} {
    const timeMenuItems = [];
    let h = 0;
    let m = 0;

    if (formatDate(currentDate) === formatDate(selectedDate)) {
        h = currentDate.getHours();
        m = currentDate.getMinutes();
        if (m > 20) {
            h++;
            m = 0;
        } else {
            m = 30;
        }
    }

    for (let i = h; i < 24; i++) {
        for (let j = m / 30; j < 2; j++) {
            let t;
            if (isMilitaryTime) {
                t = i.toString().padStart(2, '0') + ':' + (j * 30).toString().padStart(2, '0');
            } else {
                const ampm = i >= 12 ? ' PM' : ' AM';
                let hour = i > 12 ? i - 12 : i;
                if (hour === 0) {
                    hour = 12;
                }
                t = hour.toString() + ':' + (j * 30).toString().padStart(2, '0') + ampm;
            }
            timeMenuItems.push(
                t,
            );
        }
        m = 0;
    }

    return {
        timeMenuList: timeMenuItems,
        selectedTime: timeMenuItems[0],
    };
}
