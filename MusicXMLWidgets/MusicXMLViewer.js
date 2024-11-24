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

    function render() {
        osmd.load( model.get( 'xml')).then(() => {
            osmd.render();
            setTimeout(() => {
                addNoteClickListeners();
                updateCursor();
            } 
            , 100);
        }).catch((error) => {
            console.error('Error rendering MusicXML:', error);
        });
    }

    function addNoteClickListeners() {
        resetCursor();
        iterateCursor( osmd.cursor, 0, null, (cursor, currentOffset) => {
            cursor.GNotesUnderCursor().forEach( (note) => {
                const el = note.getSVGGElement();
                el.addEventListener( 'click', (event) => {
                    model.set('msvalue', currentOffset);
;
                })
            });
        });
        resetCursor();
    } 

    let offsetInMs = 0.0;

    function resetCursor() {
        osmd.cursor.reset();
        offsetInMs = 0;
    }

    function iterateCursor(cursor, currentOffsetInMs, maxOffsetInMs = null, onIteration = null) {
        const iter = cursor.iterator;
        let newOffsetInMs = currentOffsetInMs;

        while (!iter.endReached && (maxOffsetInMs === null || newOffsetInMs <= maxOffsetInMs)) {
            currentOffsetInMs = newOffsetInMs;

            // Execute the provided callback function with the current offset
            if (typeof onIteration === 'function') {
                onIteration( cursor, currentOffsetInMs);
            }
            // Calculate the next offset
            const measure = iter.currentMeasure;
            const beatsPerMeasure = measure.activeTimeSignature.denominator;
            const beatsPerMinute = measure.tempoInBPM;
            const offsetInBeats = iter.currentTimeStamp.RealValue;

            iter.moveToNext();

            const deltaInBeats = iter.currentTimeStamp.RealValue - offsetInBeats;
            newOffsetInMs += Math.floor( deltaInBeats * beatsPerMeasure * 60000 / beatsPerMinute);
        }
        iter.moveToPrevious();

        return currentOffsetInMs;
    }

    function updateCursor() {
        const ms = model.get( 'msvalue');
   
        const cursor = osmd.cursor;
        if (!cursor) {
            return
        }

        cursor.hide();

        if (ms < offsetInMs) {
            resetCursor();
        }

        let temp = offsetInMs
        offsetInMs = iterateCursor( cursor, offsetInMs, ms);

        cursor.show();
    }

    render();

    model.on( 'change:xml', render);
    model.on( 'change:msvalue', updateCursor);
}

export default { render }
