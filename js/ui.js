const UI = {};

UI.init = function(map) {
    const parent = document.querySelector('#chloroplast-dropdown');
    for (let i = 0; i < Map.modes.length; i++) {
        const classes = ['dropdown-choice'];
        if (i == map.mode) classes.push('selected');
        
        Utils.createComplexElement('div', {
            class: classes,
            text: Map.modes[i].name,
            listeners: {
                click: function() {
                    map.setMode(i);

                    parent.querySelector('.selected').classList.remove('selected');
                    this.classList.add('selected');
                }
            },
            parent: parent
        });
    }
}

UI.displayCountry = function(country) {
    Input.cover(true, true);

    const element = document.querySelector('.country-panel');
    element.querySelector('h1').innerText = country.name + ' [' + country.id + ']';
    element.querySelector('.svg').innerHTML = '';
    element.querySelector('.svg').appendChild(country.getLoneSVG());
    element.classList.remove('hidden');

    Input.dismiss = function() {
        element.classList.add('hidden');
        Input.cover(false);
    }
}