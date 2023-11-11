# generate a .desktop file for the application

if [[ "$OSTYPE" != "linux-gnu"* ]]; then
  echo "Skipping desktop install. Must be on Linux."
  exit 0;
fi

echo "Installing desktop file... Requires sudo permissions to continue."
cat ./.desktop/main.desktop | sed "s|{{location}}|$PWD|g" > /usr/share/applications/racer.desktop
cp public/racer.pi.png /usr/share/pixmaps/racer-pi.png
# cp .desktop/Racer-Pi.desktop "$HOME/Desktop/Racer-Pi.desktop"

xdg-desktop-menu forceupdate

echo "Done."
