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
    }
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
