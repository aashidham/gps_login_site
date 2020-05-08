# gps_login

This repo contains the frontend, styling and backend code for a login page. The site uses the `HTML5 Geolocation API` on modern browsers to determine the GPS of the site visitor. Since IP address can also be used to track location, it is also stored in the GPS log.

The backend writes to a log of login attempts. This GPS log is stored in Firebase (`test mode`). The backend is built fully instead of being stubbed out.

The server runs on `node`, the frontend uses `jQuery` along with raw javascript. 

The testing suite in this repo (`test/`) uses puppeteer to create a headless browser instance, where the site is loaded and different user paths are tested.

## Installation
1. Install `node` and `npm` on your computer. (Tested to work with node `v10.15.0` and npm `v6.4.1`. Try to stick to these versions if possible.)
2. Install the `mocha` utility on your computer (`npm i -g mocha`) for running `E2E` tests.
3. Clone this repo and run `npm install` inside it. The installation might take a while, mostly because of the size of the `puppeteer` module. If you have trouble running `puppeteer`, there are useful troubleshooting tools here: https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md

## Getting started
To run the server, run `npm run server`. You should be able to load the site on `http://localhost:8000/`. Here is a screenshot of what the login page looks like. 

![Screenshot 1][Login]

Any username is accepted, but the only password that is accepted is `theworkapp0$`. On successful login, the page redirects to `http://localhost:8000/success`. You can successfully log in regardless of whether you block or allow the `HTML5 Geolocation` popup.

If I entered the username `joisdjfsdf` on the login page, here is a screenshot of the `/success` page:

![Screenshot 2][Success]

The site stores a cookie in your browser that will get written over on subsequent successful login attempts.

## Firebase Realtime Datastore

On the backend, this login attempt will be recorded. If the Geolocation HTML5 API is allowed, the following schema is written to the Firebase DB:

```
{ip:'::1', latitude:23.23798, longitude:12.2342, success:true, time:'Fri 08 May 2020 12:12:06 GMT', username:'joisdjfsdf'}
```

On the other hand, if the Geolocation HTML5 API is blocked, the following schema is written to the DB:

```
{ip:'::1', success:true, time:'Fri 08 May 2020 12:12:06 GMT', username:'joisdjfsdf'}
```

The IP address of the login attempt is recorded because this can also be used to impute lat / long coordinates after the fact in production. The `success` key represents whether or not the login attempt was successful.

## Testing suite

To run the testing suite, run `npm run test`. There are 5 total tests, stored inside the `test/` directory. Here is a screenshot with the test suite in action:

![Screenshot 3][Testing]

## Next Steps

1. The site needs to have a valid HTTPS certificate. It is unsafe to enter passwords over an `http` connection. 
2. The Firebase DB needs to have restricted read / write rules so that only the webserver can write to it and the testing suite can read from it. 
3. The login page needs to not accept only one password and many usernames. Instead, there needs to be a `register` flow so that accounts can be created. At this point, authentication will require the entering of the correct username / password pair.
4. The webserver should not store the correct password in plaintext in the source code. Instead, the entered password needs to be hashed and salted using a module like `bcrypt`. At that point the hashed password can be stored in a database and compared to entered one.
5. The testing suite needs to cover pre-HTML5 browsers where the Geolocation API is not available.

## Assumptions

1. We assume that the browser is HTML5 enabled.
2. We assume a non-malicious router setup with safe WiFi (`http` assumes good intent from all parties)
3. We assume the reliability of the Firebase service. If this service is down, database writes may fail, which could prevent successful authentication.
4. If the HTML5 Geolocation API is blocked, we assume that the IP isn't spoofed. If the API is blocked and the IP is spoofed, the login attempt may have no idea where the request came from.
5. We assume that the user isn't visually impaired. There has been little focus on making the site accessible to those surfing the net with disabilities.
6. We assume that this site is accessed from Earth. GPS won't work well on Mars ;)


[Login]: https://i.imgur.com/8YjMgZp.png
[Success]: https://i.imgur.com/05LfivJ.png
[Testing]: https://i.imgur.com/OXIP21F.png
