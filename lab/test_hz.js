/*

Aulin is actually Gliese 572, a K-7 star. A K-7 star has approximately these values (they can vary, so we have to assume the spectral class and I took the average values):

Temperature: ca. 4060 Kelvin (Sun: 5778).
Absolute Magnitude: ca. 8,26929 (Sun: 4,83), that is the luminance of a star in 32,6 Lightyears distance
Radius: 0,641 x Sun = ca. 446136 KM
Mass: 0,606 x Sun = 1,205 x 10^30 Kg

For comparison we take the solar constant of 1367 Watt/m² on earth, our target corridor. How far away must a planet be to have the same solar constant value?

    First, we calculate the luminance of the star using the Boltzmann constant:
    = 4 x Pi x 0,0000000567 x (StarRadiusKM x 1000 ) ^ 2 * (StarTemperatureKelvin ^ 4 )
    = 4 x Pi x 0,0000000567 x (446136 x 1000)^2 x (4060^4)
    = 3,85 x 10^25 Watts (Sun: 3,846 x 10^26)

And now the distance in Astronomical units:
    = Square root of ( 0,25 x ( ( StarluminanceWatts / Pi ) / Solarconstant ) ) / 1 AU in Meters
    = Square root of ( 0,25 x ( ( StarluminanceWatts / Pi ) / 1367 ) ) / 149597870000
    = 0,31659292 AU

Nirvana is 0.22 AU away, so it is "a little bit" closer to its Sun than it should be, but it is actually not the Earth and there is a "This planet has been terraformed" notice, so it could be that it was slightly too hot before. But it is still a good value. And the Aulin star is slightly too hot, it has 4664 Kelvin and therefore the optimum habitable zone is at 0,417797863 and I didn't consider that Nirvana is tidally locked which means: it doesn't rotate which can be bad for the climate (one side is too hot while the other side is too cold = very fast storm speeds.

    If you put in the values of Earth in Sol, Earth has a distance of 1,003802208 AU which is very close to reality. Obviously these are approximate values for main sequence stars and the temperature depends a lot from the composition, the albedo (reflection), greenhouse effect, rotation, clouds, axis tilt and so on. But in general, an earthlike planet should have this distance. Venus for example is closer to sun than Earth and still lies within the habitable zone but due its very high carbon dioxide values, the greenhouse effect is too strong and so it became way too hot for liquid water - Terraforming would be useless here.

    If you want to calculate the values in Excel:
A1: =4*PI()*0,0000000567*(446136*1000)^2*(4060^4)
A2: =SQRT(0,25*((A1/PI())/1367))/149597870000
*/

const AUm = 149597870700;
const sunCons = 1367; // 1367 Watt/m² on earth, our target corridor
const sunRkm = 695700;
const sunMkg = 10 ^ 30;

let temp_kelvin = 4285; // Kelvin (Sun: 5778)
let absm = 6.665985; // Absolute Magnitude : luminance of a star in 32,6 Lightyears distance
let R = 0.7808 * sunRkm;
let M = 0.7383 * sunMkg;

let lumi = 4 * Math.PI * 0.0000000567 * Math.pow((R * 1000), 2) * Math.pow(temp_kelvin, 4);
let hab = Math.sqrt(0.25 * ((lumi / Math.PI) / sunCons)) / AUm;

console.log(hab);


//https://forums.frontier.co.uk/showthread.php/76238-Habitable-Zone-calculations