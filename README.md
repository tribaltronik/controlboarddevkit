# ControlBoardDevKit
###RaspberryPi code for ControlBoard.net a IoT Platform


#####INSTALLATION INSTRUCTIONS:


- 1) Driver para wifi rtl8188eu 
https://github.com/lwfinger/rtl8188eu

- 2) Install Node.JS
http://weworkweplay.com/play/raspberry-pi-nodejs/

- 3) Install Bower
sudo npm install bower -g

- 4) Intall node-gyp
npm install -g node-gyp

- 5) Install Python
sudo apt-get install python-dev

- 6) Install and config raspberry pi as Access Point - raspberry-wifi-conf
https://github.com/sabhiram/raspberry-wifi-conf

- 7) Install Pi-Blaster:
https://github.com/sarfata/pi-blaster

- 8) Install bcm2835
http://www.raspberry-projects.com/pi/programming-in-c/c-libraries/bcm2835-by-mike-mccauley

- 9) Install Libsound2-dev:
sudo apt-get install libasound2-dev

- 10) Install Forever:
npm install forever -g


- 11) Get controlboarddevkit:
  > sudo git clone https://github.com/tribaltronik/controlboarddevkit
  > cd controlboarddevkit
  > sudo npm install


- USE INSTRUCTIONS:

1) Restart the raspberry pi;

2) Connect to WiFi AP of raspberry pi "rpi-config-ap" pass "zzzzzzzz";

3) On browser(IE,Chrome,Firefox) put this address "192.168.44.1:88" and select your WiFi network. The raspberry pi will connect to your network wait a few seconds.
