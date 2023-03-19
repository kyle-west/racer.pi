from requests import post
from sys import argv
import os

host = argv[1] if len(argv) > 1 else 'localhost:' + os.environ.get('SERVER_PORT')
notifyURL = 'http://' + host + '/gpio'
print('notifying changes to', notifyURL)

def notifyApp(state): post(notifyURL, params=state)
