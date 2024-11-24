import anywidget
import traitlets
import pathlib
import music21

from IPython.display import display

class MusicXMLViewer(anywidget.AnyWidget):
    _esm = (pathlib.Path(__file__).parent / "MusicXMLViewer.js").read_text()
    xml = traitlets.Unicode("").tag(sync=True)
    midi = traitlets.Bytes().tag(sync=True)

    msvalue = traitlets.CInt(0).tag(sync=True)
    msduration = traitlets.CInt().tag(sync=True)
    msinterval = traitlets.CInt().tag(sync=True)    
    
    def __init__( self, **kwargs):
        super().__init__( **kwargs)

    @traitlets.observe( 'xml')
    def _on_xml_change( self, change):
        score = music21.converter.parse( self.xml)
        midi = music21.midi.translate.streamToMidiFile( score)
        self.midi = midi.writestr()
        self.msvalue = 0
