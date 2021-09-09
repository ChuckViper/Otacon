const Discord = require("discord.js")
const client = new Discord.Client()
const fetch = require("node-fetch")

//get UserResponse in JSON format from Username
async function getUserResponse(username) {
    let url = `https://api.twitter.com/2/users/by?usernames=${username}`;
    let data = await fetch(url, {
      method: 'GET',
      headers: {
      Accept : 'application/json',
      Authorization: 'Bearer TWITTER API TOKEN',
      } //end headers
    })
    return data
} // end getUserResponse

async function getTweets(userID) {
    let url = `https://api.twitter.com/2/users/${userID}/tweets?max_results=5`;
    let data = await fetch(url, {
      method: 'GET',
      headers: {
      Accept : 'application/json',
      Authorization: 'Bearer TWITTER API TOKEN',
      } //end headers
    })
    return data
} // end getTweets

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

class Horse {
  constructor(horseID, name) {
    this._name = name;
    this._horseID = horseID;
    this._position = 0;
    this._track = ``;
  }

  // getters
  get name() {
    return this._name;
  }

  get horseID() {
    return this._horseID;
  }

  get position() {
    return this._position;
  }
  
  get track() {
    return this._track;
  }

  //setters
  set name(updatedName) {
    this._name = updatedName;
  }

  set horseID(updatedID) {
    this._horseID = updatedID;
  }

  set position(updatedPosition) {
    this._position = updatedPosition;
  }

  set track(updatedTrack) {
    this._track = updatedTrack
  }
} // end Horse Class

function makeTrack (horse) {
  for(let i=0;i<4;i++) {
    let fromStart = horse[i].position - 1;
    let toFinish = 10 - horse[i].position;
    let horseTrack = ``;

    for(let a=0;a<fromStart;a++){
      horseTrack = horseTrack + `==`;          
    } // create track from Start
    horseTrack = horseTrack + `${horse[i].horseID}` 
    for(let a=0;a<toFinish;a++){
      horseTrack = horseTrack + `==`;
    } // create track to Finish
    horseTrack = horseTrack + `:checkered_flag:`
    horse[i].track = horseTrack;
  } //loops through each horse and creates a new line
  let track = `${horse[0].track} \n${horse[1].track} \n${horse[2].track} \n${horse[3].track}`
  return track
}

function advance(horse) {
  let advance = getRandomInt(2);
  if(advance == 1) {
    horse.position = horse.position + 1
  }
}

//Start Discord Bot
client.on("ready", () => {
  console.log('Logged in as ${client.user.tag}!')
})

//Ready bot for discord message events
client.on("message", msg => {
  
  //if user types ping, respond with pong
  if (msg.content === "thanks Otacon") {
    msg.reply("No problem.") 
  } // end thanks otacon

  //if user types username, call GetUserResponse to get UserID then use UserId to get most recent 5 Tweets
  if(msg.content.startsWith("$tweets")) {
    //separates username from tweets command

    username = msg.content.split("$tweets ")[1]
    getUserResponse(username).then(response => response.json())
      .then(data => {
        let userObjStr = JSON.stringify(data)
        let userID = JSON.parse(userObjStr).data[0].id
        getTweets(userID).then(response => response.json())
          .then(data => {
            let strTweetData = JSON.stringify(data)
            let arrTweets = [] 
            for(let i = 0; i < 3; i++) {
              arrTweets[i] = JSON.parse(strTweetData).data[i].text
            } // end for
          msg.channel.send(`Here are ${username}'s most recent tweets! \n \n ${arrTweets[0]} \n \n ${arrTweets[1]} \n \n ${arrTweets[2]}`)
      }) //end getTweets function
      .catch((error) => {
      console.log(error)
      }) // end catch
    }) //end getuserResponse
  }//end $tweets command

  if(msg.content.startsWith('$testing')) {
    msg.channel.send(`bullocks`).then(botMessage => {
      for(let i=0;i<5;i++) {
        setTimeout(() => botMessage.edit(`${getRandomInt(50)}`), i*5000); 
      }
    })
  }

  if(msg.content.startsWith('$horserace')) {
    //instantiate and create an array of Horses
    let blueHorse = new Horse("<:horsey00:839944550867927040>", "Secretariat")
    let greenHorse = new Horse("<:horsey01:839944550839746600>", "Always Dreaming")
    let redHorse = new Horse("<:horsey02:839944550914195506>", "California Chrome")
    let blackHorse = new Horse("<:horsey04:839944550592151613>", "Flying Ebony")
    let race = "begin"
    const horse = [blueHorse, greenHorse, redHorse, blackHorse]

    msg.channel.send(`Welcome to the Kentucky Derby! Our horses today are ${horse[0].name} ${horse[0].horseID}, ${horse[1].name} ${horse[1].horseID}, ${horse[2].name} ${horse[2].horseID}, and ${horse[3].name} ${horse[3].horseID}! Place your votes below!`)

    msg.channel.send(`${makeTrack(horse)}`).then(botMessage => {  
      botMessage.react(`${horse[0].horseID}`)
      botMessage.react(`${horse[1].horseID}`)
      botMessage.react(`${horse[2].horseID}`)
      botMessage.react(`${horse[3].horseID}`)
     while (race != 'finished') {
      for(let i = 0; i < 4; i++) {
        advance(horse[i]);
        botMessage.edit(`${makeTrack(horse)}`);
        if(horse[i].position == 10) {
           i = 4;
           race = 'finished';
          } //check to see if race is finished 

        console.log(horse[i].horseID)
        console.log(horse[i].position)
       }
     }
   })
  }
}) // end client message listener

client.login(process.env.DiscordToken)   