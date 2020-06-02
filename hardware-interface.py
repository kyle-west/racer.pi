from lib.network import send
from lib.gpio import Indicator
from signal import pause

def btnPress(item):
    print(item.name, "ON")
    send({ 'name' :  item.name, 'state' : 1 })

def btnRelease(item):
    print(item.name, "OFF")
    send({ 'name' :  item.name, 'state' : 0 })
   
# The main Red Button on the board
R = Indicator(name='start', led=18, btn=26, onPress=btnPress, onRelease=btnRelease)

# The four black buttons with their wire colors
K = Indicator(name='1', led=12, btn= 5, onPress=btnPress, onRelease=btnRelease)
Y = Indicator(name='2', led=16, btn=19, onPress=btnPress, onRelease=btnRelease)
G = Indicator(name='3', led=20, btn=13, onPress=btnPress, onRelease=btnRelease)
B = Indicator(name='4', led=21, btn= 6, onPress=btnPress, onRelease=btnRelease)

pause()