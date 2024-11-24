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

    let cursorCurrentMs = 0.0;

    function render() {
        osmd.load( model.get( 'xml')).then(() => {
            osmd.render();

            const cursor = osmd.cursor;
            cursor.reset()
            cursor.show()

        }).catch((error) => {
            console.error('Error rendering MusicXML:', error);
        });
    }

    function updateCursor() {
        const ms = model.get( 'offsetInMs');

        const cursor = osmd.cursor;
        if (!cursor) {
            return
        }

        cursor.hide();
        cursor.reset();

        const iter = osmd.cursor.iterator;
        let offsetInMs = 0.0;
        while (offsetInMs <= ms) {
            const measure = iter.currentMeasure;
            const beatsPerMeasure = measure.activeTimeSignature.denominator;
            const beatsPerMinute = measure.tempoInBPM;
            const offsetInBeats = iter.currentTimeStamp.RealValue;
            iter.moveToNext();
            const deltaInBeats = iter.currentTimeStamp.RealValue - offsetInBeats;
            offsetInMs += deltaInBeats * beatsPerMeasure * 60000 / beatsPerMinute;
        }
        iter.moveToPrevious();
        cursor.show();
    }

    render();
    //updateCursor();

    model.on( 'change:xml', render);
    model.on( 'change:offsetInMs', updateCursor);
}

export default { render }
