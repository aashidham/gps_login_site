const puppeteer = require('puppeteer')
const expect    = require("chai").expect
const uuid = require('uuid')

const firebase = require('firebase')
const firebaseRef = new firebase("https://the-work-app-gps.firebaseio.com/govt_log_0")


async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function load_page(with_loc,username, pw) {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});  
  const page = await browser.newPage();
  if (with_loc) {

    //simulate the HTML5 GPS coordinates on a headless browser
    await page.evaluateOnNewDocument(function() {
      navigator.geolocation.getCurrentPosition = function (cb) {
          cb({
            coords: {
              latitude: 23.129163,
              longitude: 113.264435
            }
          })
      }
    })
      
  }
  await page.goto('http://localhost:8000');
  await page.type('input#login-username',username)
  await page.type('input#login-pw',pw)
  await page.click('button#login-submit')
  return page
}

describe('GPS website', function(){
it('should redirect to success endpoint on successful login', async function() {
    var curr_username = uuid.v4()
    const page = await load_page(true,curr_username,"theworkapp0$");
    await wait(60)
    expect(page.url()).to.have.string('/success')
})

it('should have logged the GPS coordinates with successful login and HTML5 geolocation on', async function() {
    var curr_username = uuid.v4()
    await load_page(true,curr_username,"theworkapp0$");

    const sdf = firebaseRef.orderByChild("username").equalTo(curr_username).once("child_added", function(c)
    {
        var curr_hit = c.val()
        // console.log(curr_hit)
        expect(curr_hit).to.have.keys('ip','success','time','username','latitude','longitude')
    })
})


it('should have logged the GPS coordinates with failed login and HTML5 geolocation on', async function() {
    var curr_username = uuid.v4()
    await load_page(true,curr_username,"sdfsdfgsdf");

    const sdf = firebaseRef.orderByChild("username").equalTo(curr_username).once("child_added", function(c)
    {
        var curr_hit = c.val()
        // console.log(curr_hit)
        expect(curr_hit).to.have.keys('ip','success','time','username','latitude','longitude')

    })
})

it('should not have logged GPS coordinates with successful login, HTML5 geolocation off', async function() {
        var curr_username = uuid.v4()
        await load_page(false,curr_username,"theworkapp0$");
        const sdf = firebaseRef.orderByChild("username").equalTo(curr_username).once("child_added", function(c)
        {
            var curr_hit = c.val()
            expect(curr_hit).to.not.have.property("latitude")
        })
})


it('should not have logged GPS coordinates with failed login, HTML5 geolocation off', async function() {
        var curr_username = uuid.v4()
        await load_page(false,curr_username,"sdfsdfgsdf");
        const sdf = firebaseRef.orderByChild("username").equalTo(curr_username).once("child_added", function(c)
        {
            var curr_hit = c.val()
            expect(curr_hit).to.not.have.property("latitude")
        })
})

});

