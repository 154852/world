const Input = {};

Input.alert = function(title, text, callback) {
    Input.cover(true);

    const element = Utils.createComplexElement('div', {
        class: 'input-alert',
        parent: document.body,
        children: [
            Utils.createComplexElement('h1', {
                text: title
            }),
            Utils.createComplexElement('p', {
                text: text
            }),
            Utils.createComplexElement('div', {
                children: [
                    Utils.createComplexElement('div', {
                        class: 'button',
                        text: 'OK',
                        listeners: {
                            click: function() {
                                element.classList.add('closing');
                                setTimeout(function() {
                                    document.body.removeChild(element);
                                }, 500);

                                Input.cover(false);
                                
                                if (callback) callback();
                            }
                        }
                    })
                ]
            })
        ]
    })

    return element;
}

Input.choice = function(title, text, options, callback) {
    Input.cover(true);

    const element = Utils.createComplexElement('div', {
        class: 'input-alert',
        parent: document.body,
        children: [
            Utils.createComplexElement('h1', {
                text: title
            }),
            Utils.createComplexElement('p', {
                text: text
            }),
            Utils.createComplexElement('div', {
            }, function() {
                for (let i = 0; i < options.length; i++) {
                    const option = options[i];
                    const name = option.name || option;
                    const classes = ['button'];
                    if (option.cancel) classes.push('cancel');

                    Utils.createComplexElement('div', {
                        class: classes,
                        text: name,
                        listeners: {
                            click: function() {
                                element.classList.add('closing');
                                setTimeout(function() {
                                    document.body.removeChild(element);
                                }, 500);

                                Input.cover(false);
                                
                                if (callback) callback(i, option, name);
                            }
                        },
                        parent: this
                    })
                }
            })
        ]
    })

    return element;
}

Input.confirm = function(title, text, callback) {
    return Input.choice(title, text, ['Confirm', {name: 'Cancel', cancel: true}], function(data) {
        if (callback) {
            callback(!Boolean(data));
        }
    });
}

Input.textInput = function(title, text, placeholder, callback) {
    let element;

    const end = function() {
        element.classList.add('closing');
        setTimeout(function() {
            document.body.removeChild(element);
        }, 500);

        Input.cover(false);
        
        if (callback) callback(element.querySelector('.entry').value);
    }

    Input.cover(true);

    element = Utils.createComplexElement('div', {
        class: 'input-alert',
        parent: document.body,
        children: [
            Utils.createComplexElement('h1', {
                text: title
            }),
            Utils.createComplexElement('p', {
                text: text
            }),
            Utils.createComplexElement('div', {
                class: 'flex-row',
                children: [
                    Utils.createComplexElement('input', {
                        class: ['flex-keep', 'entry'],
                        attr: {
                            placeholder: placeholder,
                            type: 'text'
                        },
                        css: {
                            'margin-right': '1em',
                            'width': '300%'
                        },
                        listeners: {
                            keydown: function(event) {
                                if (event.keyCode == 13) end();
                            }
                        }
                    }),
                    Utils.createComplexElement('div', {
                        class: ['flex-remaining', 'button', 'no-margin'],
                        text: 'Go',
                        listeners: {
                            click: end
                        }
                    })
                ]
            })
        ]
    })

    return element;
}

Input.numericalInput = function(title, text, callback) {
    return Input.textInput(title, text, 'A Number', function(value) {
        if (value.match(/^[0-9\.\-]+$/) != null) {
            callback(parseFloat(value));
        } else {
            return Input.numericalInput(title, 'The number you entered could not be used, please try again.', callback);
        }
    })
}

Input.cover = function(on) {
    let element = document.querySelector('.cover');

    if (element == null) {
        element = Utils.createComplexElement('div', {
            class: 'cover',
            parent: document.body
        });

        element.offsetHeight; // reflow
    }

    if (on) {
        element.classList.add('active');
    } else {
        element.classList.remove('active');
    }
}