const svgson = require('svgson');
const fs = require('fs');
const toPolygon = require('svg-path-to-polygons').pathDataToPolys;
const csvtojson = require('csvtojson');

const countryISOMapping = {
    AF: 'AFG',
    AX: 'ALA',
    AL: 'ALB',
    DZ: 'DZA',
    AS: 'ASM',
    AD: 'AND',
    AO: 'AGO',
    AI: 'AIA',
    AQ: 'ATA',
    AG: 'ATG',
    AR: 'ARG',
    AM: 'ARM',
    AW: 'ABW',
    AU: 'AUS',
    AT: 'AUT',
    AZ: 'AZE',
    BS: 'BHS',
    BH: 'BHR',
    BD: 'BGD',
    BB: 'BRB',
    BY: 'BLR',
    BE: 'BEL',
    BZ: 'BLZ',
    BJ: 'BEN',
    BM: 'BMU',
    BT: 'BTN',
    BO: 'BOL',
    BA: 'BIH',
    BW: 'BWA',
    BV: 'BVT',
    BR: 'BRA',
    VG: 'VGB',
    IO: 'IOT',
    BN: 'BRN',
    BG: 'BGR',
    BF: 'BFA',
    BI: 'BDI',
    KH: 'KHM',
    CM: 'CMR',
    CA: 'CAN',
    CV: 'CPV',
    KY: 'CYM',
    CF: 'CAF',
    TD: 'TCD',
    CL: 'CHL',
    CN: 'CHN',
    HK: 'HKG',
    MO: 'MAC',
    CX: 'CXR',
    CC: 'CCK',
    CO: 'COL',
    KM: 'COM',
    CG: 'COG',
    CD: 'COD',
    CK: 'COK',
    CR: 'CRI',
    CI: 'CIV',
    HR: 'HRV',
    CU: 'CUB',
    CY: 'CYP',
    CZ: 'CZE',
    DK: 'DNK',
    DJ: 'DJI',
    DM: 'DMA',
    DO: 'DOM',
    EC: 'ECU',
    EG: 'EGY',
    SV: 'SLV',
    GQ: 'GNQ',
    ER: 'ERI',
    EE: 'EST',
    ET: 'ETH',
    FK: 'FLK',
    FO: 'FRO',
    FJ: 'FJI',
    FI: 'FIN',
    FR: 'FRA',
    GF: 'GUF',
    PF: 'PYF',
    TF: 'ATF',
    GA: 'GAB',
    GM: 'GMB',
    GE: 'GEO',
    DE: 'DEU',
    GH: 'GHA',
    GI: 'GIB',
    GR: 'GRC',
    GL: 'GRL',
    GD: 'GRD',
    GP: 'GLP',
    GU: 'GUM',
    GT: 'GTM',
    GG: 'GGY',
    GN: 'GIN',
    GW: 'GNB',
    GY: 'GUY',
    HT: 'HTI',
    HM: 'HMD',
    VA: 'VAT',
    HN: 'HND',
    HU: 'HUN',
    IS: 'ISL',
    IN: 'IND',
    ID: 'IDN',
    IR: 'IRN',
    IQ: 'IRQ',
    IE: 'IRL',
    IM: 'IMN',
    IL: 'ISR',
    IT: 'ITA',
    JM: 'JAM',
    JP: 'JPN',
    JE: 'JEY',
    JO: 'JOR',
    KZ: 'KAZ',
    KE: 'KEN',
    KI: 'KIR',
    KP: 'PRK',
    KR: 'KOR',
    KW: 'KWT',
    KG: 'KGZ',
    LA: 'LAO',
    LV: 'LVA',
    LB: 'LBN',
    LS: 'LSO',
    LR: 'LBR',
    LY: 'LBY',
    LI: 'LIE',
    LT: 'LTU',
    LU: 'LUX',
    MK: 'MKD',
    MG: 'MDG',
    MW: 'MWI',
    MY: 'MYS',
    MV: 'MDV',
    ML: 'MLI',
    MT: 'MLT',
    MH: 'MHL',
    MQ: 'MTQ',
    MR: 'MRT',
    MU: 'MUS',
    YT: 'MYT',
    MX: 'MEX',
    FM: 'FSM',
    MD: 'MDA',
    MC: 'MCO',
    MN: 'MNG',
    ME: 'MNE',
    MS: 'MSR',
    MA: 'MAR',
    MZ: 'MOZ',
    MM: 'MMR',
    NA: 'NAM',
    NR: 'NRU',
    NP: 'NPL',
    NL: 'NLD',
    AN: 'ANT',
    NC: 'NCL',
    NZ: 'NZL',
    NI: 'NIC',
    NE: 'NER',
    NG: 'NGA',
    NU: 'NIU',
    NF: 'NFK',
    MP: 'MNP',
    NO: 'NOR',
    OM: 'OMN',
    PK: 'PAK',
    PW: 'PLW',
    PS: 'PSE',
    PA: 'PAN',
    PG: 'PNG',
    PY: 'PRY',
    PE: 'PER',
    PH: 'PHL',
    PN: 'PCN',
    PL: 'POL',
    PT: 'PRT',
    PR: 'PRI',
    QA: 'QAT',
    RE: 'REU',
    RO: 'ROU',
    RU: 'RUS',
    RW: 'RWA',
    BL: 'BLM',
    SH: 'SHN',
    KN: 'KNA',
    LC: 'LCA',
    MF: 'MAF',
    PM: 'SPM',
    VC: 'VCT',
    WS: 'WSM',
    SM: 'SMR',
    ST: 'STP',
    SA: 'SAU',
    SN: 'SEN',
    RS: 'SRB',
    SC: 'SYC',
    SL: 'SLE',
    SG: 'SGP',
    SK: 'SVK',
    SI: 'SVN',
    SB: 'SLB',
    SO: 'SOM',
    ZA: 'ZAF',
    GS: 'SGS',
    SS: 'SSD',
    ES: 'ESP',
    LK: 'LKA',
    SD: 'SDN',
    SR: 'SUR',
    SJ: 'SJM',
    SZ: 'SWZ',
    SE: 'SWE',
    CH: 'CHE',
    SY: 'SYR',
    TW: 'TWN',
    TJ: 'TJK',
    TZ: 'TZA',
    TH: 'THA',
    TL: 'TLS',
    TG: 'TGO',
    TK: 'TKL',
    TO: 'TON',
    TT: 'TTO',
    TN: 'TUN',
    TR: 'TUR',
    TM: 'TKM',
    TC: 'TCA',
    TV: 'TUV',
    UG: 'UGA',
    UA: 'UKR',
    AE: 'ARE',
    GB: 'GBR',
    US: 'USA',
    UM: 'UMI',
    UY: 'URY',
    UZ: 'UZB',
    VU: 'VUT',
    VE: 'VEN',
    VN: 'VNM',
    VI: 'VIR',
    WF: 'WLF',
    EH: 'ESH',
    YE: 'YEM',
    ZM: 'ZMB',
    ZW: 'ZWE'
}

let popData, svgData, gdpData, hdiData, alrData, eduData, lifeEx;

csvtojson().fromString(fs.readFileSync('data/population/pop.csv').toString().replace(/,\n/g, '\n')).then((data) => {
    popData = data;
});

csvtojson().fromString(fs.readFileSync('data/life/life.csv').toString().replace(/,\n/g, '\n')).then((data) => {
    lifeEx = data;
});

csvtojson().fromString(fs.readFileSync('data/alr/alr.csv').toString().replace(/,\n/g, '\n')).then((data) => {
    alrData = data;
});

csvtojson().fromString(fs.readFileSync('data/education/edu.csv').toString().replace(/,\n/g, '\n')).then((data) => {
    eduData = data;
});

csvtojson().fromString(fs.readFileSync('data/gdp.csv').toString()).then((data) => {
    gdpData = data;
});

csvtojson().fromString(fs.readFileSync('data/hdi.csv').toString()).then((data) => {
    hdiData = data;
});

svgson.parse(fs.readFileSync('data/world.svg').toString()).then(function(json) {
    svgData = json;
});

function getRegion(id, svg) {
    const data = {outlines: null, name: svg.attributes.title, population: null, gdp: null, id: id, hdi: null, alr: null, edu: null, lifeEx: 0};

    for (const row of popData) {
        if (row['Country Code'] == id) {
            let year = 2017;
            while (row[year.toString()] == '') year -= 1;

            data.population = parseInt(row[year.toString()]);
            break;
        }
    }

    for (const row of alrData) {
        if (row['Country Code'] == id) {
            let year = 2017;
            while (row[year.toString()] == '') year -= 1;

            data.alr = parseFloat(row[year.toString()]);
            break;
        }
    }

    for (const row of lifeEx) {
        if (row['Country Code'] == id) {
            let year = 2017;
            while (row[year.toString()] == '') year -= 1;

            data.lifeEx = parseInt(row[year.toString()]);
            break;
        }
    }

    for (const row of eduData) {
        if (row['Country Code'] == id) {
            let year = 2017;
            while (row[year.toString()] == '') year -= 1;

            data.edu = parseFloat(row[year.toString()]);
            break;
        }
    }

    for (const row of gdpData) {
        if (row['Country Code'] == id) {
            data.gdp = parseInt(row['Value']);
        }
    }

    for (const row of hdiData) {
        if (row['Code'] == id) {
            data.hdi = parseFloat(row['HDI']);
        }
    }

    const polygons = toPolygon(svg.attributes.d);

    for (let pol = 0; pol < polygons.length; pol++) {
        const polygon = polygons[pol];
        const real = [];
        for (const point of polygon) real.push(point[0], point[1]);
        polygons[pol] = real;
    }

    data.outlines = polygons;

    return data;
}

const world = {
    regions: [],
    name: 'Earth'
};

setInterval(() => {
    if (popData == null || gdpData == null || svgData == null || hdiData == null) return;

    for (const region of svgData.children) {
        world.regions.push(getRegion(countryISOMapping[region.attributes.id], region));
    }
    
    fs.writeFileSync('data/maps.js', 'Map.maps.push(new Map(' + JSON.stringify(world, null, 4).replace(/([0-9]),\n\s*/g, '$1,') + '));');

    process.exit();
}, 50);