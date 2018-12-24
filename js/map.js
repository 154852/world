class Map {
    constructor(data) {
        this.regions = [];
        this.name = '[none]';
        this.mode = 0;
        this.bezier = true;

        Utils.addDataTo(this, data, {
            regions: Array,
            name: String
        });

        for (let i = 0; i < this.regions.length; i++) {
            this.regions[i] = new Region(this.regions[i]);
        }
    }

    find(point) {
        for (const region of this.regions) {
            if (region.intersects(point)) return region;
        }

        return null;
    }

    setMode(index) {
        this.mode = index;

        this.refreshGFX();
    }

    refreshGFX() {
        for (const region of this.regions) region.setMode(Map.modes[this.mode], this.bezier);
    }

    getSVG() {
        const regionSVGs = [];
        for (const region of this.regions) regionSVGs.push(region.getSVGPolygon());

        this.setMode(0);

        return Utils.createComplexElement(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), {
            class: ['region-svg'],
            children: regionSVGs,
            attr: {
                'width': '1009',
                'height': '665',
                'viewBox': '0 0 1009 665',
                'preserveAspectRatio': 'xMidYMid meet'
            }
        });
    }
}
Map.maps = [];
Map.modes = [
    {
        name: 'Population',
        color: [[214, 234, 248], [46, 134, 193]],
        change: (x, b) => x.population == null? null:(b? Math.bezier(
            x.population / 1400000000,
            {x: 0, y: 0},
            {x: 0.16, y: 1.06},
            {x: 0.58, y: 0.89},
            {x: 1, y: 1}
        ).y:x.population / 1400000000)
    }, {
        name: 'GDP',
        color: [[232, 218, 239], [142, 68, 173]],
        change: (x, b) => x.gdp == null? null:(b? Math.bezier(
            x.gdp / 20000000000000,
            {x: 0, y: 0},
            {x: 0, y: 1.22},
            {x: 0.12, y: 0.67},
            {x: 1, y: 1}
        ).y:x.gdp / 20000000000000)
    }, {
        name: 'GDP Per Capita',
        color: [[208, 236, 231], [22, 160, 133]],
        change: (x, b) => (x.gdp == null || x.population == null)? null:(b? Math.bezier(
            x.GDPPerCapita() / 150000,
            {x: 0, y: 0},
            {x: 0.0, y: 1},
            {x: 0, y: 1},
            {x: 1, y: 1}
        ).y:x.GDPPerCapita() / 150000)
    }, {
        name: 'HDI',
        color: [[248, 187, 208], [233, 30, 99]],
        change: (x) => x.hdi == null? null:x.hdi ** 2
    }, {
        name: 'Adult Literacy Rate',
        color: [[200, 230, 201], [76, 175, 80]],
        change: (x) => x.alr == null? null:x.alr / 100
    }, {
        name: 'Primary School Education',
        color: [[212, 230, 241], [84, 153, 199]],
        change: (x, b) => x.edu == null? null:(b? Math.bezier(
            x.edu / 100,
            {x: 0, y: 0},
            {x: 0.04, y: 0.58},
            {x: 0.46, y: 0.22},
            {x: 1, y: 1}
        ).y:x.edu / 100)
    }, {
        name: 'Life Expectancy',
        color: [[246, 221, 204], [211, 84, 0]],
        change: (x, b) => x.lifeEx == null? null:(b? Math.bezier(
            (x.lifeEx - 30) / 70,
            {x: 0, y: 0},
            {x: 0, y: 0},
            {x: 0, y: 0.85},
            {x: 1, y: 1}
        ).y:((x.lifeEx - 30) / 70))
    }, {
        name: 'Population Density',
        color: [[252, 243, 207], [241, 196, 15]],
        change: (x, b) => (x.population == null || x.area == null)? null:(b? Math.bezier(
            x.populationDensity() * 0.003,
            {x: 0, y: 0},
            {x: 0, y: 1},
            {x: 0, y: 1},
            {x: 1, y: 1}
        ).y:x.populationDensity() * 0.003)
    }, {
        name: 'Land Area',
        color: [[235, 222, 240], [155, 89, 182]],
        change: (x) => x.area == null? null:x.area / 17000000
    }, {
        name: 'GDP Growth',
        color: [[250, 219, 216], [231, 76, 60]],
        change: (x, b) => x.growth == null? null:(b? Math.bezier(
            (x.growth + 3) / 30,
            {x: 0, y: 0},
            {x: 0, y: 1},
            {x: 0, y: 1},
            {x: 1, y: 1}
        ).y:(x.growth + 3) / 30)
    }, {
        name: 'Pollution',
        color: [[215, 204, 200], [93, 64, 55]],
        change: (x, b) => x.pollution == null? null:(b? Math.bezier(
            x.pollution / 100,
            {x: 0, y: 0},
            {x: 0, y: 0.71},
            {x: 1, y: 0},
            {x: 1, y: 1}
        ).y:x.pollution / 100)
    }
]

class Region {
    constructor(data) {
        this.outlines = [];
        this.cities = [];        
        this.name = '[none]';
        this.element = null;
        this.population = null;
        this.gdp = null;
        this.id = null;
        this.hdi = null;
        this.alr = null;
        this.edu = null;
        this.lifeEx = null;
        this.colorOffset = 0;
        this.area = null;
        this.growth = null;
        this.pollution = null;

        this.color = [0, 0, 0];

        Utils.addDataTo(this, data, {
            outlines: Array,
            cities: Array, 
            name: String,
            population: Number,
            gdp: Number,
            id: String,
            hdi: Number,
            alr: Number,
            edu: Number,
            lifeEx: Number,
            area: Number,
            growth: Number,
            pollution: Number
        });

        const outlinesVectors = [];
        for (let i = 0; i < this.outlines.length; i++) {
            const outline = [];

            for (let j = 0; j < this.outlines[i].length; j += 2) {
                outline.push(new Utils.Vector(this.outlines[i][j], this.outlines[i][j + 1]));
            }

            outlinesVectors.push(outline);
        }

        this.outlines = outlinesVectors; 
    }

    getSVGPolygon() {
        this.element = Utils.createComplexElement(document.createElementNS('http://www.w3.org/2000/svg', 'g'), {
            class: ['region']
        });

        for (const outline of this.outlines) {
            let points = '';
            for (let vector of outline) points += vector.x + ',' + vector.y + ' ';

            Utils.createComplexElement(document.createElementNS('http://www.w3.org/2000/svg', 'polygon'), {
                attr: {
                    points: points.trim()
                },
                parent: this.element
            });
        }

        this.element.style.stroke = 'rgba(125, 125, 125, 0.2)';

        return this.element;
    }

    box() {
        const box = {top: 0, left: Infinity, right: 0, bottom: Infinity, width: 0, height: 0};

        for (const outline of this.outlines) {
            for (const vector of outline) {
                if (vector.x < box.left) box.left = vector.x;
                if (vector.x > box.right) box.right = vector.x;

                if (vector.y < box.bottom) box.bottom = vector.y;
                if (vector.y > box.top) box.top = vector.y;
            }
        }

        box.width = box.right - box.left;
        box.height = box.top - box.bottom;

        return box;
    }

    getLoneSVG() {
        const box = this.box();

        const clone = this.element.cloneNode(true);

        clone.css('fill', 'white');
        clone.css('stroke', 'lightgray');

        return Utils.createComplexElement(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), {
            children: [clone],
            attr: {
                'width': box.width,
                'height': box.height,
                'viewBox': [box.left, box.bottom, box.width, box.height],
                'preserveAspectRatio': 'xMidYMid meet'
            }
        });
    }

    intersectsSingle(index, point) {
        let vs = this.outlines[index];

        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            let xi = vs[i].x, yi = vs[i].y;
            let xj = vs[j].x, yj = vs[j].y;
    
            let intersect = ((yi > point.y) != (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
                
            if (intersect) inside = !inside;
        }
    
        return inside;
    }

    intersects(point) {
        for (let i = 0; i < this.outlines.length; i++) {
            if (this.intersectsSingle(i, point)) return true;
        }

        return false;
    }

    hoverOn() {
        this.colorOffset = 30;

        this.updateColor();
    }

    hoverOff() {
        this.colorOffset = 0;

        this.updateColor(); 
    }

    updateColor() {
        this.element.style.fill = 'rgb(' + (this.color[0] + this.colorOffset) + ',' + (this.color[1] + this.colorOffset) + ',' + (this.color[2] + this.colorOffset) + ')';
    }

    setColor(color) {
        this.color = [parseInt(color[0]), parseInt(color[1]), parseInt(color[2])];
        this.updateColor();
    }

    GDPPerCapita() {
        return this.gdp / this.population;
    }

    populationDensity() {
        return this.population / this.area;
    }

    setMode(mode, bezier) {
        const value = mode.change(this, bezier);

        let color;
        if (value != null) {
            color = [
                mode.color[0][0] + ((mode.color[1][0] - mode.color[0][0]) * value),
                mode.color[0][1] + ((mode.color[1][1] - mode.color[0][1]) * value),
                mode.color[0][2] + ((mode.color[1][2] - mode.color[0][2]) * value)
            ];
        } else {
            color = [200, 200, 200];
        }

        this.setColor(color);
    }
}