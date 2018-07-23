// OFFICIAL RACES FOR GHOST RE-FILL SCRIPT

const tracks = [
    {
        _id: 'FARSEER_TEST',
        name: 'farseer: dev test',
        desc: 'Instant run with 3 checkpoints. Nothing special.',
        sponsor: 'VOID Development',
        type: 'a-b run',
        vehicle: 'ship',
        points: [
            {goal: DGOAL.SURFACE, lat: 23.6426, lon: 153.5391, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'start!'},
            {goal: DGOAL.SURFACE, lat: 23.7291, lon: 153.0292, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'void sponsor: farseer inc.'},
            {goal: DGOAL.SURFACE, lat: 23.6426, lon: 153.5391, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'start!'},
        ]
    },
    {
        _id: 'FARSEER_INC_1',
        name: 'farseer inc. showcase',
        desc: 'Short but still dangerous run around FARSEER INC. Grab your Sidewinder and "hit the gound"! But not literally.',
        sponsor: 'FARSEER Inc.',
        type: 'a-b run',
        vehicle: 'ship',
        points: [
            {goal: DGOAL.SURFACE, lat: 23.6426, lon: 153.5391, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'start!'},
            {goal: DGOAL.SURFACE, lat: 23.7291, lon: 153.0292, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'void sponsor: farseer inc.'},
            {goal: DGOAL.SURFACE, lat: 23.7275, lon: 152.0544, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'jump!'},
            {goal: DGOAL.SURFACE, lat: 24.5424, lon: 151.4123, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'wide flat part'},
            {goal: DGOAL.SURFACE, lat: 25.9920, lon: 151.5381, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'thin part'},
            {goal: DGOAL.SURFACE, lat: 26.1632, lon: 152.7583, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'over the fence!'},
            {goal: DGOAL.SURFACE, lat: 25.7405, lon: 153.1772, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'boring part'},
            {goal: DGOAL.SURFACE, lat: 26.1478, lon: 154.7584, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'boring hole'},
            {goal: DGOAL.SURFACE, lat: 25.0995, lon: 155.6259, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'suddenly right'},
            {goal: DGOAL.SURFACE, lat: 24.4449, lon: 154.3297, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'stay low'},
            {goal: DGOAL.SURFACE, lat: 23.5917, lon: 154.4816, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'hit the wall'},
            {goal: DGOAL.SURFACE, lat: 23.0149, lon: 155.1665, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'hit the wall again'},
            {goal: DGOAL.SURFACE, lat: 22.1640, lon: 154.2140, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'enogh space'},
            {goal: DGOAL.SURFACE, lat: 22.3680, lon: 153.5848, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'almost there!'},
            {goal: DGOAL.SURFACE, lat: 23.5666, lon: 152.5058, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'don\'t fly under the bridge!'},
            {goal: DGOAL.SURFACE, lat: 24.0490, lon: 153.4257, min_alt: 1200, mid_dist: 1.95, body_id: 'deciat@3924:-26:-1513/6 a', name: 'finish!'},
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
