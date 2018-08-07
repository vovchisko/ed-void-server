// OFFICIAL RACES FOR GHOST RE-FILL SCRIPT

const tracks = [
    {
        _id: 'FARSEER_INC_SHOWCASE_1',
        name: 'farseer inc. showcase',
        desc: 'Short but still dangerous run around FARSEER INC. Grab your Sidewinder and "hit the road"! But... not literally.',
        sponsor: 'FARSEER Inc., Void Development',
        type: 'a-b run',
        vehicle: 'ship',
        points: [
            {goal: DGOAL.SURFACE, lat: 23.6426, lon: 153.5391, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'start!'},
            {goal: DGOAL.SURFACE, lat: 23.7291, lon: 153.0292, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'void sponsor: farseer inc.'},
            {goal: DGOAL.SURFACE, lat: 23.7275, lon: 152.0544, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'jump!'},
            {goal: DGOAL.SURFACE, lat: 24.5424, lon: 151.4123, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'wide flat part'},
            {goal: DGOAL.SURFACE, lat: 25.9920, lon: 151.5381, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'thin part'},
            {goal: DGOAL.SURFACE, lat: 26.1632, lon: 152.7583, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'over the fence!'},
            {goal: DGOAL.SURFACE, lat: 25.7405, lon: 153.1772, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'boring part'},
            {goal: DGOAL.SURFACE, lat: 26.1478, lon: 154.7584, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'boring hole'},
            {goal: DGOAL.SURFACE, lat: 25.0995, lon: 155.6259, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'suddenly right'},
            {goal: DGOAL.SURFACE, lat: 24.4449, lon: 154.3297, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'stay low'},
            {goal: DGOAL.SURFACE, lat: 23.5917, lon: 154.4816, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'hit the wall'},
            {goal: DGOAL.SURFACE, lat: 23.0149, lon: 155.1665, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'hit the wall again'},
            {goal: DGOAL.SURFACE, lat: 22.1640, lon: 154.2140, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'enogh space'},
            {goal: DGOAL.SURFACE, lat: 22.3680, lon: 153.5848, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'careful there'},
            {goal: DGOAL.SURFACE, lat: 23.5666, lon: 152.5058, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'don\'t fly under the bridge!'},
            {goal: DGOAL.SURFACE, lat: 24.0490, lon: 153.4257, min_alt: 1200, min_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'keep pushing!'},
        ]
    },
    {
        _id: 'FARSEER_INC_SHOWCASE_2',
        name: 'Farseer inc. Showcase 2',
        desc: 'FARSEER INC. Grab your SRV and hit the road! It`s gonna be funny!',
        sponsor: 'FARSEER Inc., Void Development',
        type: 'a-b run',
        vehicle: 'srv',
        points: [
            {goal: DGOAL.SURFACE, lat: 23.6417, lon: 153.0613, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'start!'},
            {goal: DGOAL.SURFACE, lat: 23.7169, lon: 153.0878, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'check 2'},
            {goal: DGOAL.SURFACE, lat: 23.7639, lon: 153.0567, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'check 3'},
            {goal: DGOAL.SURFACE, lat: 23.7665, lon: 152.9998, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'check 4'},
            {goal: DGOAL.SURFACE, lat: 23.7691, lon: 152.9725, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'check 5'},
            {goal: DGOAL.SURFACE, lat: 23.7449, lon: 152.9619, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'check 6'},
            {goal: DGOAL.SURFACE, lat: 23.6700, lon: 152.9888, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'check 7'},
            {goal: DGOAL.SURFACE, lat: 23.6429, lon: 153.0719, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'lash check'},
        ]
    },
    {
        _id: 'FARSEER_INC_SHOWCASE_3',
        name: 'Farseer inc. Showcase 3',
        desc: 'Just like Showcase 2, but with 3 laps. Grab your SRV and hit the road! It`s gonna be funny!',
        sponsor: 'FARSEER Inc., Void Development',
        type: 'a-b run',
        vehicle: 'srv',
        points: [
            {goal: DGOAL.SURFACE, lat: 23.6417, lon: 153.0613, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'start!'},
            {goal: DGOAL.SURFACE, lat: 23.7169, lon: 153.0878, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'lap 1'},
            {goal: DGOAL.SURFACE, lat: 23.7639, lon: 153.0567, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'go go go'},
            {goal: DGOAL.SURFACE, lat: 23.7665, lon: 152.9998, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'eeeeeeee'},
            {goal: DGOAL.SURFACE, lat: 23.7691, lon: 152.9725, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'cops!'},
            {goal: DGOAL.SURFACE, lat: 23.7449, lon: 152.9619, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'pew-pew!'},
            {goal: DGOAL.SURFACE, lat: 23.6700, lon: 152.9888, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'almost there!'},

            {goal: DGOAL.SURFACE, lat: 23.6417, lon: 153.0613, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'almost there'},
            {goal: DGOAL.SURFACE, lat: 23.7169, lon: 153.0878, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'lap 2'},
            {goal: DGOAL.SURFACE, lat: 23.7639, lon: 153.0567, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'go go go'},
            {goal: DGOAL.SURFACE, lat: 23.7665, lon: 152.9998, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'eeeeeeee'},
            {goal: DGOAL.SURFACE, lat: 23.7691, lon: 152.9725, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'cops!'},
            {goal: DGOAL.SURFACE, lat: 23.7449, lon: 152.9619, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'pew-pew!'},
            {goal: DGOAL.SURFACE, lat: 23.6700, lon: 152.9888, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'almost there!'},

            {goal: DGOAL.SURFACE, lat: 23.6417, lon: 153.0613, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'almost there'},
            {goal: DGOAL.SURFACE, lat: 23.7169, lon: 153.0878, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'lap 3'},
            {goal: DGOAL.SURFACE, lat: 23.7639, lon: 153.0567, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'go go go'},
            {goal: DGOAL.SURFACE, lat: 23.7665, lon: 152.9998, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'eeeeeeee'},
            {goal: DGOAL.SURFACE, lat: 23.7691, lon: 152.9725, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'cops!'},
            {goal: DGOAL.SURFACE, lat: 23.7449, lon: 152.9619, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'pew-pew!'},
            {goal: DGOAL.SURFACE, lat: 23.6700, lon: 152.9888, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'almost there!'},

            {goal: DGOAL.SURFACE, lat: 23.6429, lon: 153.0719, min_alt: 45, min_dist: 0.08, body_id: 'deciat@3924:-26:-1513/6 a', name: 'you can do it!'},
        ]
    },
    {
        _id: 'POMECHE_EPIC_RUN',
        name: 'Pomeche Free Fall',
        desc: 'Nice place do die horribly. Epic mountain range on Pomeche 2 c.',
        sponsor: 'Void Development',
        type: 'a-b run',
        vehicle: 'ship',
        points: [
            {goal: DGOAL.SURFACE, lat: 24.9288, lon: 27.8948, min_alt: 2000, min_dist: 2.00, body_id: 'pomeche@1813:2627:99/2 c', name: 'start!'},
            {goal: DGOAL.SURFACE, lat: 25.0477, lon: 26.8912, min_alt: 2000, min_dist: 2.00, body_id: 'pomeche@1813:2627:99/2 c', name: 'we all born to die'},
            {goal: DGOAL.SURFACE, lat: 25.0670, lon: 26.3287, min_alt: 2000, min_dist: 2.00, body_id: 'pomeche@1813:2627:99/2 c', name: 'weeeeee!'},
            {goal: DGOAL.SURFACE, lat: 25.0876, lon: 26.2012, min_alt: 2000, min_dist: 2.00, body_id: 'pomeche@1813:2627:99/2 c', name: 'carefull there!'},
            {goal: DGOAL.SURFACE, lat: 25.1613, lon: 25.6812, min_alt: 2000, min_dist: 2.00, body_id: 'pomeche@1813:2627:99/2 c', name: 'eeeeeeee!'},
            {goal: DGOAL.SURFACE, lat: 25.2089, lon: 24.6840, min_alt: 2000, min_dist: 2.00, body_id: 'pomeche@1813:2627:99/2 c', name: 'that little mountain'},
            {goal: DGOAL.SURFACE, lat: 25.1937, lon: 23.4056, min_alt: 2000, min_dist: 2.00, body_id: 'pomeche@1813:2627:99/2 c', name: 'up! up! up!'},
            {goal: DGOAL.SURFACE, lat: 25.4176, lon: 22.7175, min_alt: 2000, min_dist: 2.00, body_id: 'pomeche@1813:2627:99/2 c', name: 'on top of the world!'},
        ]
    },
    {
        _id: 'INOVIK_A2A_CIRCLE',
        name: 'Inovik A 2 A - Circle',
        desc: 'Good track for professional dangerous races.',
        sponsor: 'Void Development',
        type: 'a-b run',
        vehicle: 'ship',
        points: [
            {goal: DGOAL.SURFACE, lat: -39.2162, lon: 71.6840, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'start!'},
            {goal: DGOAL.SURFACE, lat: -39.6210, lon: 71.9538, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 1'},
            {goal: DGOAL.SURFACE, lat: -39.9994, lon: 72.2741, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 2'},
            {goal: DGOAL.SURFACE, lat: -40.2983, lon: 72.4089, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 3'},
            {goal: DGOAL.SURFACE, lat: -40.5192, lon: 72.2921, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 4'},
            {goal: DGOAL.SURFACE, lat: -40.3976, lon: 71.9239, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 5'},
            {goal: DGOAL.SURFACE, lat: -39.7679, lon: 71.4656, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 6'},
            {goal: DGOAL.SURFACE, lat: -40.0313, lon: 71.0251, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 7'},
            {goal: DGOAL.SURFACE, lat: -40.4674, lon: 70.6119, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 8'},
            {goal: DGOAL.SURFACE, lat: -40.8098, lon: 71.2180, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 9'},
            {goal: DGOAL.SURFACE, lat: -40.8400, lon: 71.7337, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 10'},
            {goal: DGOAL.SURFACE, lat: -40.6676, lon: 71.9351, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 11'},
            {goal: DGOAL.SURFACE, lat: -40.2025, lon: 71.6549, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 12'},
            {goal: DGOAL.SURFACE, lat: -39.6940, lon: 71.4308, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 13'},
            {goal: DGOAL.SURFACE, lat: -39.7636, lon: 71.7251, min_alt: 1000, min_dist: 2.00, body_id: 'inovik@1890:-485:-181/a 2 a', name: 'check 14'},
        ]
    },
    {
        _id: 'KIVAH_A2_ODONEL_EXCHANGE',
        name: 'O`Donel Exhange Run',
        desc: 'Exhausting SRV run for professional and dangerous races on the planet with 1.4G',
        sponsor: 'Void Development',
        type: 'a-b run',
        vehicle: 'SRV',
        points: [
            {goal: DGOAL.SURFACE, lat: -28.1848, lon: -14.2108, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'start!'},
            {goal: DGOAL.SURFACE, lat: -28.1834, lon: -14.2143, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'drag!'},
            {goal: DGOAL.SURFACE, lat: -28.1822, lon: -14.2139, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'drift right!'},
            {goal: DGOAL.SURFACE, lat: -28.1824, lon: -14.2150, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'left'},
            {goal: DGOAL.SURFACE, lat: -28.1831, lon: -14.2159, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'storage yard aplpha'},
            {goal: DGOAL.SURFACE, lat: -28.1823, lon: -14.2178, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'corner - keep clear!'},
            {goal: DGOAL.SURFACE, lat: -28.1807, lon: -14.2155, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'egres means exit'},
            {goal: DGOAL.SURFACE, lat: -28.1781, lon: -14.2173, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'left to large pad'},
            {goal: DGOAL.SURFACE, lat: -28.1752, lon: -14.2199, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'run with obstacles'},
            {goal: DGOAL.SURFACE, lat: -28.1738, lon: -14.2187, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'right and keep clear'},
            {goal: DGOAL.SURFACE, lat: -28.1754, lon: -14.2165, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'another exit on left'},
            {goal: DGOAL.SURFACE, lat: -28.1745, lon: -14.2134, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'central yard'},
            {goal: DGOAL.SURFACE, lat: -28.1752, lon: -14.2125, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'shopping time!'},
            {goal: DGOAL.SURFACE, lat: -28.1766, lon: -14.2130, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'wo wow!'},
            {goal: DGOAL.SURFACE, lat: -28.1776, lon: -14.2127, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'look! drones everywhere'},
            {goal: DGOAL.SURFACE, lat: -28.1785, lon: -14.2126, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'nothing interesting here'},
            {goal: DGOAL.SURFACE, lat: -28.1794, lon: -14.2122, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'prepear to drag'},
            {goal: DGOAL.SURFACE, lat: -28.1799, lon: -14.2109, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'drift left'},
            {goal: DGOAL.SURFACE, lat: -28.1761, lon: -14.2088, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'unstopable!!!'},
            {goal: DGOAL.SURFACE, lat: -28.1734, lon: -14.2085, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'dusty corner'},
            {goal: DGOAL.SURFACE, lat: -28.1710, lon: -14.2102, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'small pad'},
            {goal: DGOAL.SURFACE, lat: -28.1682, lon: -14.2132, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'mad max stye!'},
            {goal: DGOAL.SURFACE, lat: -28.1646, lon: -14.2073, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'anti-aircraft platform'},
            {goal: DGOAL.SURFACE, lat: -28.1679, lon: -14.2066, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'what a huge radar!'},
            {goal: DGOAL.SURFACE, lat: -28.1693, lon: -14.2054, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'medium pad'},
            {goal: DGOAL.SURFACE, lat: -28.1694, lon: -14.2035, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'corner'},
            {goal: DGOAL.SURFACE, lat: -28.1731, lon: -14.2034, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'woooosh to another corner!'},
            {goal: DGOAL.SURFACE, lat: -28.1733, lon: -14.2054, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'to the gate!'},
            {goal: DGOAL.SURFACE, lat: -28.1747, lon: -14.2054, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'second pad'},
            {goal: DGOAL.SURFACE, lat: -28.1748, lon: -14.2035, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'left to the corner'},
            {goal: DGOAL.SURFACE, lat: -28.1780, lon: -14.2035, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'yes, next corner, again'},
            {goal: DGOAL.SURFACE, lat: -28.1783, lon: -14.2055, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'to the gate'},
            {goal: DGOAL.SURFACE, lat: -28.1833, lon: -14.2054, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'second run with obstacles'},
            {goal: DGOAL.SURFACE, lat: -28.1840, lon: -14.2064, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'to the storage yard'},
            {goal: DGOAL.SURFACE, lat: -28.1861, lon: -14.2054, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'what\'s in the corner?'},
            {goal: DGOAL.SURFACE, lat: -28.1862, lon: -14.2077, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'maybe another corner...'},
            {goal: DGOAL.SURFACE, lat: -28.1851, lon: -14.2088, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'egres'},
            {goal: DGOAL.SURFACE, lat: -28.1848, lon: -14.2108, min_alt: 20, min_dist: 0.08, body_id: 'kivah@2690:41:356/a 2', name: 'almost there!'},
        ]
    },
    {
        _id: 'CCN_COLONIA_7AA',
        name: 'Colonia Nebula Canyon Race',
        desc: 'Track for Colona Sitizens by CCN',
        sponsor: 'Colonia Citizens Network',
        type: 'a-b run',
        vehicle: 'ship',
        points: [
            {goal: DGOAL.SURFACE, lat: 43.6009, lon: -85.3007, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP0: Start'},
            {goal: DGOAL.SURFACE, lat: 43.8863, lon: -85.0847, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP1'},
            {goal: DGOAL.SURFACE, lat: 44.1154, lon: -84.8699, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP2'},
            {goal: DGOAL.SURFACE, lat: 44.1148, lon: -83.6137, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP3'},
            {goal: DGOAL.SURFACE, lat: 43.6514, lon: -82.9699, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP4'},
            {goal: DGOAL.SURFACE, lat: 43.3464, lon: -82.7731, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP5'},
            {goal: DGOAL.SURFACE, lat: 42.8335, lon: -82.5161, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP6'},
            {goal: DGOAL.SURFACE, lat: 42.5359, lon: -80.8679, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP7: Mount Faceplant'},
            {goal: DGOAL.SURFACE, lat: 42.7291, lon: -80.7014, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP8'},
            {goal: DGOAL.SURFACE, lat: 42.7565, lon: -80.5020, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP9'},
            {goal: DGOAL.SURFACE, lat: 42.5537, lon: -80.1258, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP10'},
            {goal: DGOAL.SURFACE, lat: 42.2250, lon: -79.6939, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP11'},
            {goal: DGOAL.SURFACE, lat: 42.2612, lon: -79.2985, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP12: Zeprow\'s Slalom'},
            {goal: DGOAL.SURFACE, lat: 42.1257, lon: -79.0821, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP13'},
            {goal: DGOAL.SURFACE, lat: 42.7144, lon: -78.7053, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP14'},
            {goal: DGOAL.SURFACE, lat: 42.8536, lon: -78.1248, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP15'},
            {goal: DGOAL.SURFACE, lat: 42.9006, lon: -77.3947, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP16'},
            {goal: DGOAL.SURFACE, lat: 42.8943, lon: -77.0421, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP17'},
            {goal: DGOAL.SURFACE, lat: 42.6107, lon: -76.7923, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP18'},
            {goal: DGOAL.SURFACE, lat: 42.4637, lon: -77.3920, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP19'},
            {goal: DGOAL.SURFACE, lat: 42.3006, lon: -77.7760, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP20'},
            {goal: DGOAL.SURFACE, lat: 41.4680, lon: -77.2588, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP21'},
            {goal: DGOAL.SURFACE, lat: 41.2691, lon: -76.3079, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP22'},
            {goal: DGOAL.SURFACE, lat: 41.0543, lon: -76.0780, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP23'},
            {goal: DGOAL.SURFACE, lat: 41.0325, lon: -75.6650, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP24'},
            {goal: DGOAL.SURFACE, lat: 40.5731, lon: -74.8879, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP25'},
            {goal: DGOAL.SURFACE, lat: 40.3385, lon: -74.6942, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP26'},
            {goal: DGOAL.SURFACE, lat: 40.3199, lon: -74.6241, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP27'},
            {goal: DGOAL.SURFACE, lat: 40.2550, lon: -74.5609, min_alt: 1500, min_dist: 2.00, body_id: 'colonia@-304976:-29129:633860/7 a a', name: 'WP28: Putin\'s Revenge'},
        ]
    },

];

module.exports.tracks = tracks;


/*
 track should have:

 1 - name

 2 - descriptions
   - sponsors
   - short text description
   - track summary (generated from checkpoints)

 3 - checkpoints with position/body/coords + flags to track rule-breaking (like using wrong vehicle)

 4 - version (just like 1.0.3)

 5 - submited: cmdr_name / cmdr_id

 6 - Nominal time (avg. time for sidewinder)

 7 - counters:
   - finished
   - destroyed
   - leave
   - disqualified
   - total

  */
