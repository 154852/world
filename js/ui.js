const UI = {};

UI.init = function(map) {
    const parent = document.querySelector('#chloroplast-dropdown');
    for (let i = 0; i < Map.modes.length; i++) {
        Utils.createComplexElement('div', {
            class: ['dropdown-choice'],
            text: Map.modes[i].name,
            listeners: {
                click: function() {
                    map.setMode(i);
                }
            },
            parent: parent
        });
    }

    UI.initDropdowns();
}

UI.initDropdowns = function() {
    const dropdowns = document.querySelectorAll('.dropdown');

    for (const dropdown of dropdowns) {
        dropdown.parentElement.addEventListener('click', function() {
            if (dropdown.classList.contains('enabled')) {
                dropdown.classList.remove('enabled')
            } else dropdown.classList.add('enabled');
        });
    }
}

UI.tweet = function(user, message) {

}