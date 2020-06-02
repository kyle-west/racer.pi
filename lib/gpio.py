from gpiozero import LED, Button

class DualConnection: 
  def __init__(self, btn, led):
    self.btn = btn
    self.led = led

class Indicator:
  def __init__(self, name = None, led = None, btn = None, onPress = None, onRelease = None):
    self._onPress = onPress
    self._onRelease = onRelease
    self.pins = DualConnection(btn, led)
    self.name = name if name else "(" + str(led) + ")[" + str(btn) + "]"
    self.led = LED(led)
    self.btn = Button(btn)
    self.btn.when_pressed = self.onPress
    self.btn.when_released = self.onRelease

  def onPress(self):
    self.led.on()
    if self._onPress: self._onPress(self)

  def onRelease(self):
    self.led.off()
    if self._onRelease: self._onRelease(self)
