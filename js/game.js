let map;

const names = [];
for (const map of Map.maps) names.push(map.name);
Input.choice('Choose a map for your world', 'Your map is the layout and the default attributes of each region', names, function(index) {
    map = Map.maps[index];
    UI.init(map);

    const svg = map.getSVG();
    let scale;

    const update = function() {
        scale = Math.min(window.innerWidth / svg.width.baseVal.value, window.innerHeight / svg.height.baseVal.value);
        svg.css('width', (svg.width.baseVal.value * scale) + 'px');
        svg.css('height', (svg.height.baseVal.value * scale) + 'px');
        svg.css('top', ((window.innerHeight - (svg.height.baseVal.value * scale)) / 2) + 'px');
        svg.css('left', ((window.innerWidth - (svg.width.baseVal.value * scale)) / 2) + 'px');
    };

    window.addEventListener('resize', update);
    update();

    document.body.appendChild(svg);

    let last = null;
    svg.addEventListener('click', function(event) {
        const region = map.find({x: event.offsetX / scale, y: event.offsetY / scale});

        if (region != null) {
            UI.displayCountry(region);

            if (last != null) {
                document.body.style.cursor = '';
                last.hoverOff();
                last = null;
            }
        }
    });

    svg.addEventListener('mousemove', function(event) {
        const region = map.find({x: event.offsetX / scale, y: event.offsetY / scale});

        if (region != null) {
            document.body.style.cursor = 'pointer';
            if (last != region) {
                region.hoverOn();
                if (last != null) last.hoverOff();
                last = region;
            }
        } else {
            document.body.style.cursor = '';
            if (last != null) {
                last.hoverOff();
                last = null;
            }
        }
    });

    const toggleBezier = document.getElementById('tbc');
    toggleBezier.addEventListener('click', function() {
        map.bezier = !map.bezier;

        if (map.bezier) toggleBezier.classList.add('selected');
        else toggleBezier.classList.remove('selected');

        map.refreshGFX();
    })
});