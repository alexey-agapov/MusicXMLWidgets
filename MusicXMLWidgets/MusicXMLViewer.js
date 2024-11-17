import {loadScript} from './utils.js'

await Promise.all([
    loadScript('https://unpkg.com/opensheetmusicdisplay@1.8.0/build/opensheetmusicdisplay.min.js')
]);

function render({ model, el }) {
    const container = document.createElement('div');
    el.appendChild(container);

    const osmd  = new opensheetmusicdisplay.OpenSheetMusicDisplay(container, {
        autoResize: true,
        backend: 'svg',
        drawTitle: false,
        drawingParameters: "compacttight"
    });

    function renderHelper() {
        osmd.load( model.get( 'xml')).then(() => {
            osmd.render();
        }).catch((error) => {
            console.error('Error rendering MusicXML:', error);
        });
    }
    renderHelper();
    model.on( 'change:xml', renderHelper);
}

export default { render }
