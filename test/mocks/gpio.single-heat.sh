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
MIN_LANE_TIME=1
MAX_LANE_TIME=3

# ==============================================================

getRandomFloat () {
  v=$[100 + (RANDOM % 100)]$[1000 + (RANDOM % 1000)]
  v=$[$MIN_LANE_TIME + (RANDOM % ($MAX_LANE_TIME - $MIN_LANE_TIME))].${v:1:2}${v:4:3}
  echo $v
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
  mockLaneResult "$lane" `getRandomFloat` &
done

# wait for all lanes to finish
echo "Waiting realtime to make mock lane calls"
wait $(jobs -p)
echo "Done!"