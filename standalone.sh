source .env # we need this for the SERVER_PORT envar

wd="$(pwd)"

# this script is ran in a clean context where PATH is not set,
# so we have to specify the runtimes.
_node='/usr/bin/node'
_npm='/usr/bin/npm'
_python='/usr/bin/python'
updatePathCommand='export PATH="/usr/bin/:$PATH'

if [ -d "$HOME/.local/share/fnm" ]; then
  eval `$HOME/.local/share/fnm/fnm env`
  _node="$(/usr/bin/which node)"
  _npm="$(/usr/bin/which npm)"
  updatePathCommand="eval `$HOME/.local/share/fnm/fnm env`; export PATH="/usr/bin/:$HOME/.local/share/fnm:$PATH""
fi

# Run the node server, the python script
lxterminal -e "($_node $wd/server.js)" & disown
lxterminal -e "$updatePathCommand; $wd/node_modules/.bin/dotenv $_python $wd/main.py; sleep 5s" & disown

# open the browser in a new tab pointed towards our app
chromium-browser "http://localhost:$SERVER_PORT"
