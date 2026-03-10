export function isFulfilled<T>(
    result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> {
    return result.status === "fulfilled";
}

export function isDefined<T>(value: T | null | undefined): value is T {
    return value != null;
}

export function getFormattedDate(date: Date) {
    const year = date.getFullYear();
    // getMonth() is 0-indexed, so add 1
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
}


