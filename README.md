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
    <li><a href="#usage">Usage</a></li>
    <li><a href="#features">Features</a></li>
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

<!-- USAGE EXAMPLES -->
## Usage

You can use the ft_transcendence as you would use any other Shell to execute commands. We handled a lot of unnecessary things that were not specifially required by the Subject, which you can read more about in <a href="#features">Features</a>

Here is an example of a basic command using some of the control operators.
<img src="example.png" height="351px" width="672px">

This is a more advanced example where you can see the implementation of Here Documents, the variable used as a delimiter isn't expanded but the ones used inside of the Here Document are expanded.
<img src="example2.png" height="351px" width="672px">

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Features -->
## Features

### General:
<ul>
  <li>History of previously entered commands</li>
  <li>Search and launch the right executable (based on the PATH variable, using a relative or an absolute path)</li>
  <li>Environment variables ($ followed by a sequence of characters) expand to their values</li>
  <li>Wildcards *</li>
  <li>Ctrl-C, Ctrl-D, and Ctrl-\ behave like in bash</li>
  <li><code>’</code> (single quotes - prevent from interpreting meta-characters in quoted sequence)</li>
  <li><code>"</code> (double quotes - prevent from interpreting meta-characters in quoted sequence except for $)</li>
  <li><code>$?</code> expands to the last exit status</li>
  <li><code>|</code> Output of a command is connected to the input of the next Command</li>
  <li><code>&amp;&amp;</code> and <code>||</code> with parenthesis for priorities</li>
</ul>

### Chat:
<ul>
  <li><code>echo</code> with <code>-n</code></li>
  <li><code>cd</code> (relative or absolute path, <code>~</code> for HOME)</li>
  <li><code>pwd</code></li>
  <li><code>export</code> without arguments or with a new environment variable to be set</li>
  <li><code>unset</code></li>
  <li><code>env</code></li>
  <li><code>exit [exit_status]</code></li>
</ul>

### User:
<ul>
  <li><code>[n] &lt; file</code> Redirecting Input</li>
  <li><code>[n] &lt;&lt; limiter</code> Here Documents with environment variable handling</li>
  <li><code>[n] &gt; file</code> Redirecting Output</li>
  <li><code>[n] &gt;&gt; file</code> Appending Redirected Output</li>
</ul>


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
