import requests
import time
import random



def call_start_race(server_port):
    """Calls the POST <server-port>/gpio/start API endpoint."""

    url = f"http://localhost:{server_port}/gpio/start"

    response = requests.post(url)

    return response

def call_finish_lane(server_port, lane_number, lane_time):
    """Calls the POST <server-port>/gpio/time?lane=<lane-number>&time=<lane-time> API endpoint."""

    url = f"http://localhost:{server_port}/gpio/time"

    params = {
        "lane": lane_number,
        "time": lane_time
    }

    response = requests.post(url, params=params)
    print(response)
    return response

def call_race_functions(server_port):
    # Wait for the user to click Enter
    input("Press Enter to continue...")
    time.sleep(2)
    # Start the race
    call_start_race(server_port)
    i = 1
    # Loop 6 times and call finish_lane for each lane
    for i in range(6):
        # Generate a random number between 1 and 4
        seconds = random.randint(1, 5)

         # Call finish_lane for the current lane
        call_finish_lane(server_port, i + 1, seconds)


if __name__ == "__main__":
    server_port = 5000
    while (True):
        call_race_functions(server_port)

print('listening for start signal. This is mock mode so press enter')

