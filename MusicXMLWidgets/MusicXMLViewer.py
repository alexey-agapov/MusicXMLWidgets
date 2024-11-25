import anywidget
import traitlets
import pathlib
import music21
from ipywidgets import Play, jslink, VBox

from IPython.display import display

class MusicXMLViewer(anywidget.AnyWidget):
    _esm = (pathlib.Path(__file__).parent / "MusicXMLViewer.js").read_text()
    xml = traitlets.Unicode().tag(sync=True)
    midi = traitlets.Bytes().tag(sync=True)

    msvalue = traitlets.CInt(0).tag(sync=True)
    msduration = traitlets.CInt().tag(sync=True)
    msinterval = traitlets.CInt().tag(sync=True)    
    
    def __init__( self, **kwargs):
        super().__init__( **kwargs)

        # Create Play widget
        self.play = Play()

        # Set up jslink bindings
        jslink((self, 'msinterval'), (self.play, 'interval'))
        jslink((self, 'msduration'), (self.play, 'max'))
        jslink((self, 'msinterval'), (self.play, 'step'))
        jslink((self, 'msvalue'), (self.play, 'value'))

        # Combine the widgets into a layout
        self.container = VBox([self, self.play])

    def _ipython_display_(self):
        """Display the combined widget."""
        display( self.container)

    @traitlets.observe( 'xml')
    def _on_xml_change( self, change):
        score = music21.converter.parse( self.xml)
        midi = music21.midi.translate.streamToMidiFile( score)
        self.midi = midi.writestr()
        self.msvalue = 0


    @traitlets.observe( "p2")
    def _on_p2_change( self, change):
        if self._setting_p1:
            self._setting_p1 = False
            return
        self._setting_p2 = True
        self.p1 = self.p2 + " from p2"
