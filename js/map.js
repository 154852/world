class Map {
    constructor(data) {
        this.regions = [];
        this.name = '[none]';
        this.mode = 0;

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

        for (const region of this.regions) region.setMode(Map.modes[this.mode]);
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
        change: (x) => x.population == null? null:Math.bezier(
            x.population / 1400000000,
            {x: 0, y: 0},
            {x: 0.16, y: 1.06},
            {x: 0.58, y: 0.89},
            {x: 1, y: 1}
        ).y
    }, {
        name: 'GDP',
        color: [[232, 218, 239], [142, 68, 173]],
        change: (x) => x.gdp == null? null:Math.bezier(
            x.gdp / 20000000000000,
            {x: 0, y: 0},
            {x: 0.0, y: 1},
            {x: 0, y: 1},
            {x: 1, y: 1}
        ).y
    }, {
        name: 'GDP Per Capita',
        color: [[208, 236, 231], [22, 160, 133]],
        change: (x) => (x.gdp == null || x.population == null)? null:Math.bezier(
            x.GDPPerCapita() / 150000,
            {x: 0, y: 0},
            {x: 0.0, y: 1},
            {x: 0, y: 1},
            {x: 1, y: 1}
        ).y
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
        change: (x) => x.edu == null? null:Math.bezier(
            x.edu / 100,
            {x: 0, y: 0},
            {x: 0.04, y: 0.58},
            {x: 0.46, y: 0.22},
            {x: 1, y: 1}
        ).y
    }, {
        name: 'Life Expectancy',
        color: [[246, 221, 204], [211, 84, 0]],
        change: (x) => x.lifeEx == null? null:(x.lifeEx - 40) / 60
    }
]

class Region {
    constructor(data) {
        this.outlines = [];
        this.cities = [];        
        this.name = '[none]';
        this.element = null;
        this.population = 0;
        this.gdp = 0;
        this.id = null;
        this.hdi = 0;
        this.alr = 0;
        this.edu = 0;
        this.lifeEx = 0;

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
            lifeEx: Number
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

        return this.element;
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
        this.color[0] += 30;
        this.color[1] += 30;
        this.color[2] += 30;

        this.updateColor();
    }

    hoverOff() {
        this.color[0] -= 30;
        this.color[1] -= 30;
        this.color[2] -= 30;

        this.updateColor();
    }

    updateColor() {
        this.element.style.fill = 'rgb(' + this.color[0] + ',' + this.color[1] + ',' + this.color[2] + ')';
        this.element.style.stroke = 'rgb(' + (this.color[0] - 30) + ',' + (this.color[1] - 30) + ',' + (this.color[2] - 30) + ')';
    }

    setColor(color) {
        this.color = [parseInt(color[0]), parseInt(color[1]), parseInt(color[2])];
        this.updateColor();
    }

    singleArea(index) {
        const vertices = this.outlines[index];

        var total = 0;
    
        for (var i = 0, l = vertices.length; i < l; i++) {
            var addX = vertices[i].x;
            var addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
            var subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
            var subY = vertices[i].y;
    
            total += (addX * addY * 0.5);
            total -= (subX * subY * 0.5);
        }
    
        return Math.abs(total);
    }

    landMass() {
        const total = 0;
        for (let i = 0; i < this.outlines.length; i++) total += this.singleArea(i);

        return total;
    }

    GDPPerCapita() {
        return this.gdp / this.population;
    }

    setMode(mode) {
        const value = mode.change(this);
        if (this.id == 'ISL') console.log(value)

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