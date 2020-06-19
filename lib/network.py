from requests import get
from gpiozero import LED, Button
from signal import pause
from time import sleep
from sys import argv
import os

host = argv[1] if len(argv) > 1 else 'localhost:' + os.environ.get('SERVER_PORT')
notifyURL = 'http://' + host + '/gpio'
print('notifying changes to', notifyURL)

def send(state): get(notifyURL, params=state)