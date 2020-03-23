# Ichi
A popular card game as browser game

## How to play the game
You need to host this game either on your machine or on a server.

1. With this step you will download and run the game. It depends on your operating system what you will have to do:

| Windows | Unix |
| --- | --- |
| 0. Install yarn from [here](https://classic.yarnpkg.com/en/docs/install#windows-stable) and git from [here](https://git-scm.com/download/win) if you have not already<br>1. Open the explorer and find a location where the game can be installed. Note that a subfolder is automatically generated when downloading. So you can, for example, just head to your Documents folder<br>2. Shift + Right Click on an empty space in the folder<br>3. Select `Open PowerShell window here` from the dropdown menu<br>4. Type `git clone https://github.com/TrojanerHD/Ichi` and hit enter<br>5. Double click `build.bat` and wait until the terminal is closed<br><br>---<br>You will have to do the following steps each time you want to play this game<br>---<br><br>6. Open the directory where Ichi is installed (e. g. `Documents/Ichi`) if you are not already<br>7. Double click `run-server.bat`. If everything works this should open a terminal with no content. You can put that terminal in the background (e. g. minimize it)<br>8. Double click `run-client.bat`. You can put this terminal in the background too | 0. Install yarn as described [here](https://classic.yarnpkg.com/en/docs/install#debian-stable) and git as described [here](https://git-scm.com/download/linux) if you have not already<br>1. Open the terminal and find a location where the game can be installed. Note that a subfolder is automatically generated when downloading. So you can, for example, just type `cd ~/Documents`<br>2. Type `git clone https://github.com/TrojanerHD/Ichi` and hit enter<br>3. Execute `cd Ichi`<br>4. Execute `chmod ug+x *.sh`. This basically gives you the rights to execute the sh files<br>5. Execute `./build.sh`. Wait until this task is finished<br><br>---<br>You will have to do the following steps each time you want to play this game<br>---<br><br>6. `cd` into the folder of your installation (e. g. `cd ~/Documents/Ichi`) if you are not already<br>7. Execute `./run-server.sh &`<br>8. Execute `./run-client.sh &`. This should print a long compilation progress into the terminal. You can ignore that |
2. Open a browser and type `localhost:6942` in the address bar
3. If you want to play this game with others across the internet, unfortunately there is only one way for now: You have to share your IP adress with them. They can just paste the adress, appended with `:6942`, into the adress bar of their browser and you can play together

## How to set a password
After you [installed and run this game for the first time](#How-to-play-this-game) there should be a `room_password.txt`. Open a SHA256 hasher, e. g. [this one](https://emn178.github.io/online-tools/sha256.html), and input a password. Click on `Hash` and paste the output into the `room_password.txt` file located under `./server/build`

## Built With

* [Node.JS](https://nodejs.org/en/) - Server side JavaScript
* [Typescript](https://www.typescriptlang.org/)
* [WebPack](https://webpack.js.org/) - Client side bundling
* [Visual Studio Code](https://code.visualstudio.com/) - The used editor

## Authors

* [Trojaner](https://github.com/TrojanerHD)

See also the list of [contributors](https://github.com/TrojanerHD/Ichi/contributors) who participated in this project.
