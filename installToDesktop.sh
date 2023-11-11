# generate a .desktop file for the application

if [[ "$OSTYPE" != "linux-gnu"* ]]; then
  echo "Skipping desktop install. Must be on Linux."
  exit 0;
fi

echo "Installing desktop file... Requires sudo permissions to continue."
cat ./.desktop/main.desktop | sed "s|{{location}}|$PWD|g" > /usr/share/applications/racer.desktop
cp public/racer.pi.png /usr/share/pixmaps/racer-pi.png

targetDesktop="/home/$(ls /home)/Desktop"

if [ -d $targetDesktop ]; then
  cp .desktop/Racer-Pi.desktop "$targetDesktop/Racer-Pi.desktop"
fi

xdg-desktop-menu forceupdate

echo "Done."
