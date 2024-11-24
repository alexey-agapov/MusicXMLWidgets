import anywidget
import traitlets
import pathlib

from IPython.display import display

class MusicXMLViewer(anywidget.AnyWidget):
    _esm = (pathlib.Path(__file__).parent / "MusicXMLViewer.js").read_text()
    xml = traitlets.Unicode("").tag(sync=True)
    offsetInMs = traitlets.Float(0.0).tag(sync=True)
