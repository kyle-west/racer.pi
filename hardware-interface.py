from lib.network import notifyApp
from lib.gpio import Indicator
from signal import pause
import os

def btnPress(item):
    print(item.name, "ON")
    notifyApp({ 'name' :  item.name, 'state' : 1 })

def btnRelease(item):
    print(item.name, "OFF")
    notifyApp({ 'name' :  item.name, 'state' : 0 })
   
# The main Red Button on the board
R = Indicator(name=os.environ.get('BTN_START'), led=18, btn=26, onPress=btnPress, onRelease=btnRelease)

# The four black buttons with their wire colors
K = Indicator(name=os.environ.get('BTN_LANE_1'), led=12, btn= 5, onPress=btnPress, onRelease=btnRelease)
Y = Indicator(name=os.environ.get('BTN_LANE_2'), led=16, btn=19, onPress=btnPress, onRelease=btnRelease)
G = Indicator(name=os.environ.get('BTN_LANE_3'), led=20, btn=13, onPress=btnPress, onRelease=btnRelease)
B = Indicator(name=os.environ.get('BTN_LANE_4'), led=21, btn= 6, onPress=btnPress, onRelease=btnRelease)

pause()