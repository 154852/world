const Utils = {};

Utils.createComplexElement = function(type, data, callback) {
    const element = type.constructor == String? document.createElement(type):type;

    if (data == null) return element;

    if ('html' in data) {
        element.innerHTML = data.html;
    }

    if ('text' in data) {
        element.innerHTML = data.text;
    }

    if ('parent' in data) {
        data.parent.appendChild(element);
    }

    if ('id' in data) {
        element.id = data.id;
    }

    if ('children' in data) {
        if (data.children.constructor.name == 'Array') {
            for (const child of data.children) element.appendChild(child)
        } else element.appendChild(data.children);
    }

    if ('class' in data) {
        if (data['class'].constructor == Array) {
            for (const className of data['class']) element.classList.add(className)
        } else element.className = data['class'];
    }

    if ('attr' in data) {
        for (const key in data.attr) {
            element.setAttribute(key, data.attr[key]);
        }
    }

    if ('listeners' in data) {
        for (const item in data.listeners) {
            element.addEventListener(item, data.listeners[item]);
        }
    }

    if ('css' in data) {
        var string = '';
        for (const item in data.css) {
            string += item + ':' + data.css[item] + ';';
        }
        element.setAttribute('style', (element.hasAttribute('style')? element.getAttribute('style'):'') + string);
    }

    if (callback != null) callback.call(element);

    return element;
}

Utils.addDataTo = function(object, data, keys) {
    for (const key in data) {
        if (!(key in keys) || (data[key] != null && data[key].constructor != keys[key])) {
            console.warn('Unaccepted key \'' + key + '\': ' + JSON.stringify(data));
            delete keys[key];
        } else {
            object[key] = data[key];
        }
    }

    return object;
}

Utils.Vector = class {
    constructor(x, y) {
        this.x = x? x:0;
        this.y = y? y:0;
    }

    distanceToSquared(point) {
        point = Utils.Vector.getPoint(point);

        return ((point.x - this.x) ** 2) + ((point.y - this.y) ** 2);
    }

    distanceTo(point) {
        return Math.sqrt(this.distanceToSquared(point));
    }
}

Utils.Vector.fromArray = function(array) {
    return new Utils.Vector(array[0], array[1]);
}

Utils.Vector.getPoint = function(x, y) {
    if (x.constructor == Utils.Vector) return x;

    return new Utils.Vector(x, y);
}

Utils.Vector.averageOf = function(array) {
    const vector = new Utils.Vector();

    for (const vertex of array) {
        vector.x += vertex[0];
        vector.y += vertex[1];
    }

    vector.x /= array.length;
    vector.y /= array.length;

    return vector;
}

Utils.getKey = function(key, object) {
    const parts = key.split('.');

    for (const part of parts) {
        object = object[part];
    }

    return object;
}

/**
 * @param {Number} t - The x position on the curve
 * @param {Number} p0 - The start point of the curve
 * @param {Number} p1 - The second control point of the curve
 * @param {Number} p2 - The third control point of the curve
 * @param {Number} p3 - The end point of the curve
 * 
 * @returns The y position
 */
Math.bezier = function(t, p0, p1, p2, p3){
    var cX = 3 * (p1.x - p0.x),
        bX = 3 * (p2.x - p1.x) - cX,
        aX = p3.x - p0.x - cX - bX;
          
    var cY = 3 * (p1.y - p0.y),
        bY = 3 * (p2.y - p1.y) - cY,
        aY = p3.y - p0.y - cY - bY;
          
    var x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
    var y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;
          
    return {x: x, y: y};
}

Utils.css = function(element, name, value) {
    var rules = {};
    if (element.hasAttribute('style')) {
        var style = element.getAttribute('style');
        if (!style.endsWith(';')) style += ';';

        const regex = /([a-zA-Z\-0-9]*) ?: ?([^;^:]+);/g;

        var match;
        do {
            match = regex.exec(style);

            if (match != null) {
                rules[match[1]] = match[2];
            }
        } while (match != null);
    }

    rules[name] = value;

    var string = '';
    for (const rule in rules) {
        string += rule + ':' + rules[rule] + ';';
    }

    element.setAttribute('style', string);
}

Element.prototype.css = function(name, value) {
    Utils.css(this, name, value);
}