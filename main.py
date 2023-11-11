import  RPi.GPIO as GPIO
import time
import requests

def initialize():
    GPIO.setmode(GPIO.BCM)
    
     #Setup each pin to read input
    GPIO.setup(startpin, GPIO.IN)
    GPIO.setup(lane1, GPIO.IN)
    GPIO.setup(lane2, GPIO.IN)
    GPIO.setup(lane3, GPIO.IN)
    GPIO.setup(lane4, GPIO.IN)
    GPIO.setup(lane5, GPIO.IN)
    GPIO.setup(lane6, GPIO.IN)

    print('Initial hardware pin values')
    print ('lane1 ' + str(GPIO.input(lane1)))
    print ('lane2 ' + str(GPIO.input(lane2)))
    print ('lane3 ' + str(GPIO.input(lane3)))
    print ('lane4 ' + str(GPIO.input(lane4)))
    print ('lane5 ' + str(GPIO.input(lane5)))
    print ('lane6 ' + str(GPIO.input(lane6)))

    print ('startpint ' +str(GPIO.input(startpin)))     

def beginracecallback(channel):
    if GPIO.input(startpin):
        print('rising signal recieved, starting timer!!!!')
        run_race(server_port)
        print('Race completed!')
        print('Waiting for the start race button to be pressed.')
    else:
        print('falling signal detected, waiting for button release')



def teardown():
    GPIO.cleanup()

def start_race(server_port):
    """Calls the POST <server-port>/gpio/start API endpoint."""

    url = f"http://localhost:{server_port}/gpio/start"

    response = requests.post(url)

    return response

def finish_lane(server_port, lane_number, lane_time):
    """Calls the POST <server-port>/gpio/time?lane=<lane-number>&time=<lane-time> API endpoint."""

    if (lane_time == 0):
        lane_time = maxtime

    url = f"http://localhost:{server_port}/gpio/time"

    params = {
        "lane": lane_number,
        "time": lane_time
    }

    response = requests.post(url, params=params)
    print("Lane " + str(lane_number) + " with time = " + str(lane_time) + " has been send to the racer application.")
    return response

def calculatetime(start):
    end = time.time()
    return  end - start
   
def run_race(server_port):
    start_race(server_port);
    #Set each line count to 0
    lane1time = 0
    lane2time = 0
    lane3time = 0
    lane4time = 0
    lane5time = 0  # print('3...')
    #time.sleep(.001)
    lane6time = 0
    currenttime = 0
            
    #Now read the start time for all lanes
    start = time.time()

    #Loop for 5 seconds and read input for each lane to end race
    while time.time()- start < maxtime:
        #print(start)
        if GPIO.input(lane1) and not lane1time:
             lane1time =  calculatetime(start)
        if GPIO.input(lane2) and not lane2time:
             lane2time =  calculatetime(start)
        if GPIO.input(lane3) and not lane3time:
             lane3time =  calculatetime(start)
        if GPIO.input(lane4) and not lane4time:
             lane4time =  calculatetime(start)
        if GPIO.input(lane5) and not lane5time:
             lane5time =  calculatetime(start)
        if GPIO.input(lane6) and not lane6time:
             lane6time =  calculatetime(start)
        if lane1time and lane2time and lane3time and lane4time and lane5time and lane6time:
             break
       
       
    finish_lane(server_port, 1, lane1time)
    finish_lane(server_port, 2, lane2time)
    finish_lane(server_port, 3, lane3time)
    finish_lane(server_port, 4, lane4time)
    finish_lane(server_port, 5, lane5time)
    finish_lane(server_port, 6, lane6time)
      

if __name__ == "__main__":
    server_port = 5000
    maxtime = 5
    #Map each pin number to GPIO pins
    startpin = 5
    lane1 = 6
    lane2 = 27
    lane3 = 22
    lane4 = 24
    lane5 = 25
    lane6 = 8

   
    initialize();
    print(GPIO.input(startpin))
    print('Running the race track listener service.')
    print('This is a product developed and exclusively owned by Three Generation of Wests. Contact them for licensing agreements.')
    print('Waiting for the start race button to be pressed.')
    GPIO.add_event_detect(startpin,GPIO.BOTH,callback=beginracecallback)
          
    while (True):
        pass
       
   
    teardown(); 
