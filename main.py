import  RPi.GPIO as GPIO
import time

def calculatetime(start):
    end = time.time()
    return  end - start
   

GPIO.setmode(GPIO.BCM)

#Map each pin number to GPIO pins
startpin = 5
lane1 = 6
lane2 = 27
lane3 = 22
lane4 = 24
lane5 = 25
lane6 = 8

#Set each line count to 0
lane1time = 0
lane2time = 0
lane3time = 0
lane4time = 0
lane5time = 0  # print('3...')
time.sleep(.001)
lane6time = 0
currenttime = 0

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

#TODO:Wait until the startpin goes high
# NEED CODE TO WAIT UNTIL THE START PIN IS SIGNAL TO BEGIN

print('listening for start signal.')
while not GPIO.input(startpin):
    pass
    #out = '\t1: ' + str(GPIO.input(lane1)) + '\t2: ' + str(GPIO.input(lane2)) + '\t3: ' +  str(GPIO.input(lane3)) + '\t4: ' +  str(GPIO.input(lane4)) + '\t5: ' +  str(GPIO.input(lane5)) + '\t6: ' +  str(GPIO.input(lane6))
    #print(out)
    #print(str(GPIO.input(startpin)))

print('GOOOO!!!!!!')    

#Now read the start time for all lanes
start = time.time()

#Loop for 10 seconds and read input for each lane to end race
while time.time()- start < 10:
    #print(start)
    if GPIO.input(lane1) and not lane1time:
         lane1time =  calculatetime(start)
         print('lane 1 =' + str(lane1time))
    if GPIO.input(lane2) and not lane2time:
         lane2time =  calculatetime(start)
         print('lane 2 =' + str(lane2time))
    if GPIO.input(lane3) and not lane3time:
         lane3time =  calculatetime(start)
         print('lane 3 =' + str(lane3time))
    if GPIO.input(lane4) and not lane4time:
         lane4time =  calculatetime(start)
         print('lane 4 =' + str(lane4time))
    if GPIO.input(lane5) and not lane5time:
         lane5time =  calculatetime(start)
         print('lane 5 =' + str(lane5time))
    if GPIO.input(lane6) and not lane6time:
         lane6time =  calculatetime(start)
         print('lane 6 =' + str(lane6time))
    if lane1time and lane2time and lane3time and lane4time and lane5time and lane6time:
         break
   
print('\n\n')
print('lane 1 =' + str(lane1time))
print('lane 2 =' + str(lane2time))
print('lane 3 =' + str(lane3time))
print('lane 4 =' + str(lane4time))
print('lane 5 =' + str(lane5time))
print('lane 6 =' + str(lane6time))


# GPIO.cleanup()