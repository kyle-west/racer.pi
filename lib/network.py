from requests import get
from gpiozero import LED, Button
from signal import pause
from time import sleep
from sys import argv

host = argv[1] if len(argv) > 1 else 'localhost:5555'
notifyURL = 'http://' + host + '/gpio'
print('notifying changes to', notifyURL)

def send(state): get(notifyURL, params=state)