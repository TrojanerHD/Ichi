# Ichi
A popular card game as browser game

## How to play the game
You need to host this game either on your machine or on a server.

### Hosting on your local machine
1. Download this [repository's zip](https://github.com/TrojanerHD/Ichi/archive/master.zip)
2. Extract the zip's content in an empty folder and make sure you have installed yarn or npm. Double click `build.sh` if you are on Unix (e. g. Linux or macOS) or `build.bat` if you are on Windows. After the terminal closed, head over to the next step
3. Execute `run-server.sh` or `run-server.bat` and afterward `run-client.sh` or `run-client.bat` (further details: see point 2)
4. Open a browser and type `localhost` in the address bar
5. To let your friends join, a third party application is required. In this example, I am using [ngrok](https://ngrok.com/). Note that I can **not** guarantee the safety/security of ngrok. Do this on your account and do it only if you know what you are doing
6. Create an `ngrok` account, download the ngrok executable and connect your account with it. The [tutorial on the ngrok website](https://ngrok.com/download) explains that quite well. 
7. Double click the executable and type `./ngrok http 80 -host-header="localhost:80"`. If you did everything correctly, your terminal should show information about the port you have opened. Copy the first part where it says forwarding, starting at `http://` and ending before the `->` (the red area in the screenshot below) by marking it with the cursor and pressing `Ctrl + Shift + C`. Share this link with whoever you want to play the game (presumably your friends) and you are ready to go!
![ngrok interface](https://cdn.discordapp.com/attachments/640355456187105332/679111478040723496/unknown.png)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```
Give examples
```

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Node.JS](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Typescript](https://maven.apache.org/) - Dependency Management
* [WebPack]()
* [Visual Studio Code](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc