/**
 * @return {boolean}
 */
function LineCircleIntersection(x0, y0, r, // center and radius of circle
                                x1, y1,    // point A
                                x2, y2     // point B
) {
    let q = x0 * x0 + y0 * y0 - r * r;
    let k = -2.0 * x0;
    let l = -2.0 * y0;

    let z = x1 * y2 - x2 * y1;
    let p = y1 - y2;
    let s = x1 - x2;

    let A = s * s + p * p;
    let B = s * s * k + 2.0 * z * p + s * l * p;
    let C = q * s * s + z * z + s * l * z;

    let D = B * B - 4.0 * A * C;

    return D >= 0.0;

}


console.log(
    LineCircleIntersection(
        3, 4, 1, // checkpoint x,y,r
        -1, -1,  // pos 1
        5, 5     // pos 2
    )
);