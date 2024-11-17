function loadScript(url) {
    return new Promise(function(resolve, reject) {
        var script = document.createElement("script");
        script.onload = resolve;
        script.onerror = reject;
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    });
}

function loadOSMD() {
    if (typeof opensheetmusicdisplay === 'undefined') {
        return loadScript('https://unpkg.com/opensheetmusicdisplay@1.8.0/build/opensheetmusicdisplay.min.js');
    } else {
        // already loaded and ready to go
        return Promise.resolve();
    }
}



function render({ model, el }) {

    let osmd = ""

    function renderHelper() {
    

    
        osmd.load( model.get( 'xml')).then(() => {
            osmd.render();
        }).catch((error) => {
            console.error('Error rendering MusicXML:', error);
        });
    }
    
    loadOSMD().then(function() {
        const container = document.createElement('div');
        el.appendChild(container);
    
        osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(container, {
            autoResize: true,
            backend: 'svg',
            drawTitle: false,
            drawingParameters: "compacttight"
        });

        renderHelper();
        model.on( 'change:xml', renderHelper);
    }, function() {
        console.error('Failed to load OpenSheetMusicDisplay script.');
    });
}

export default { render }
