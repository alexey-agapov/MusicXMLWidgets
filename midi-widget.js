import {} from 'https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js';
import {} from 'https://surikov.github.io/webaudiofont/examples/MIDIFile.js';

function render({ model, el }) {
    const div = document.createElement('div');
    el.appendChild( div)

    function update() {
        div.textContent = model.get( 'text')
    }

    update()

    model.on( 'change:text', update)
}

export default { render }
