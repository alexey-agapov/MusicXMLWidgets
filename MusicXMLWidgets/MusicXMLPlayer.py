import anywidget
import traitlets
import pathlib
import music21

class MusicXMLPlayer(anywidget.AnyWidget):
    _esm = (pathlib.Path(__file__).parent / "MusicXMLPlayer.js").read_text()
    value = traitlets.Float().tag(sync=True)
    duration = traitlets.Float().tag(sync=True)
    interval = traitlets.Float().tag(sync=True)

    msvalue = traitlets.CInt(0).tag(sync=True)
    msduration = traitlets.CInt().tag(sync=True)
    msinterval = traitlets.CInt().tag(sync=True)    
    
    midi = traitlets.Bytes().tag(sync=True)
    xml = traitlets.Unicode().tag(sync=True)

    def __init__( self, **kwargs):
        super().__init__( **kwargs)

    @traitlets.observe( 'xml')
    def _on_xml_change( self, change):
        score = music21.converter.parse( self.xml)
        midi = music21.midi.translate.streamToMidiFile( score)
        self.midi = midi.writestr()
 