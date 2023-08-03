# README #

Include your config.js file in the configs folder

node app -c ./config/config.js

To run as a background process under linux:
nohup node app -c ./config/config.js --arm true &


OBS: If you get "Syntax error: Unterminated quoted string":

When running on a raspberry pi make sure to run:
sudo apt-get install chromium-browser --yes

This is because puppeteer does not download the right chromium installation for arm platforms.

** RUN WITH **
npm run start -- --config ./config/<your config>.ts

PS: yes double -- is correct