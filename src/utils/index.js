export const emptyArr = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
]

export const copyMapFun = (original) => {
    const copy = JSON.parse(JSON.stringify(original));
    return copy;
}