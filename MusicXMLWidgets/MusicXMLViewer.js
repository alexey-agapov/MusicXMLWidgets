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
    , loadScript('https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js')
    , loadScript('https://surikov.github.io/webaudiofont/examples/MIDIFile.js')
]);

function render({ model, el }) {
    var audioContext = null;
    var player = null;
    var reverberator = null;
    var songStart = 0;
    var input = null;
    var currentSongTime = 0;
    var song = null;
    var stepDuration = 44e-3;
 
    let offsetInMs = 0.0;

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
                });
            });
        });
        resetCursor();
    } 

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

    function msvalue_changed() {
        var msvalue = model.get('msvalue');
        currentSongTime = msvalue / 1000;
        if (currentSongTime > 0.0) {
            if (songStart == 0.0)
                songStart = audioContext.currentTime;
            tick();
        }
        else {
            songStart = 0.0;
        }
        updateCursor();
    }

    function midi_changed() {
        const midi = model.get('midi').buffer;
        const midiFile = new MIDIFile( midi);
        songStart = 0.0;
        song = midiFile.parseSong();
        startLoad()
        updateModel();
    }

    function updateModel() {
        model.set('duration', song.duration)
        model.set('msduration', Math.round( Math.ceil( song.duration / stepDuration) * stepDuration * 1000))
        model.set('interval', stepDuration)
        model.set('msinterval', Math.round( stepDuration * 1000))
        model.save_changes()
    }

    function tick() {
        sendNotes(currentSongTime - stepDuration, currentSongTime);
    }
    
    function startLoad() {
        var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextFunc();
        player = new WebAudioFontPlayer();
        reverberator = player.createReverberator(audioContext);
        reverberator.output.connect(audioContext.destination);
        input = reverberator.input;
        for (var i = 0; i < song.tracks.length; i++) {
            var nn = player.loader.findInstrument(song.tracks[i].program);
            var info = player.loader.instrumentInfo(nn);
            song.tracks[i].info = info;
            song.tracks[i].id = nn;
            player.loader.startLoad(audioContext, info.url, info.variable);
        }
        for (var i = 0; i < song.beats.length; i++) {
            var nn = player.loader.findDrum(song.beats[i].n);
            var info = player.loader.drumInfo(nn);
            song.beats[i].info = info;
            song.beats[i].id = nn;
            player.loader.startLoad(audioContext, info.url, info.variable);
        }
        player.loader.waitLoad(function () {
        });
    }
    
    function sendNotes(start, end) {
        for (var t = 0; t < song.tracks.length; t++) {
            var track = song.tracks[t];
            for (var i = 0; i < track.notes.length; i++) {
                if (track.notes[i].when >= start && track.notes[i].when < end) {
                    var when = songStart + track.notes[i].when;
                    var duration = track.notes[i].duration;
                    if (duration > 3) {
                        duration = 3;
                    }
                    var instr = track.info.variable;
                    var v = track.volume / 7;
                    player.queueWaveTable(audioContext, input, window[instr], when, track.notes[i].pitch, duration, v, track.notes[i].slides);
                }
            }
        }
        for (var b = 0; b < song.beats.length; b++) {
            var beat = song.beats[b];
            for (var i = 0; i < beat.notes.length; i++) {
                if (beat.notes[i].when >= start && beat.notes[i].when < end) {
                    var when = songStart + beat.notes[i].when;
                    var duration = 1.5;
                    var instr = beat.info.variable;
                    var v = beat.volume / 2;
                    player.queueWaveTable(audioContext, input, window[instr], when, beat.n, duration, v);
                }
            }
        }
    }

    render();
    msvalue_changed();
    midi_changed();

    model.on( 'change:xml', render);
    model.on( 'change:msvalue', msvalue_changed);
    model.on( 'change:midi', midi_changed);
}

export default { render }
