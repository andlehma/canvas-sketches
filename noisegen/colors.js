const color1 = "000000";
const color2 = "ffffff";

const averageColor = (factor) => {
    const r1 = Number("0x" + color1.substring(0, 2));
    const g1 = Number("0x" + color1.substring(2, 4));
    const b1 = Number("0x" + color1.substring(4, 6));

    const r2 = Number("0x" + color2.substring(0, 2));
    const g2 = Number("0x" + color2.substring(2, 4));
    const b2 = Number("0x" + color2.substring(4, 6));

    const newR = weightedAverage(r1, r2, factor);
    const newG = weightedAverage(g1, g2, factor);
    const newB = weightedAverage(b1, b2, factor);

    return `rgb(${newR}, ${newG}, ${newB})`;
}

const weightedAverage = (a, b, factor) => Math.floor(((a + (a * factor)) + (b + (b * -factor))) / 2);