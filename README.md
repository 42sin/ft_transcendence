<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/42sin/ft_transcendence">
    <img src="readme_images/logo.png" alt="Logo" width="128" height="128">
  </a>

<h3 align="center">ft_transcendence</h3>
<p align="center">
    <a href="https://github.com/42sin/ft_transcendence/issues">Report Bug</a>
    ·
    <a href="https://github.com/42sin/ft_transcendence/issues">Request Feature</a>
  </p>
</div>


<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
	  <ul>
	  	<li><a href="#built-with">Built with</a></li>
	  </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
	<a href="#features">Features</a>
	<ul>
	    <li><a href="#general">General</a></li>
	    <li><a href="#chat-commands">Chat Commands</a></li>
	    <li><a href="#user">User</a></li>
	</ul>
    </li>
    <li>
	<a href="#usage-demo">Usage Demo</a>
	<ul>
	    <li><a href="#game">Game</a></li>
	    <li><a href="#chat">Chat</a></li>
	    <li><a href="#profile">Profile</a></li>
	</ul>
    </li>
    <li><a href="#license">License</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

#### [Go to Subject PDF]

This is the last group project of the 42 core curriculum and arguably the biggest one. It is a full-stack web application that provides an engaging and interactive platform where users can enjoy a game of traditional Pong. It is designed with a modern and user-friendly interface offering a seamless experience for gaming and social interactions.
<br>
#### Team members:
- [Gilbert]
- [Joko]
- [Sonja]
- [Anahi]
- [Ersin]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Nest][Nest.js]][Nest-url]
* [![Angular][Angular.io]][Angular-url]
* [![Postgresql][Postgresql]][Postgresql-url]
* [![Docker][Docker]][Docker-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

- API Key from [42]
- Docker/Docker-compose

To run the project, you need a .env file, I provided you with an example file inside of ./docker/ but you still need to put in your API key there. It should look something like this
   ```sh
   FORTYTWO_APP_ID="u-s0a2ud-exdc4c4502170a03960f0678cc960072f7bab69021e09b10a9b80adfde43a5150"
   FORTYTWO_APP_SECRET="s-s0a2ud-459dc0ce839266e939babac417fae1fb0be00b9443029c849693534e67394032"
   ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/42sin/ft_transcendence.git && cd ft_transcendence
   ```
2. Compile the project
   ```sh
   make
   ```
3. Connect
   ```sh
   localhost:3000/
   ```
For testing purposes, it will only run on your local system. It can also be run online, so multiple people at different locations can connect and play but you would need to change some of the configuration files and generate a new API key.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Features -->
## Features

### General:
<ul>
  <li><code>Pong Gameplay</code> Play the classic game of Pong on 3 different maps</li>
  <li><code>Chat System</code> Engage in group or private chats with other users</li>
  <li><code>Highscore Tab</code> Ranking of the best players</li>
  <li><code>User Profile</code> See their stats, add them as a friend or block them</li>
  <li><code>2FA Authentication</code> Improve your account security with Google Authenticator</li>
  <li><code>42 API Integration</code> Sign in with your 42 API credentials</li>
  <li><code>Themes</code> Choose one of 3 Color Themes to change the websites feeling</li>
</ul>

### Chat Commands:
<ul>
  <li><code>/JOIN #CHANNELNAME (PASS)</code> Create or Join an existing channel with or without a password</li>
  <li><code>/TALK_TO USERNAME</code> Private message a user</li>
  <li><code>/KICK #CHANNELNAME USERNAME</code> Kick a User from a channel</li>
  <li><code>/BAN #CHANNELNAME USERNAME</code> Ban a User from a channel</li>
  <li><code>/PART #CHANNELNAME</code> Leave a channel</li>
  <li><code>/DELETE #CHANNELNAME</code> Delete a channel</li>
  <li><code>/CHANGE_PASSWORD #CHANNELNAME (PASS)</code> Change or remove the password of a channel</li>
  <li><code>/UNMUTE</code> OR <code>/MUTE #CHANNELNAME USERNAME</code> Mute/Unmute a user of a channel</li>
  <li><code>/UNBLOCK</code> OR <code>/BLOCK USERNAME</code> Block/Unblock a user</li>
  <li><code>/ADD_ADMIN #CHANNELNAME USERNAME</code> Give someone admin privileges</li>
  <li><code>/INVITE</code> OR <code>/ACCEPT USERNAME</code> Invite/Accept to a game</li>
</ul>

### User:
<ul>
  <li><code>Change your profile picture</code></li>
  <li><code>Change your username</code></li>
  <li><code>Activate 2FA with Google Authenticator</code></li>
  <li><code>Add/Delete Friends</code></li>
  <li><code>Block/Unblock users</code></li>
  <li><code>Matchhistory</code></li>
  <li><code>Winrate as %</code></li>
</ul>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage Demo

### Game
To start a game you need to choose the map you want to play and join the waiting room. If there is someone already waiting you can join a game with them. Otherwise you will create a game and wait until someone joins.
<br>
insert video of games here
<br>

### Chat
General commands can be used without being in a channel but for the chat specific commands you need to be in a channel of course.
<br>
insert video of chats here
<br>

### Profile
Here you can change your own profile or see the stats of other users and add/delete or block/unblock them with the UI. Much easier than using the chat right?
<br>
insert video of profiles here
<br>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[Ersin]: https://github.com/42sin
[Gilbert]: https://github.com/atchoglogilbert
[Joko]: https://github.com/jpfuhl
[Sonja]: https://github.com/SRein91
[Anahi]: https://github.com/arendone
[issues-url]: https://github.com/42sin/ft_transcendence/issues
[license-url]: https://github.com/42sin/ft_transcendence/blob/master/LICENSE.txt
[Go to Subject PDF]: readme_images/en.transc_subject.pdf
[42]: https://profile.intra.42.fr/oauth/applications
[Nest.js]: https://img.shields.io/badge/-NestJs-ea2845?style=for-the-badge&logo=nestjs&logoColor=white
[Nest-url]: https://nestjs.com/
[Docker]: https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://docker.com/
[Postgresql]: https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white
[Postgresql-url]: https://postgresql.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
