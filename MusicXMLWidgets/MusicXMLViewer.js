function loadScript(url) {
    if( document.querySelector(`script[src="${url}"]`)) {
        // already loaded and ready to go
        return Promise.resolve();
    }

    return new Promise(function(resolve, reject) {
        var script = document.createElement("script");
        script.onload = resolve;
        script.onerror = reject;
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    });
}

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
            osmd.cursor.reset()
            const iterator = osmd.cursor.iterator;

            let currentTimeStamp = iterator.currentTimeStamp;
            let tempoInBPM = iterator.currentMeasure.tempoInBPM;

            while (!iterator.EndReached) {
                currentTimeStamp = iterator.currentTimeStamp;
                tempoInBPM = iterator.currentMeasure.tempoInBPM;
                console.log( currentTimeStamp);
                console.log( tempoInBPM);
                console.log( iterator.currentMeasureIndex);
                osmd.cursor.next()
            }


        }).catch((error) => {
            console.error('Error rendering MusicXML:', error);
        });
    }
    renderHelper();
    model.on( 'change:xml', renderHelper);
}

export default { render }
