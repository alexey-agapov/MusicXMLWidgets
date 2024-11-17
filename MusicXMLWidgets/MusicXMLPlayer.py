import anywidget
import traitlets
import pathlib

class MusicXMLPlayer(anywidget.AnyWidget):
    _esm = (pathlib.Path(__file__).parent / "MusicXMLPlayer.js").read_text()
    value = traitlets.Float().tag(sync=True)
    duration = traitlets.Float().tag(sync=True)
    interval = traitlets.Float().tag(sync=True)

    msvalue = traitlets.CInt().tag(sync=True)
    msduration = traitlets.CInt().tag(sync=True)
    msinterval = traitlets.CInt().tag(sync=True)    
    
    midi = traitlets.Bytes("").tag(sync=True)