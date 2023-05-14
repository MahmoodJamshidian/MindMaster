from PyQt5 import QtCore
from flask import Flask, render_template, request
from PyQt5.QtCore import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *
from PyQt5.QtWebEngineWidgets import *
from PyQt5.QtPrintSupport import *
from pyqt_frameless_window import FramelessMainWindow
from pynput.mouse import Button, Controller
import qdarkstyle
import sys

class WindowMovement(QThread):
    _move = pyqtSignal(int, int)

    def __init__(self, window: QMainWindow):
        super().__init__()
        self._window = window
        self._move_window = False
        self._mutex = QMutex()

    def set_status(self, status: bool):
        self._mutex.lock()
        self._move_window = status
        self._mutex.unlock()

    def run(self):
        mouse = Controller()
        m_pos = None
        w_pos = None
        while True:
            self._mutex.lock()
            _move_window = self._move_window
            self._mutex.unlock()
            if _move_window:
                if not m_pos or not w_pos:
                    m_pos = mouse.position
                    w_pos = (self._window.geometry().x(), self._window.geometry().y())
                    continue
                self._move.emit((w_pos[0] + (mouse.position[0] - m_pos[0])), w_pos[1] + (mouse.position[1] - m_pos[1]))
            else:
                w_pos = None
                m_pos = None

class FlaskThread(Flask, QThread):
    _close = pyqtSignal()
    _maximize = pyqtSignal()
    _restore_down = pyqtSignal()
    _minimize = pyqtSignal()
    _show = pyqtSignal()
    _hide = pyqtSignal()

    def close_program(self):
        self._close.emit()
    
    def maximize_program(self):
        self._maximize.emit()
    
    def restor_down_program(self):
        self._restore_down.emit()

    def minimize_program(self):
        self._minimize.emit()

    def show_program(self):
        self._show.emit()

    def hide_program(self):
        self._hide.emit()

    def __init__(self):
        Flask.__init__(self, __name__)
        QThread.__init__(self)

class Browser(QWebEngineView):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setSizePolicy(QSizePolicy.MinimumExpanding, QSizePolicy.MinimumExpanding)

class MainWindow(FramelessMainWindow):
    move_window = False
    def __init__(self, *args, **kwargs):
        super(MainWindow, self).__init__(*args, **kwargs)
        self.browser = Browser()
        self.browser.setUrl(QUrl("http://127.0.0.1:5000"))

        palette = self.palette()
        palette.setColor(QPalette.Background, QColor(255, 0, 0))
        self.setPalette(palette)
        self.resize(900, 600)

        self.setCentralWidget(self.browser)
        
        self.server = FlaskThread()
        self.server._close.connect(self.close)
        self.server._maximize.connect(self.showMaximized)
        self.server._restore_down.connect(self.showNormal)
        self.server._minimize.connect(self.showMinimized)
        self.server._show.connect(self.show)
        self.server._hide.connect(self.hide)

        self.window_movement = WindowMovement(self)
        self.window_movement._move.connect(self.move)
        self.window_movement.start()

    def closeEvent(self, event):
        reply = QMessageBox.question(self, 'MindMaster',
            "Are you sure to quit?", QMessageBox.Yes, QMessageBox.No)

        if reply == QMessageBox.Yes:
            event.accept()
        else:
            event.ignore()

    def changeEvent(self, event: QEvent):
        if event.type() == QEvent.WindowStateChange and self.windowState() == Qt.WindowMaximized:
            self.browser.page().runJavaScript("_maximize_window()")
        if event.type() == QEvent.WindowStateChange and self.windowState() == Qt.WindowNoState:
            self.browser.page().runJavaScript("_minimize_window()")
        return super().changeEvent(event)
    
QApplication.setApplicationName("MindMaster")
 
app = QApplication([])
# app.setWindowIcon("icon.ico")
app.setStyleSheet(qdarkstyle.load_stylesheet_pyqt5())
# initiate window
window = MainWindow()

screen_resolution = app.desktop().screenGeometry()
screen_width, screen_height = screen_resolution.width(), screen_resolution.height()

# move the window to the center of the screen
window.move((screen_width - window.width()) // 2, (screen_height - window.height()) // 2)

@window.server.route("/")
def index():
    return render_template("index.html", maximize=True)

@window.server.route("/close")
def close():
    window.server.close_program()
    return "ok"

@window.server.route("/maximize")
def maximize():
    window.server.maximize_program()
    return "ok"

@window.server.route("/restore-down")
def restore_down():
    window.server.restor_down_program()
    return "ok"

@window.server.route("/minimize")
def minimize():
    window.server.minimize_program()
    return "ok"

@window.server.route("/show")
def show():
    window.server.show_program()
    return "ok"

@window.server.route("/hide")
def hide():
    window.server.hide_program()
    return "ok"

@window.server.route("/move")
def move():
    window.window_movement.set_status(True)
    return "ok"

@window.server.route("/unmove")
def unmove():
    window.window_movement.set_status(False)
    return "ok"
window.server.start()
app.exec_()