hashCode = function (s) {
    return (s.split("").reduce(function (a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a
    }, 0) + 2147483647) + 1;
};


let sys_pos = [-68.4375, 26, 26.46875];
let A, B;

let name = 'Amarak';

console.log('SYS:', name, sys_pos);
console.log('...stringify');
console.log('ID v1 :', name + '@' + sys_pos.map(x => x.toFixed(3)).join(':'));
console.log('...round( x * 32 )');
console.log('ID v2 :', name + '@' + sys_pos.map(x => Math.round(x * 32)).join(':'));
console.log('...and hash');
console.log('ID v3 :', hashCode(name + '@' + sys_pos.map(x => Math.round(x * 32)).join(':')));


// DOT!


const dot = require('dot-object');

const scan = JSON.parse(`{
    "_id" : "Location/2018-02-18T20:19:08Z",
        "timestamp" : "2018-02-18T20:19:08.000Z",
        "event" : "Location",
        "Docked" : true,
        "StationName" : "Vela Port",
        "StationType" : "Coriolis",
        "StarSystem" : "Amarak",
        "StarPos" : [
        -68.438,
        26,
        26.469
    ],
        "SystemAllegiance" : "Federation",
        "SystemEconomy" : "$economy_HighTech;",
        "SystemEconomy_Localised" : "Высокие технологии",
        "SystemGovernment" : "$government_Corporate;",
        "SystemGovernment_Localised" : "Корпоративная",
        "SystemSecurity" : "$SYSTEM_SECURITY_high;",
        "SystemSecurity_Localised" : "Высок. ур. безопасности",
        "Population" : 10248421,
        "Body" : "Vela Port",
        "BodyType" : "Station",
        "Factions" : [
        {
            "Name" : "Pilots Federation Local Branch",
            "FactionState" : "None",
            "Government" : "Democracy",
            "Influence" : 0,
            "Allegiance" : "PilotsFederation"
        },
        {
            "Name" : "Tarutaalli Group",
            "FactionState" : "None",
            "Government" : "Corporate",
            "Influence" : 0.051,
            "Allegiance" : "Federation",
            "PendingStates" : [
                {
                    "State" : "Boom",
                    "Trend" : 1
                }
            ]
        },
        {
            "Name" : "Amarak Comms Partners",
            "FactionState" : "Boom",
            "Government" : "Corporate",
            "Influence" : 0.442,
            "Allegiance" : "Federation"
        },
        {
            "Name" : "Amarak Dominion",
            "FactionState" : "CivilWar",
            "Government" : "Dictatorship",
            "Influence" : 0.05,
            "Allegiance" : "Independent"
        },
        {
            "Name" : "Amarak Silver Family",
            "FactionState" : "Boom",
            "Government" : "Anarchy",
            "Influence" : 0.037,
            "Allegiance" : "Independent"
        },
        {
            "Name" : "Syndicate of LHS 3385",
            "FactionState" : "Retreat",
            "Government" : "Anarchy",
            "Influence" : 0.048,
            "Allegiance" : "Independent"
        },
        {
            "Name" : "Amarak Republic Party",
            "FactionState" : "Boom",
            "Government" : "Democracy",
            "Influence" : 0.333,
            "Allegiance" : "Federation"
        },
        {
            "Name" : "Ronin of Amarak",
            "FactionState" : "CivilWar",
            "Government" : "Anarchy",
            "Influence" : 0.039,
            "Allegiance" : "Independent",
            "PendingStates" : [
                {
                    "State" : "Boom",
                    "Trend" : 0
                }
            ]
        }
    ],
        "SystemFaction" : "   Amarak Comms Partners   ",
        "FactionState" : "Boom",
        "_gv" : "2.4"
}`);


let res = {};

let traslate = {
    'StarSystem': 'name',
    'StarPos.0': 'pos.0',
    'StarPos.1': 'pos.1',
    'StarPos.2': 'pos.2',
    'SystemSecurity': 'security',
    'SystemAllegiance': 'allegiance',
    'SystemGovernment': 'gov',
    'SystemFaction': 'faction',
    'FactionState': 'state',
    'Population': 'population',
};


for (let i in traslate) {
    // what about modifiers on fly ?

    dot.copy(i, traslate[i], scan, res);
}

scan.StarPos[0] = 9999999;


console.log(res);