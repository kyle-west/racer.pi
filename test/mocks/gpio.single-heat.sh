################################################################
# Assuming the app server is up an running, this script mocks
# the GPIO signals for a single heat of the race
################################################################

# require the envarc to make sure we are calling the right service
projRoot=`git rev-parse --show-toplevel`
source "$projRoot/.env"
applicationServiceURL="http://localhost:$SERVER_PORT"
EXT_COUNT="$1"

# configure the mock behavior
MIN_LANE_TIME=3
MAX_LANE_TIME=8

# ==============================================================

getRandomFloat () {
  printf '%s' $(echo "scale=8; $RANDOM/3276" | bc )
}

getRandomLaneTime () {
  while true; do
    laneTime=`getRandomFloat`
    (( $(bc <<< "$laneTime < $MIN_LANE_TIME || $laneTime > $MAX_LANE_TIME") )) || break
  done
  echo "$laneTime"
}

mockLaneResult () {
  lane="$1"
  laneTime="$2"
  sleep $laneTime
  echo "LANE $lane: $laneTime"
  curl -X POST "$applicationServiceURL/gpio/time?lane=$lane&time=$laneTime"
}

# ==============================================================

echo "Starting Race!"

curl -X POST "$applicationServiceURL/gpio/start"

for lane in `seq 1 ${EXT_COUNT:-$LANE_COUNT}`; do
  mockLaneResult "$lane" `getRandomLaneTime` &
done

# wait for all lanes to finish
echo "Waiting realtime to make mock lane calls"
wait $(jobs -p)
echo "Done!"